package relay
import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/p4r4z1te/bixgram/internal/models"
	"golang.org/x/time/rate"
)

var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}

type Client struct {
	conn          *websocket.Conn
	send          chan []byte
	Authenticated bool
	PubKey        string
	Challenge     string
	Limiter       *rate.Limiter
	Subscriptions map[string][]models.Filter
	mu            sync.RWMutex
}

type Manager struct {
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	sync.RWMutex
}

func NewManager() *Manager {
	return &Manager{
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (m *Manager) Run() {
	log.Println("Nostr Relay Manager started")
	for {
		select {
		case client := <-m.register:
			m.Lock()
			m.clients[client] = true
			m.Unlock()
			log.Println("New WebSocket connection")

			// NIP-42: Generate unique challenge
			challenge := generateChallenge()
			client.Challenge = challenge
			client.send <- []byte(fmt.Sprintf(`["AUTH", "%s"]`, challenge))
		case client := <-m.unregister:
			m.Lock()
			if _, ok := m.clients[client]; ok {
				delete(m.clients, client)
				close(client.send)
			}
			m.Unlock()
			log.Println("Client disconnected")
		}
	}
}

func (m *Manager) Broadcast(event models.Event) {
	m.RLock()
	defer m.RUnlock()

	eventJSON, _ := json.Marshal(event)

	for client := range m.clients {
		client.mu.RLock()
		for subID, filters := range client.Subscriptions {
			for _, filter := range filters {
				if filter.Matches(event) {
					client.send <- []byte(fmt.Sprintf(`["EVENT", "%s", %s]`, subID, string(eventJSON)))
					break
				}
			}
		}
		client.mu.RUnlock()
	}
}

func generateChallenge() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "fallback-challenge"
	}
	return hex.EncodeToString(b)
}

func HandleWebSocket(manager *Manager, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil { 
		log.Printf("Upgrade error: %v", err)
		return 
	}
	client := &Client{
		conn:    conn, 
		send:    make(chan []byte, 256),
		Limiter: rate.NewLimiter(20, 10),
		Subscriptions: make(map[string][]models.Filter),
	}
	manager.register <- client
	go client.readPump(manager)
	go client.writePump()
}

func (c *Client) readPump(m *Manager) {
	defer func() { m.unregister <- c; c.conn.Close() }()
	c.conn.SetReadLimit(1024 * 100) 

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil { break }
		
		if !c.Limiter.Allow() {
			log.Printf("Rate limit exceeded for client")
			c.send <- []byte(`["NOTICE", "Rate limit exceeded"]`)
			continue
		}
		
		response, err := ProcessMessage(message, c, m)
		if err != nil {
			log.Printf("Relay process error: %v", err)
			c.send <- []byte(fmt.Sprintf(`["NOTICE", "Error: %s"]`, err.Error()))
			continue
		}
		if response != nil { c.send <- response }
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()
	for {
		message, ok := <-c.send
		if !ok { return }
		c.conn.WriteMessage(websocket.TextMessage, message)
	}
}
