package router

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/p4r4z1te/bixgram/internal/handlers"
	"github.com/p4r4z1te/bixgram/internal/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Настройка CORS (чтобы фронт мог общаться с бэком)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // Порт Vite по умолчанию
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Публичные маршруты
	auth := r.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
	}

	// Защищенные маршруты
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/me", handlers.GetMe)
	}

	// Пинг для проверки
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "online",
			"message": "BIXGRAM_API_ESTABLISHED",
		})
	})

	return r
}
