package handlers

import (
	"log"
	"net/http"
	"realTimeService/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"realTimeService/interfaces"
	"encoding/json"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type WsHandler struct {
	container interfaces.Container
}

func NewWsHandler(container interfaces.Container) *WsHandler {
	log.Println("Creating new WsHandler")
	return &WsHandler{container: container}
}

func (h *WsHandler) Handle(ctx *gin.Context) {
	log.Println("WsHandler called.")

	userId := ctx.GetString("user_sub")
	token := ctx.GetString("auth_token")

	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	client := models.NewClient(uuid.MustParse(userId), nil, conn)
	ctx.Set("ws_user_id", userId)
	ctx.Set("ws_auth_token", token)
	ctx.Set("ws_client", client)

	h.container.GetHub().AddClient(client)

	for {
		_, msgBytes, err := conn.ReadMessage()
		if err != nil {
			log.Println("WebSocket read error:", err)
			break
		}
		log.Println("Message received:", string(msgBytes))
		var msg models.IncomingMessage
		err = json.Unmarshal(msgBytes, &msg)
		err = h.container.GetRouter().Handle(ctx, client, msg, token)
		if err != nil {
			log.Println("WebSocket router handle error:", err)
			break
		}
	}
}
