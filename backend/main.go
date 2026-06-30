package main

import (
	"midoly/backend/db"
	"midoly/backend/handler"
	"net/http"
)

func main() {
	db := db.Connect()
	handler.Signup(db)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "ok"}`))
	})

	http.ListenAndServe(":8080", nil)
}
