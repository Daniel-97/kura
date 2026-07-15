.DEFAULT_GOAL := help
SHELL := /bin/bash

UID := $(shell id -u)
GID := $(shell id -g)

.PHONY: help setup dev backend frontend build test lint check docker-up docker-down docker-logs fix-perms

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-13s\033[0m %s\n", $$1, $$2}'

setup: ## First-time setup: download PocketBase binary + install frontend deps
	@test -x pocketbase || ./scripts/setup.sh
	@test -d frontend/node_modules || (cd frontend && npm install)
	@echo "Setup complete. Run 'make dev' to start."

dev: setup ## Run backend (:8090) and frontend (:5173) together; Ctrl+C stops both
	@trap 'kill 0' EXIT; \
	./pocketbase serve & \
	cd frontend && npm run dev

backend: ## Run PocketBase only (:8090)
	./pocketbase serve

frontend: ## Run Vite dev server only (:5173)
	cd frontend && npm run dev

build: ## Production build of the frontend → pb_public/
	cd frontend && npm run build

lint: ## Type-check the frontend
	cd frontend && npm run lint

test: ## Run frontend tests
	cd frontend && npm run test

check: lint test ## Type-check + tests

docker-up: ## Build and start the Docker stack (container runs as your user)
	@mkdir -p pb_data
	KURA_UID=$(UID) KURA_GID=$(GID) docker compose up -d --build

docker-down: ## Stop the Docker stack
	docker compose down

docker-logs: ## Tail Docker logs
	docker compose logs -f kura

fix-perms: ## Reclaim pb_data ownership (needs sudo; use if Docker ever ran as root)
	sudo chown -R $(UID):$(GID) pb_data
