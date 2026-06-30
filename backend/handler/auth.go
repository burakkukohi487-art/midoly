package handler

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

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
