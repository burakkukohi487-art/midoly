package handler

import (
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"errors"
	"math/big"
	"net/http"
	"time"

	"github.com/go-sql-driver/mysql"
)

// Roomが存在するか確認
func healthRoom(roomID int, db *sql.DB) error {
	// カラム検索
	var dummy int
	row := db.QueryRow("select id from room where id = ?", roomID)
	err := row.Scan(&dummy)

	if err == sql.ErrNoRows {
		// Roomが見つからない場合
		return errors.New("ルームが存在しません")
	}

	if err != nil {
		// それ以外のエラー
		return err
	}

	return nil
}

// Room招待ID生成
func generateInviteCode(roomID int, db *sql.DB) (string, error) {
	// ルームが存在するか確認
	err := healthRoom(roomID, db)
	if err != nil {
		return "", err
	}

	// 招待IDの有効期限は8時間
	expiresAt := time.Now().Add(8 * time.Hour)

	// 招待ID生成
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var inviteCode string
	// ユニークな招待IDを生成するまでやり直す
	for attempt := 0; attempt < 5; attempt++ {
		// 招待ID生成
		for i := 0; i < 6; i++ {
			n, err := rand.Int(rand.Reader, big.NewInt(36))
			if err != nil {
				return "", err
			}
			inviteCode += string(chars[n.Int64()])
		}

		// DB登録を試みる
		_, err = db.Exec("update room set inviteCode = ?, expiresAt = ? where id = ?", inviteCode, expiresAt, roomID)
		if err != nil {
			// 登録失敗
			var mysqlErr *mysql.MySQLError
			if errors.As(err, &mysqlErr) && mysqlErr.Number == 1062 {
				// 重複エラーの場合はもう一度生成しなおす
				inviteCode = ""
			} else {
				// 重複以外のエラー
				return "", err
			}
		} else {
			// 登録成功
			return inviteCode, nil
		}
	}

	// DB登録に5回失敗
	return "", errors.New("招待ID生成に失敗しました")
}

// ルーム作成リクエストの構造体
type CreateRoomRequest struct {
	Name string `json:"name"`
}

// ルーム作成
func CreateRoom(db *sql.DB) {
	http.HandleFunc("/room/create", func(w http.ResponseWriter, r *http.Request) {
		// userIDをセッションから取得
		userID, err := getUserID(r, db)
		if err != nil {
			// ログインしていない場合
			http.Error(w, "ログインしていません", http.StatusUnauthorized)
			return
		}

		// ルーム名取得
		var req CreateRoomRequest
		// CreateRoomRequest構造体へデコード
		json.NewDecoder(r.Body).Decode(&req)

		// ルーム登録
		result, err := db.Exec("insert into room (name) values (?)", req.Name)
		if err != nil {
			http.Error(w, "サーバーエラー", http.StatusInternalServerError)
			return
		}

		// ルームID取得
		roomID, err := result.LastInsertId()
		if err != nil {
			http.Error(w, "サーバーエラー", http.StatusInternalServerError)
			return
		}

		// 招待コード取得
		inviteCode, err := generateInviteCode(int(roomID), db)
		if err != nil {
			http.Error(w, "サーバーエラー", http.StatusInternalServerError)
			return
		}

		// ルーム作成者をRoomMemberに登録
		_, err = db.Exec("insert into roommember (userId, roomId) values (?, ?)", userID, roomID)
		if err != nil {
			http.Error(w, "サーバーエラー", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"room_id":     roomID,
			"invite_code": inviteCode,
		})
	})
}
