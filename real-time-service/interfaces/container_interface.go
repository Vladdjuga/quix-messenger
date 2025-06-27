package interfaces

import (
	"realTimeService/clients"
	"realTimeService/configuration"
	"realTimeService/handlers/wsrouter"
	"realTimeService/hubs"
)

type Container interface {
	GetHub() *hubs.MainHub
	GetMessageClient() *clients.MessageServiceClient
	GetChatClient() *clients.ChatServiceClient
	GetRouter() *wsrouter.Router
	InitializeProviders(cfg *configuration.Config)
	Close() error
}
