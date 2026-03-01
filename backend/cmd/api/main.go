package main

import (
	"github.com/gin-gonic/gin"
	"github.com/p4r4z1te/bixgram/internal/database"
)

func main() {
	// Инициализируем базу данных перед запуском сервера
	database.InitDB()

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "online",
			"message": "BIXGRAM_API_ESTABLISHED",
		})
	})

	r.Run(":8080")
}
