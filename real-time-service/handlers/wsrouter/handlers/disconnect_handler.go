package handlers

import (
	"log"
	"realTimeService/interfaces"
	"realTimeService/models"
	"github.com/gin-gonic/gin"
)
// DisconnectHandler implements the MessageHandler interface
// for handling user disconnections from chats.
type DisconnectHandler struct {
	container interfaces.Container
}
// Handle processes the incoming message to disconnect a user from a chat.
// It removes the user from the chat in the main hub.
func NewDisconnectHandler(container interfaces.Container) *DisconnectHandler {
	return &DisconnectHandler{
		container: container,
	}
}
// Handle disconnects the user from a chat based on the incoming message.
// It validates the message and removes the user from the chat through the container's main hub.
func (h *DisconnectHandler) Handle(ctx *gin.Context, client *models.Client,
	msg models.IncomingMessage, token string) error {
	log.Println("DisconnectHandler called.")
	err := h.container.GetHub().RemoveUserFromChat(client.UserId)
	if err != nil {
		log.Println("Error disconnecting user from chat:", err)
		return err
	}
	log.Printf("User %s disconnected from chat %s", client.UserId, msg.ChatId)
	return nil
}