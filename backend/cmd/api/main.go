package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/p4r4z1te/bixgram/internal/database"
	"github.com/p4r4z1te/bixgram/internal/router"
)

func main() {
	// Загружаем .env файл. Если его нет - останавливаемся, смысла дальше идти нет.
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Critical error: .env file NOT FOUND in current directory. Error: %v", err)
	}

	// Инициализируем базу данных перед запуском сервера
	database.InitDB()

	// Настраиваем маршруты
	r := router.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("BIXGRAM API starting on port :%s", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}
