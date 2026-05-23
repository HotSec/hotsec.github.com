package handler

import (
	"log/slog"

	"github.com/gin-gonic/gin"
	gws "github.com/gorilla/websocket"

	"onlinenote/internal/user"
	ws "onlinenote/internal/websocket"
)

type WebSocketHandler struct {
	Hub      *ws.Hub
	Upgrader gws.Upgrader
}

func (h *WebSocketHandler) Handle(c *gin.Context) {
	conn, err := h.Upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		slog.Warn("websocket upgrade error", "error", err)
		return
	}

	userID := c.Query("userId")
	userName := c.Query("userName")
	docID := c.Query("docId")
	color := c.Query("color")

	if userID == "" {
		userID = user.GenerateID()
	}
	if userName == "" {
		userName = "Anonymous"
	}
	if docID == "" {
		docID = "all-md"
	}
	if color == "" {
		color = user.AssignColor(len(h.Hub.GetDocUsers(docID)))
	}

	client := &ws.Client{
		Hub:      h.Hub,
		Conn:     conn,
		Send:     make(chan []byte, 256),
		UserID:   userID,
		UserName: userName,
		Color:    color,
		DocID:    docID,
	}

	h.Hub.Register(client)

	go client.WritePump()
	go client.ReadPump()
}