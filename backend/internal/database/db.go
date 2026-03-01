package database

import (
	"fmt"
	"log"

	"github.com/p4r4z1te/bixgram/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := "host=localhost user=bixgram_user password=bixgram_password dbname=bixgram_db port=5432 sslmode=disable"
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	fmt.Println("Database connection established")

	// Автомиграция: GORM сам создаст таблицу, если её нет
	err = DB.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatal("AutoMigrate failed: ", err)
	}

	fmt.Println("Database migrated successfully")
}
