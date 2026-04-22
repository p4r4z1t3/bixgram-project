package database

import (
	"github.com/p4r4z1te/bixgram/internal/models"
)

// QueryEvents - Запрос событий из БД по фильтрам Nostr
func QueryEvents(filters []models.Filter) ([]models.Event, error) {
	var events []models.Event
	
	// Для прототипа: объединяем результаты всех фильтров
	// В реальном реле это должен быть один сложный SQL запрос
	for _, filter := range filters {
		query := DB.Model(&models.Event{})
		
		if len(filter.IDs) > 0 {
			query = query.Where("id IN ?", filter.IDs)
		}
		if len(filter.Authors) > 0 {
			query = query.Where("pub_key IN ?", filter.Authors)
		}
		if len(filter.Kinds) > 0 {
			query = query.Where("kind IN ?", filter.Kinds)
		}
		if filter.Since > 0 {
			query = query.Where("created_at >= ?", filter.Since)
		}
		if filter.Until > 0 {
			query = query.Where("created_at <= ?", filter.Until)
		}
		
		var filterEvents []models.Event
		limit := filter.Limit
		if limit <= 0 || limit > 500 {
			limit = 500
		}
		
		if err := query.Order("created_at desc").Limit(limit).Find(&filterEvents).Error; err != nil {
			return nil, err
		}
		
		events = append(events, filterEvents...)
	}
	
	return events, nil
}
