package main

import (
	"midoly/backend/db"
	"midoly/backend/handler"
	"net/http"
	"time"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// CORSヘッダー付与をする共通処理
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// プリフライトリクエスト(OPTIONS)なら処理を終了する
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// それ以外は本来のハンドラーへ
		next.ServeHTTP(w, r)
	})
}

func main() {
	db := db.Connect()
	handler.Signup(db)
	handler.Login(db)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "ok"}`))
	})

	// 期限切れのセッションがないかゴルーチンで監視
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		for range ticker.C {
			db.Exec("delete from session where expires at < ?", time.Now())
		}
	}()

	http.ListenAndServe(":8080", corsMiddleware(http.DefaultServeMux))
}
