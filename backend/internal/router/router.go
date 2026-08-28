package router

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/p4r4z1te/bixgram/internal/handlers"
	"github.com/p4r4z1te/bixgram/internal/ipfs"
	"github.com/p4r4z1te/bixgram/internal/relay"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func SetupRouter(manager *relay.Manager, ipfsService *ipfs.Service) *gin.Engine {
	r := gin.Default()

	// Настройка CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// WebSocket эндпоинт Nostr-реле
	r.GET("/ws", func(c *gin.Context) {
		relay.HandleWebSocket(manager, c.Writer, c.Request)
	})

	// Public Profile API
	r.GET("/api/profiles/:pubkey", handlers.GetProfile())

	// IPFS Upload
	r.POST("/upload", handlers.UploadToIPFS(ipfsService))

	// Admin API
	admin := r.Group("/api/admin")
	{
		admin.GET("/profiles", handlers.GetProfiles())
		admin.GET("/events", handlers.GetEvents())
		admin.GET("/stats", handlers.GetStats())
	}

	// Эндпоинт для мониторинга (Prometheus)
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Корневой эндпоинт для проверки работы
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "online",
			"name":    "BIXGRAM Relay & API Server",
			"version": "1.0.0",
			"ws":      "/ws",
			"ping":    "/ping",
		})
	})

	// Пинг для проверки
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "online",
			"message": "BIXGRAM_RELAY_ESTABLISHED",
		})
	})

	return r
}

