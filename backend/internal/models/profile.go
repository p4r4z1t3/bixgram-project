package models

import "time"

// Profile - Структура для отображения метаданных пользователя (Kind 0)
type Profile struct {
	PubKey      string    `json:"pubkey" gorm:"primaryKey"`
	Name        string    `json:"name"`
	DisplayName string    `json:"display_name"`
	About       string    `json:"about"`
	Picture     string    `json:"picture"`
	Banner      string    `json:"banner"`
	Website     string    `json:"website"`
	LUD16       string    `json:"lud16"` // Lightning address
	NIP05       string    `json:"nip05"` // Nostr address verification
	UpdatedAt   time.Time `json:"updated_at"`
	IsAdmin     bool      `json:"is_admin" gorm:"default:false"`
	IsBanned    bool      `json:"is_banned" gorm:"default:false"`
}
