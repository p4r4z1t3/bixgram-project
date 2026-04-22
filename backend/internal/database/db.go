package database

import (
	"fmt"
	"log"
	"os"

	"github.com/p4r4z1te/bixgram/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	sslmode := os.Getenv("DB_SSLMODE")

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		host, user, password, dbname, port, sslmode)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	fmt.Println("Database connection established")

	// Автомиграция: GORM сам создаст таблицу, если её нет
	err = DB.AutoMigrate(&models.Event{}, &models.Profile{})
	if err != nil {
		log.Fatal("AutoMigrate failed: ", err)
	}

	fmt.Println("Relay storage migrated successfully")
}
