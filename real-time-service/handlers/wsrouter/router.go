package wsrouter

import (
	"realTimeService/models"

	"github.com/gin-gonic/gin"
)

// MessageHandler is an interface that defines a method for handling incoming messages.
// It takes a gin.Context, a client model, an incoming message, and a token as parameters.
// The method returns an error if the handling fails.
type MessageHandler interface {
	Handle(ctx *gin.Context, client *models.Client,
		msg models.IncomingMessage, token string) error
}

// Router is a struct that holds a map of message types to their corresponding handlers.
// It provides methods to register handlers and to handle incoming messages based on their type.
type Router struct {
	handlers map[models.MessageType]MessageHandler
}

// NewRouter creates a new Router instance with an initialized handlers map.
// It is used to register different message handlers for various message types.
func NewRouter() *Router {
	return &Router{
		handlers: make(map[models.MessageType]MessageHandler),
	}
}

// RegisterHandler registers a new message handler for a specific message type.
// It adds the handler to the router's handlers map, allowing the router to route messages
// to the appropriate handler based on the message type.
func (r *Router) RegisterHandler(msgType models.MessageType, handler MessageHandler) {
	r.handlers[msgType] = handler
}

// Handle processes an incoming message by routing it to the appropriate handler based on its type.
// It takes a gin.Context, a client model, and an incoming message as parameters.
// If the message type is not supported, it returns a 400 error response.
// If the handler exists, it calls the handler's Handle method to process the message.
func (r *Router) Handle(ctx *gin.Context, client *models.Client,
	msg models.IncomingMessage, token string) error {
	handler, exists := r.handlers[msg.Type]
	if !exists {
		ctx.JSON(400, gin.H{"error": "unsupported message type"})
		return nil
	}
	return handler.Handle(ctx, client, msg, token)
}