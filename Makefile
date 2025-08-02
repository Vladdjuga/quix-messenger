SHELL := /bin/bash
.SHELLFLAGS := -ec

SERVICES = message-service real-time-service user-service frontend

.PHONY: build
build: $(patsubst %,build-service-%,$(SERVICES))
	@echo "All Docker images built successfully!"

build-service-%:
	@echo "Building Docker image for '$*'"
	@docker build -t $* ./$*

.PHONY: up
up:
	@echo "Starting services with docker-compose..."
	@docker-compose up -d

.PHONY: down
down:
	@echo "Stopping all containers..."
	@docker-compose down

.PHONY: restart
restart: down build up