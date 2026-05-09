package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait     = 10 * time.Second
	pongWait      = 60 * time.Second
	pingPeriod    = (pongWait * 9) / 10
	snapshotEvery = 50
)

type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
	doc  string
	user string
	ops  int
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func ServeWS(hub *Hub, w http.ResponseWriter, r *http.Request, docID, user string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade error:", err)
		return
	}

	if state, err := hub.store.Load(r.Context(), docID); err == nil && state != nil {
		conn.WriteMessage(websocket.BinaryMessage, state)
	}

	c := &Client{
		hub:  hub,
		conn: conn,
		send: make(chan []byte, 256),
		doc:  docID,
		user: user,
	}
	hub.Join(docID, c)

	go c.writePump()
	go c.readPump()
}

func (c *Client) readPump() {
	defer func() {
		c.conn.Close()
		c.hub.Leave(c.doc, c)
	}()
	c.conn.SetReadLimit(1 << 20)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, msg, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
		c.hub.Broadcast(c.doc, msg)
		c.ops++
		if c.ops%snapshotEvery == 0 {
			go c.hub.store.Save(context.Background(), c.doc, msg)
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			c.conn.WriteMessage(websocket.BinaryMessage, msg)
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
