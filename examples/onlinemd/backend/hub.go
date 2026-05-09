package main

import (
	"context"
	"sync"

	"github.com/redis/go-redis/v9"
)

type Hub struct {
	mu    sync.RWMutex
	rooms map[string]map[*Client]struct{}
	rdb   *redis.Client
	store *PGStore
}

func NewHub(rdb *redis.Client, store *PGStore) *Hub {
	return &Hub{
		rooms: make(map[string]map[*Client]struct{}),
		rdb:   rdb,
		store: store,
	}
}

func (h *Hub) Run() {
	ctx := context.Background()
	pubsub := h.rdb.Subscribe(ctx, "collab:*")
	ch := pubsub.Channel()
	for msg := range ch {
		data := []byte(msg.Payload)
		docID := msg.Channel[len("collab:"):]
		h.mu.RLock()
		for c := range h.rooms[docID] {
			select {
			case c.send <- data:
			default:
			}
		}
		h.mu.RUnlock()
	}
}

func (h *Hub) Join(docID string, c *Client) {
	h.mu.Lock()
	if h.rooms[docID] == nil {
		h.rooms[docID] = make(map[*Client]struct{})
	}
	h.rooms[docID][c] = struct{}{}
	h.mu.Unlock()
}

func (h *Hub) Leave(docID string, c *Client) {
	h.mu.Lock()
	if room, ok := h.rooms[docID]; ok {
		delete(room, c)
		if len(room) == 0 {
			delete(h.rooms, docID)
		}
	}
	h.mu.Unlock()
}

func (h *Hub) Broadcast(docID string, data []byte) {
	h.rdb.Publish(context.Background(), "collab:"+docID, string(data))
}
