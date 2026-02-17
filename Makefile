# Makefile
.PHONY: help install dev build test lint clean docker-build docker-run docker-stop

# Default target
help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Build for production"
	@echo "  make test         - Run tests"
	@echo "  make lint         - Run linter"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run   - Run Docker container"
	@echo "  make docker-stop  - Stop Docker container"

# Install dependencies
install:
	npm install

# Start development server
dev:
	npm run dev

# Build for production
build:
	npm run build

# Run tests
test:
	npm test

# Run linter
lint:
	npm run lint

# Clean build artifacts
clean:
	rm -rf dist node_modules .cache coverage

# Docker commands
docker-build:
	docker build -t chatbot-frontend .

docker-run:
	docker-compose up -d

docker-stop:
	docker-compose down

# Full deployment
deploy: build docker-build docker-run
	@echo "Deployment complete!"

---

# scripts/setup.sh
#!/bin/bash

echo "🚀 Setting up ChatBot Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your API configuration"
fi

# Create required directories
echo "📁 Creating directories..."
mkdir -p public

echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "To build for production, run:"
echo "  npm run build"

---

# scripts/deploy.sh
#!/bin/bash

echo "🚀 Deploying ChatBot Frontend..."

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t chatbot-frontend .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

# Stop existing container
echo "🛑 Stopping existing container..."
docker-compose down

# Start new container
echo "🚀 Starting new container..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start container"
    exit 1
fi

echo "✅ Deployment complete!"
echo "🌐 Application is running at http://localhost:3000"

# Show container status
echo ""
echo "📊 Container status:"
docker-compose ps