package handler

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

// セッションID生成
func generateSessionID() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

// セッション発行
func createSession(w http.ResponseWriter, db *sql.DB, userID int) error {
	sessionID := generateSessionID()
	expiresAt := time.Now().Add(8 * time.Hour)

	_, err := db.Exec("insert into session (id, userId, expiresAt) values (?, ?, ?)", sessionID, userID, expiresAt)
	if err != nil {
		return err
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Expires:  expiresAt,
		HttpOnly: true,                 // JSからアクセス不可にする(XSS対策)
		SameSite: http.SameSiteLaxMode, // 他サイトからのリクエストにはCookieを送らない(CSRF対策、リンク遷移は除く)
		Path:     "/",
	})

	return nil
}

// 新規登録リクエスト構造体
type SignupRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// 新規登録
func Signup(db *sql.DB) {
	http.HandleFunc("/signup", func(w http.ResponseWriter, r *http.Request) {
		// 受取先の構造体を用意
		var req SignupRequest

		// リクエストのBodyのJSONをreqのアドレスに書き込む
		json.NewDecoder(r.Body).Decode(&req)
		hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "サーバーエラー", http.StatusInternalServerError)
			return
		}

		// ユーザーをDBに登録する(emailはUNIQUE制約があるため、登録済みのemailだとここでエラーになる)
		result, err := db.Exec("insert into user (name, email, password) values (?, ?, ?)", req.Name, req.Email, string(hashed))
		if err != nil {
			// MySQLのエラーコード1062はUNIQUE制約違反(=email重複)を表す
			var mysqlErr *mysql.MySQLError
			if errors.As(err, &mysqlErr) && mysqlErr.Number == 1062 {
				http.Error(w, "既に登録されているメールアドレスです", http.StatusConflict)
				return
			}
			http.Error(w, "サーバーエラー", http.StatusInternalServerError)
			return
		}

		// 直前のinsertで発行された自動採番のuser.idを取得する
		id, err := result.LastInsertId()
		if err != nil {
			http.Error(w, "サーバーエラー", http.StatusInternalServerError)
			return
		}

		// 登録した新規ユーザーでそのままログイン状態にする(セッション発行+Cookieセット)
		err = createSession(w, db, int(id))
		if err != nil {
			http.Error(w, "サーバーエラー", http.StatusInternalServerError)
			return
		}

		w.Write([]byte(`{ "message": "ok" }`))
		fmt.Println("DB登録成功")
	})
}

// ログインリクエスト構造体
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// ログイン
func Login(db *sql.DB) {
	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		json.NewDecoder(r.Body).Decode(&req)

		// DBからEmailで検索
		var id int
		var hashedPassword string
		row := db.QueryRow("select id, password from user where email = ?", req.Email)
		err := row.Scan(&id, &hashedPassword)
		if err != nil {
			http.Error(w, "メールアドレスもしくはパスワードが違います", http.StatusUnauthorized)
			return
		}

		// パスワード照合
		err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password))
		if err != nil {
			http.Error(w, "メールアドレスもしくはパスワードが違います", http.StatusUnauthorized)
			return
		}

		err = createSession(w, db, id)
		if err != nil {
			http.Error(w, "サーバーエラー", http.StatusInternalServerError)
			return
		}

		w.Write([]byte(`{"message": "ok"}`))

	})
}

// ユーザーIDとセッション取得
func getUserID(r *http.Request, db *sql.DB) (int, error) {
	// ブラウザから送られてきたCookieを取り出す
	cookie, err := r.Cookie("session_id")
	// セッションがなければエラーを返す
	if err != nil {
		return 0, err
	}

	// DBでセッションIDを検索(期限切れも同時に弾く)
	row := db.QueryRow(
		"select userId from session where id = ? and expiresAt > ?",
		cookie.Value, time.Now(),
	)
	var userID int
	err = row.Scan(&userID)
	// セッションが無効ならloggedIn:falseを返す
	if err != nil {
		return 0, err
	}

	// セッションが有効ならokを返す
	return userID, nil
}

// セッションチェック
func Me(db *sql.DB) {
	http.HandleFunc("/me", func(w http.ResponseWriter, r *http.Request) {
		userID, err := getUserID(r, db)
		// セッションがなければloggedIn:falseを返す
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{"loggedIn": false})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"loggedIn": true, "user_id": userID})
	})
}
