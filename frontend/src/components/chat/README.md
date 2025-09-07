# Chat Components Documentation

This directory contains all the chat-related components for the Quix Messenger application.

## Components

### ChatBox
The main chat window that displays the selected chat's header, messages, and message input.

**Props:**
- `selectedChat`: The currently selected chat (or null if none selected)
- `messages`: Array of messages for the selected chat
- `currentUserId`: ID of the current user
- `onSendMessage`: Callback function when a message is sent
- `isLoading`: Whether messages are being loaded

### ChatList
Displays a list of all chats with search functionality.

**Props:**
- `chats`: Array of chats to display
- `selectedChatId`: ID of the currently selected chat
- `onChatSelect`: Callback function when a chat is selected

### ChatListItem
Individual chat item in the chat list showing avatar, name, last message, and unread count.

**Props:**
- `chat`: The chat object to display
- `isSelected`: Whether this chat is currently selected
- `onClick`: Callback function when clicked

### MessageList
Displays a list of messages grouped by date with auto-scroll to bottom.

**Props:**
- `messages`: Array of messages to display
- `currentUserId`: ID of the current user (to determine message ownership)
- `isLoading`: Whether messages are being loaded

### MessageItem
Individual message component showing message content, timestamp, and read status.

**Props:**
- `message`: The message object to display
- `isOwn`: Whether the message belongs to the current user
- `currentUserId`: ID of the current user
- `senderName`: Name of the message sender (optional)

### MessageInput
Input component for typing and sending new messages.

**Props:**
- `onSendMessage`: Callback function when a message is sent
- `disabled`: Whether the input is disabled
- `placeholder`: Placeholder text for the input

## Types

All types are defined in `@/lib/types` and match the backend data structures:

- `Message`: Message entity matching backend MessageEntity
- `Chat`: Chat entity matching backend ChatEntity
- `ChatWithLastMessage`: Extended chat type with UI-specific properties
- `User`: User entity matching backend UserEntity
- `MessageStatus`: Enum matching backend MessageStatus
- `ChatType`: Enum matching backend ChatType
- `ChatRole`: Enum matching backend ChatRole

## Architecture

The components follow a simple, clean design pattern:
- No complex CSS animations or transitions
- Simple hover states and basic styling
- Responsive design using Tailwind CSS
- Type-safe with TypeScript
- Follows backend data structure conventions
