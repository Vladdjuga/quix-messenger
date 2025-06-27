package models

import "github.com/google/uuid"

type MessageType string

const (
	SendMessage            MessageType = "sendMessage"
	ConnectUserToChat                  = MessageType("connectUserToChat")
	DisconnectUserFromChat             = MessageType("disconnectUserFromChat")
)

type IncomingMessage struct {
	Type   MessageType `json:"type"`
	ChatId uuid.UUID   `json:"chatId"`
	Text   string      `json:"text"`
}
