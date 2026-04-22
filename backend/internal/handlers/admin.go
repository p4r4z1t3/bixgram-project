package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/p4r4z1te/bixgram/internal/database"
	"github.com/p4r4z1te/bixgram/internal/models"
)

// GetProfiles возвращает список всех профилей
func GetProfiles() gin.HandlerFunc {
	return func(c *gin.Context) {
		var profiles []models.Profile
		if err := database.DB.Find(&profiles).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, profiles)
	}
}

// GetEvents возвращает список последних событий
func GetEvents() gin.HandlerFunc {
	return func(c *gin.Context) {
		var events []models.Event
		if err := database.DB.Order("created_at desc").Limit(100).Find(&events).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, events)
	}
}

// GetProfile возвращает профиль конкретного пользователя
func GetProfile() gin.HandlerFunc {
	return func(c *gin.Context) {
		pubkey := c.Param("pubkey")
		var profile models.Profile
		if err := database.DB.First(&profile, "pub_key = ?", pubkey).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
			return
		}
		c.JSON(http.StatusOK, profile)
	}
}

// Stats возвращает краткую статистику
func GetStats() gin.HandlerFunc {
	return func(c *gin.Context) {
		var userCount int64
		var eventCount int64
		var musicCount int64

		database.DB.Model(&models.Profile{}).Count(&userCount)
		database.DB.Model(&models.Event{}).Count(&eventCount)
		database.DB.Model(&models.Event{}).Where("kind = ?", 1069).Count(&musicCount)

		c.JSON(http.StatusOK, gin.H{
			"users":  userCount,
			"events": eventCount,
			"music":  musicCount,
		})
	}
}
