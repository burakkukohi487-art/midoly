package handler

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func generateSessionID() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

type SignupRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

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

		_, err = db.Exec("insert into user (name, email, password) values (?, ?, ?)", req.Name, req.Email, string(hashed))
		if err != nil {
			http.Error(w, "サーバーエラー", http.StatusInternalServerError)
			return
		}

		w.Write([]byte(`{ "message": "ok" }`))
		fmt.Println("DB登録成功")
	})
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

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

		sessionID := generateSessionID()
		expiresAt := time.Now().Add(8 * time.Hour)

		_, err = db.Exec("insert into session (id, userId, expiresAt) values (?, ?, ?)", sessionID, id, expiresAt)
		if err != nil {
			http.Error(w, "サーバーエラー", http.StatusInternalServerError)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "session_id",
			Value:    sessionID,
			Expires:  expiresAt,
			HttpOnly: true,                 // JSからアクセス不可にする(XSS対策)
			SameSite: http.SameSiteLaxMode, // 他サイトからのリクエストにはCookieを送らない
			Path:     "/",
		})

		w.Write([]byte(`{"message": "ok"}`))

	})
}
