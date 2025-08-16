# Real-time Service TS

A TypeScript Express rework of the real-time service, replacing the previous Go implementation.

## Features

- TypeScript with Express
- Basic Hello World API
- Health check endpoint
- Development mode with hot reload

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The server will start on port 3000 with hot reload enabled.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## API Endpoints

- `GET /` - Hello World message
- `GET /health` - Health check status

## Project Structure

```
src/
  ├── app.ts          # Main application file
  └── ...             # Future source files
```

## Development

This project uses:
- TypeScript for type safety
- Express for the web framework
- Nodemon for development hot reload
- ts-node for running TypeScript directly
