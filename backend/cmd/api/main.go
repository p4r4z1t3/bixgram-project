package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/p4r4z1te/bixgram/internal/database"
	"github.com/p4r4z1te/bixgram/internal/ipfs"
	"github.com/p4r4z1te/bixgram/internal/relay"
	"github.com/p4r4z1te/bixgram/internal/router"
)

func main() {
	// Загружаем .env
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("No .env file found, using defaults")
	}

	// База данных
	database.InitDB()

	// IPFS сервис
	ipfsURL := os.Getenv("IPFS_API_URL")
	if ipfsURL == "" {
		ipfsURL = "localhost:5001"
	}
	ipfsService := ipfs.NewService(ipfsURL)
	log.Printf("IPFS Service connected to %s", ipfsURL)

	// Менеджер Nostr-реле
	manager := relay.NewManager()
	go manager.Run()

	// Маршруты
	r := router.SetupRouter(manager, ipfsService)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("BIXGRAM RELAY starting on :%s", port)
	
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start relay: ", err)
	}
}

