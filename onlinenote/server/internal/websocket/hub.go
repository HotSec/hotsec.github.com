package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	Hub      *Hub
	Conn     *websocket.Conn
	Send     chan []byte
	UserID   string
	UserName string
	Color    string
	DocID    string
}

type Message struct {
	Type     string          `json:"type"`
	DocID    string          `json:"docId"`
	UserID   string          `json:"userId"`
	UserName string          `json:"userName,omitempty"`
	Color    string          `json:"color,omitempty"`
	Data     json.RawMessage `json:"data,omitempty"`
}

type Hub struct {
	clients    map[*Client]bool
	docClients map[string]map[*Client]bool
	broadcast  chan *BroadcastMessage
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

type BroadcastMessage struct {
	DocID   string
	Data    []byte
	Exclude *Client
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		docClients: make(map[string]map[*Client]bool),
		broadcast:  make(chan *BroadcastMessage, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			if h.docClients[client.DocID] == nil {
				h.docClients[client.DocID] = make(map[*Client]bool)
			}
			h.docClients[client.DocID][client] = true
			h.mu.Unlock()

			h.notifyUserList(client.DocID)
			h.broadcastJoin(client)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				if clients, ok := h.docClients[client.DocID]; ok {
					delete(clients, client)
					if len(clients) == 0 {
						delete(h.docClients, client.DocID)
					}
				}
				close(client.Send)
			}
			h.mu.Unlock()

			h.notifyUserList(client.DocID)
			h.broadcastLeave(client)

		case msg := <-h.broadcast:
			h.mu.RLock()
			clients := h.docClients[msg.DocID]
			h.mu.RUnlock()

			for client := range clients {
				if client == msg.Exclude {
					continue
				}
				select {
				case client.Send <- msg.Data:
				default:
					h.mu.Lock()
					close(client.Send)
					delete(h.clients, client)
					if docClients, ok := h.docClients[msg.DocID]; ok {
						delete(docClients, client)
					}
					h.mu.Unlock()
				}
			}
		}
	}
}

func (h *Hub) Register(client *Client) {
	h.register <- client
}

func (h *Hub) Unregister(client *Client) {
	h.unregister <- client
}

func (h *Hub) Broadcast(docID string, data []byte, exclude *Client) {
	h.broadcast <- &BroadcastMessage{
		DocID:   docID,
		Data:    data,
		Exclude: exclude,
	}
}

func (h *Hub) GetDocUsers(docID string) []map[string]string {
	h.mu.RLock()
	defer h.mu.RUnlock()

	clients := h.docClients[docID]
	users := make([]map[string]string, 0, len(clients))
	for client := range clients {
		users = append(users, map[string]string{
			"userId":   client.UserID,
			"userName": client.UserName,
			"color":    client.Color,
		})
	}
	return users
}

func (h *Hub) broadcastJoin(client *Client) {
	msg, _ := json.Marshal(Message{
		Type:     "user-joined",
		DocID:    client.DocID,
		UserID:   client.UserID,
		UserName: client.UserName,
		Color:    client.Color,
	})
	h.Broadcast(client.DocID, msg, client)
}

func (h *Hub) broadcastLeave(client *Client) {
	msg, _ := json.Marshal(Message{
		Type:   "user-left",
		DocID:  client.DocID,
		UserID: client.UserID,
	})
	h.Broadcast(client.DocID, msg, nil)
}

func (h *Hub) notifyUserList(docID string) {
	users := h.GetDocUsers(docID)
	data, _ := json.Marshal(map[string]interface{}{
		"type":  "user-list",
		"docId": docID,
		"users": users,
	})
	h.Broadcast(docID, data, nil)
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister(c)
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(1024 * 1024)
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("websocket read error: %v", err)
			}
			break
		}

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("websocket unmarshal error: %v", err)
			continue
		}

		msg.UserID = c.UserID
		msg.DocID = c.DocID

		switch msg.Type {
		case "edit", "cursor", "selection":
			broadcastData, _ := json.Marshal(msg)
			c.Hub.Broadcast(c.DocID, broadcastData, c)

		case "save":
			log.Printf("document save request from %s", c.UserID)
		}

		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
