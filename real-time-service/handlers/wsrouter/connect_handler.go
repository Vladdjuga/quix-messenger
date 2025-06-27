package wsrouter

import (
	"realTimeService/interfaces"
	"realTimeService/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ConnectHandler implements the MessageHandler interface for handling user connections to chats.
type ConnectHandler struct {
	container interfaces.Container
}

// Handle processes the incoming message to connect a user to a chat.
func NewConnectHandler(container interfaces.Container) *ConnectHandler {
	return &ConnectHandler{
		container: container,
	}
}

// Handle connects the user to a chat based on the incoming message.
// It validates the message and adds the user to the chat through the container's main hub.
func (h *ConnectHandler) Handle(ctx *gin.Context, client *models.Client,
	msg models.IncomingMessage, token string) error {
	// Validate the message
	if msg.ChatId == (uuid.UUID{}) {
		ctx.JSON(400, gin.H{"error": "invalid chat ID"})
		return nil
	}
	// Check if user is in the chat in chat client(grpc)
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
	// Connect the user to the chat through the container's main hub
	err = h.container.GetHub().AddClientToChat(client.UserId, msg.ChatId)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "failed to connect user to chat"})
		return err
	}
	return nil
}
