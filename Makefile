SHELL := /bin/bash
.SHELLFLAGS := -ec

SERVICES = message-service real-time-service user-service frontend

.PHONY: build up down restart

build:
	@echo "Building all Docker images..."
	@for service in $(SERVICES); do \
		docker build -t $$service ./$$service || exit 1; \
	done

up:
	@echo "Starting services with docker-compose..."
	docker-compose up -d

down:
	@echo "Stopping all containers..."
	docker-compose down

restart: down build up