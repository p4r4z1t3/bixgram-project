package models

// Filter - Nostr-совместимый фильтр (NIP-01)
type Filter struct {
	IDs     []string `json:"ids,omitempty"`
	Authors []string `json:"authors,omitempty"`
	Kinds   []int    `json:"kinds,omitempty"`
	Since   int64    `json:"since,omitempty"`
	Until   int64    `json:"until,omitempty"`
	Limit   int      `json:"limit,omitempty"`
	// Теги: #e, #p и др. Для упрощения пока поддержим основные
	Tags    map[string][]string `json:"-,omitempty"` 
}

func (f Filter) Matches(event Event) bool {
	if len(f.IDs) > 0 {
		found := false
		for _, id := range f.IDs {
			if event.ID == id { found = true; break }
		}
		if !found { return false }
	}

	if len(f.Authors) > 0 {
		found := false
		for _, author := range f.Authors {
			if event.PubKey == author { found = true; break }
		}
		if !found { return false }
	}

	if len(f.Kinds) > 0 {
		found := false
		for _, kind := range f.Kinds {
			if event.Kind == kind { found = true; break }
		}
		if !found { return false }
	}

	if f.Since > 0 && event.CreatedAt < f.Since { return false }
	if f.Until > 0 && event.CreatedAt > f.Until { return false }

	return true
}
