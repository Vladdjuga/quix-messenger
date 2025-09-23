#!/bin/bash

# Avatar Migration Script
# This script copies default avatars from the application directory to the persistent storage volume

AVATAR_STORAGE_PATH="${AVATAR_STORAGE_PATH:-/var/lib/quix-messenger/avatars}"
WWWROOT_PATH="${WWWROOT_PATH:-/app/wwwroot}"
DEFAULT_AVATAR_SOURCE="$WWWROOT_PATH/uploads/avatars/default-avatar.jpg"
DEFAULT_AVATAR_DEST="$AVATAR_STORAGE_PATH/default-avatar.jpg"

echo "Starting avatar migration..."
echo "Source: $DEFAULT_AVATAR_SOURCE"
echo "Destination: $DEFAULT_AVATAR_DEST"

# Create avatar storage directory if it doesn't exist
if [ ! -d "$AVATAR_STORAGE_PATH" ]; then
    echo "Creating avatar storage directory: $AVATAR_STORAGE_PATH"
    mkdir -p "$AVATAR_STORAGE_PATH"
fi

# Copy default avatar if it doesn't exist in the storage location
if [ ! -f "$DEFAULT_AVATAR_DEST" ]; then
    if [ -f "$DEFAULT_AVATAR_SOURCE" ]; then
        echo "Copying default avatar from $DEFAULT_AVATAR_SOURCE to $DEFAULT_AVATAR_DEST"
        cp "$DEFAULT_AVATAR_SOURCE" "$DEFAULT_AVATAR_DEST"
        echo "Default avatar copied successfully"
    else
        echo "Warning: Default avatar not found at $DEFAULT_AVATAR_SOURCE"
        echo "Creating placeholder default avatar"
        echo "Default avatar placeholder" > "$DEFAULT_AVATAR_DEST"
    fi
else
    echo "Default avatar already exists at $DEFAULT_AVATAR_DEST"
fi

echo "Avatar migration completed"