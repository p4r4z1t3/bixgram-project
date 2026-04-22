package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/p4r4z1te/bixgram/internal/ipfs"
)

// UploadToIPFS принимает файл через multipart/form-data и загружает его в IPFS
func UploadToIPFS(ipfsService *ipfs.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
			return
		}

		f, err := file.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
			return
		}
		defer f.Close()

		cid, err := ipfsService.Upload(c.Request.Context(), f)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload to IPFS: " + err.Error()})
			return
		}

		// Автоматически закрепляем файл
		err = ipfsService.Pin(c.Request.Context(), cid)
		if err != nil {
			// Логируем ошибку, но не прерываем ответ, так как файл уже загружен
			c.JSON(http.StatusOK, gin.H{
				"cid":     cid,
				"warning": "Failed to pin CID: " + err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"cid": cid,
			"url": "http://127.0.0.1:8082/ipfs/" + cid, // Локальный гейтвей
		})
	}
}
