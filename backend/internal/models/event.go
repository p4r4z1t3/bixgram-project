package models

import (
	"encoding/json"
)

// Event - Nostr-совместимое событие (NIP-01)
type Event struct {
	ID        string    `json:"id" gorm:"primaryKey"`         // sha256 от [0, pubkey, created_at, kind, tags, content]
	PubKey    string    `json:"pubkey" gorm:"index;not null"` // Публичный ключ автора (hex)
	CreatedAt int64     `json:"created_at" gorm:"index;not null"`
	Kind      int       `json:"kind" gorm:"index;not null"`   // Тип события (0-Metadata, 1-Text, 94-Music)
	Tags      Tags      `json:"tags" gorm:"type:jsonb;not null"`
	Content   string    `json:"content" gorm:"not null"`
	Sig       string    `json:"sig" gorm:"not null"`          // Подпись Schnorr (hex)
}

// Tags - Тип для хранения тегов в JSONB
type Tags [][]string

func (t *Tags) Scan(value interface{}) error {
	return json.Unmarshal(value.([]byte), t)
}

func (t Tags) Value() (interface{}, error) {
	return json.Marshal(t)
}
