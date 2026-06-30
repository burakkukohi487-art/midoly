package db

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func Connect() *sql.DB {
	db, err := sql.Open("mysql", "root:@tcp(localhost:3306)/midoly")
	if err != nil {
		log.Fatal(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("DB接続成功")

	return db
}
