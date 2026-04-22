package relay

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/p4r4z1te/bixgram/internal/crypto"
	"github.com/p4r4z1te/bixgram/internal/database"
	"github.com/p4r4z1te/bixgram/internal/models"
)

func ProcessMessage(message []byte, client *Client, manager *Manager) ([]byte, error) {
	var raw []json.RawMessage
	if err := json.Unmarshal(message, &raw); err != nil { return nil, err }
	
	var label string
	if err := json.Unmarshal(raw[0], &label); err != nil { return nil, err }
	log.Printf("Received message type: %s", label)

	switch label {
	case "AUTH":
		return handleAuth(raw[1], client)
	case "EVENT":
		return handleEvent(raw[1], client, manager)
	case "REQ":
		return handleReq(raw[1:], client)
	case "CLOSE":
		var subID string
		if err := json.Unmarshal(raw[1], &subID); err != nil { return nil, err }
		handleClose(subID, client)
		return nil, nil
	default:
		return nil, fmt.Errorf("unknown type: %s", label)
	}
}

func handleReq(raw []json.RawMessage, client *Client) ([]byte, error) {
	var subID string
	if err := json.Unmarshal(raw[0], &subID); err != nil {
		return nil, fmt.Errorf("invalid subID")
	}

	var filters []models.Filter
	for i := 1; i < len(raw); i++ {
		var f models.Filter
		if err := json.Unmarshal(raw[i], &f); err != nil {
			continue
		}
		filters = append(filters, f)
	}

	client.mu.Lock()
	client.Subscriptions[subID] = filters
	client.mu.Unlock()

	// Получаем исторические данные
	events, err := database.QueryEvents(filters)
	if err != nil {
		return nil, fmt.Errorf("db query failed: %v", err)
	}

	// Отправляем события
	for _, event := range events {
		eventJSON, _ := json.Marshal(event)
		client.send <- []byte(fmt.Sprintf(`["EVENT", "%s", %s]`, subID, string(eventJSON)))
	}

	// Конец исторических данных
	client.send <- []byte(fmt.Sprintf(`["EOSE", "%s"]`, subID))

	return nil, nil
}

func handleClose(subID string, client *Client) {
	client.mu.Lock()
	delete(client.Subscriptions, subID)
	client.mu.Unlock()
	log.Printf("Subscription %s closed for client", subID)
}

func handleAuth(rawEvent json.RawMessage, client *Client) ([]byte, error) {
	var event models.Event
	if err := json.Unmarshal(rawEvent, &event); err != nil {
		return nil, fmt.Errorf("invalid auth event format")
	}

	// NIP-42: kind must be 22242
	if event.Kind != 22242 {
		return nil, fmt.Errorf("invalid auth event kind: %d", event.Kind)
	}

	// NIP-42: verify challenge tag
	foundChallenge := false
	for _, tag := range event.Tags {
		if len(tag) >= 2 && tag[0] == "challenge" {
			if tag[1] == client.Challenge {
				foundChallenge = true
				break
			}
		}
	}

	if !foundChallenge {
		return nil, fmt.Errorf("challenge mismatch or missing")
	}
	
	ok, err := crypto.VerifySignature(event.PubKey, event.Sig, event.ID)
	if err != nil || !ok {
		return nil, fmt.Errorf("auth signature verification failed")
	}

	client.Authenticated = true
	client.PubKey = event.PubKey
	log.Printf("Client %s authenticated successfully via NIP-42", event.PubKey[:8])
	
	return []byte(`["OK", "auth", true, "auth success"]`), nil
}

func handleEvent(rawEvent json.RawMessage, client *Client, manager *Manager) ([]byte, error) {
	var event models.Event
	if err := json.Unmarshal(rawEvent, &event); err != nil {
		return nil, fmt.Errorf("invalid event format")
	}

	// Исключения для AUTH: Kind 0 (Метаданные профиля) можно слать без логина
	if !client.Authenticated && event.Kind != 0 {
		return nil, fmt.Errorf("auth required for kind %d", event.Kind)
	}

	// Валидация подписи
	ok, _ := crypto.VerifySignature(event.PubKey, event.Sig, event.ID)
	if !ok {
		return nil, fmt.Errorf("invalid signature")
	}

	// Сохранение в БД
	if err := database.DB.Create(&event).Error; err != nil {
		return nil, fmt.Errorf("db save failed: %v", err)
	}

	// Обработка спец. типов
	if event.Kind == 0 {
		updateProfile(event)
	}

	// NIP-01: Broadcast to all active subscriptions
	manager.Broadcast(event)

	log.Printf("Event %s (kind %d) saved and broadcast from %s", event.ID[:8], event.Kind, event.PubKey[:8])
	return []byte(fmt.Sprintf(`["OK", "%s", true, ""]`, event.ID)), nil
}

func updateProfile(event models.Event) {
	var meta map[string]interface{}
	if err := json.Unmarshal([]byte(event.Content), &meta); err != nil {
		log.Printf("Failed to parse metadata content: %v", err)
		return
	}

	profile := models.Profile{
		PubKey:      event.PubKey,
		Name:        fmt.Sprint(meta["name"]),
		DisplayName: fmt.Sprint(meta["display_name"]),
		About:       fmt.Sprint(meta["about"]),
		Picture:     fmt.Sprint(meta["picture"]),
		Banner:      fmt.Sprint(meta["banner"]),
		Website:     fmt.Sprint(meta["website"]),
		LUD16:       fmt.Sprint(meta["lud16"]),
		NIP05:       fmt.Sprint(meta["nip05"]),
	}

	if err := database.DB.Save(&profile).Error; err != nil {
		log.Printf("Failed to update profile for %s: %v", event.PubKey[:8], err)
	} else {
		log.Printf("Profile updated for %s", event.PubKey[:8])
	}
}

