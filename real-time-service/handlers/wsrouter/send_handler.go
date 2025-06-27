package wsrouter

import (
	"realTimeService/interfaces"
	"realTimeService/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// implements MessageHandler interface
type SendHandler struct {
	container interfaces.Container
}
// NewSendHandler creates a new SendHandler instance
// It initializes the handler with the provided dependency injection container.
func NewSendHandler(container interfaces.Container) *SendHandler {
	return &SendHandler{
		container: container,
	}
}
// Handle processes the incoming message to send a message in a chat.
// It validates the message, checks if the user is in the chat,
// and sends the message to the gRPC service and the chat through the container's main hub.
// It returns an error if any step fails, and sends appropriate JSON responses to the client.
func (h *SendHandler) Handle(ctx *gin.Context, client *models.Client,
	msg models.IncomingMessage, token string) error {
	// Validate the message
	if msg.ChatId == (uuid.UUID{}) || msg.Text == "" {
		ctx.JSON(400, gin.H{"error": "invalid message"})
		return nil
	}
	// User must be in the chat to send a message
	exists, err := h.container.GetChatClient().UserChatExists(ctx,
		client.UserId.String(), msg.ChatId.String(), token)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "failed to check user chat existence"})
		return err
	}
	if !exists {
		ctx.JSON(400, gin.H{"error": "user not in chat"})
		return nil
	}
	// Check if the user is connected to the chat
	if !h.container.GetHub().IsUserInChat(client.UserId, msg.ChatId) {
		ctx.JSON(400, gin.H{"error": "user not connected to chat"})
		return nil
	}
	// Send the message to the gRPC service first
	err = h.container.GetMessageClient().SendMessage(ctx,
		msg.ChatId.String(), client.UserId.String(), msg.Text, token)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "failed to send message to gRPC service"})
		return err
	}
	// Send the message to the chat through the container's main hub
	out_msg := models.NewMessage(msg.Text, msg.ChatId, client.UserId)
	err = h.container.GetHub().SendMessageToChat(msg.ChatId, out_msg)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "failed to send message"})
		return err
	}
	return nil
}