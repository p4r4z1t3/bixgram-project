package models

import "time"

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"unique;not null"`
	Password  string    `json:"-"`
	Bio       string    `json:"bio"`
	Location  string    `json:"location"`
	CreatedAt time.Time `json:"created_at"`
}
