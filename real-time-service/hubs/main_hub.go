package hubs

import (
	"encoding/json"
	"fmt"
	"log"
	"realTimeService/models"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type MainHub struct {
	Clients map[uuid.UUID]*models.Client
	Chats   map[uuid.UUID]*models.Chat
	mut     sync.RWMutex
}

func NewMainHub() *MainHub {
	return &MainHub{
		Clients: make(map[uuid.UUID]*models.Client),
		Chats:   make(map[uuid.UUID]*models.Chat),
		mut:     sync.RWMutex{},
	}
}
func (h *MainHub) IsUserInChat(userId, chatId uuid.UUID) bool {
	h.mut.RLock()
	defer h.mut.RUnlock()
	client, ok := h.Clients[userId]
	if !ok {
		log.Printf("Client %s not found in hub", userId)
		return false
	}
	if client.Chat == nil {
		log.Printf("Client %s is not connected to any chat", userId)
		return false
	}
	if client.Chat.ID != chatId {
		log.Printf("Client %s is not connected to chat %s", userId, chatId)
		return false
	}
	log.Printf("Client %s is connected to chat %s", userId, chatId)
	return true
}

func (h *MainHub) AddClient(client *models.Client) {
	h.mut.Lock()
	defer h.mut.Unlock()
	h.Clients[client.UserId] = client
	log.Printf("Client %s added to hub", client.UserId)
}

// AddClientToChat This function is used to add a chatId to a client.
// It is called when a user joins a chat.
func (h *MainHub) AddClientToChat(userId, chatId uuid.UUID) error {
	h.mut.Lock()
	defer h.mut.Unlock()
	client, ok := h.Clients[userId]
	if !ok {
		return fmt.Errorf("client not found")
	}
	chat, ok := h.Chats[chatId]
	if !ok {
		chat = models.NewChat(chatId)
		h.Chats[chatId] = chat
		log.Printf("New chat created with ID %s", chatId)
	}
	client.Chat = chat
	chat.AddClient(client)
	log.Printf("Client %s connected to chat %s", client.UserId, chat.ID)
	if len(chat.Clients) == 1 {
		log.Printf("New chat created with ID %s for client %s", chat.ID, client.UserId)
	} else {
		log.Printf("Client %s joined existing chat %s", client.UserId, chat.ID)
	}
	return nil
}

// RemoveUserFromChat This function is used to remove a chatId from a client.
// It is called when a user leaves a chat.
func (h *MainHub) RemoveUserFromChat(userId uuid.UUID) error {
	h.mut.Lock()
	defer h.mut.Unlock()
	client, ok := h.Clients[userId]
	if !ok {
		return fmt.Errorf("client not found")
	}
	if client.Chat == nil {
		log.Printf("Client %s is not connected to any chat", client.UserId)
		return fmt.Errorf("client is not connected to any chat")
	}
	chat, ok := h.Chats[client.Chat.ID]
	if !ok {
		return fmt.Errorf("chat not found")
	}
	client.Chat = nil
	chat.RemoveClient(client)
	if len(chat.Clients) == 0 {
		delete(h.Chats, chat.ID) // Remove the chat if no clients are left
		log.Printf("Chat %s removed as it has no clients", chat.ID)
	} else {
		log.Printf("Client %s disconnected from chat %s", client.UserId, chat.ID)
	}
	return nil
}

func (h *MainHub) RemoveClient(userId uuid.UUID) {
	h.mut.Lock()
	defer h.mut.Unlock()
	delete(h.Clients, userId)
	log.Printf("Client %s removed from hub", userId)
	chat, ok := h.Chats[userId]
	if ok {
		chat.RemoveClient(h.Clients[userId])
		if len(chat.Clients) == 0 {
			delete(h.Chats, chat.ID) // Remove the chat if no clients are left
			log.Printf("Chat %s removed as it has no clients", chat.ID)
		} else {
			log.Printf("Client %s removed from chat %s", userId, chat.ID)
		}
	}
}
func (h *MainHub) GetClient(userId uuid.UUID) *models.Client {
	h.mut.RLock()
	defer h.mut.RUnlock()
	client, ok := h.Clients[userId]
	if !ok {
		return nil
	}
	log.Printf("Client %s retrieved from hub", userId)
	return client
}
func (h *MainHub) SendMessageToChat(chatId uuid.UUID, message *models.Message) error {
	h.mut.RLock()
	chat, ok := h.Chats[chatId]
	if !ok {
		h.mut.RUnlock()
		return fmt.Errorf("chat not found")
	}
	clients := append([]*models.Client{}, chat.Clients...)
	h.mut.RUnlock()
	messageBytes, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("error marshalling message: %w", err)
	}
	for _, client := range clients {
		err := client.Conn.WriteMessage(websocket.TextMessage, messageBytes)
		if err != nil {
			log.Printf("error sending message to client %s: %v, removing client", client.UserId, err)
			h.RemoveClient(client.UserId)
			continue // Skip to the next client if there's an error
		}
	}
	return nil
}
