# Token Cost Calculator Module

A standalone module for calculating AI token costs across different providers and content types.

## Features

- Calculate estimated costs for various content types
- Compare costs across different AI providers
- Project monthly expenses based on usage
- Support for OpenAI, Anthropic, and Ollama providers

## Installation

```bash
npm install @agents/token-cost-calculator
```

## Usage

### As a Library

```javascript
const TokenCostCalculator = require('@agents/token-cost-calculator');

const calculator = new TokenCostCalculator();
const estimate = calculator.calculateEstimatedCost('political_content', 'openai', 'gpt-4');
console.log(estimate);
```

### As a Standalone API Service

```bash
npm start
```

The service will start on port 3005 by default.

## API Endpoints

- `GET /health` - Health check
- `GET /api/tokens/content-types` - Get available content types
- `GET /api/tokens/estimate` - Get cost estimate for specific content type
- `GET /api/tokens/comparison` - Get provider comparison for content type
- `GET /api/tokens/projection` - Get monthly projection
- `GET /api/tokens/providers` - Get current provider costs

## Environment Variables

- `PORT` - Port to run the server on (default: 3005)
- `NODE_ENV` - Environment (development/production)

## Supported Content Types

- Political Content
- AI Content
- Viral Shorts
- Educational Content
- Audio Analysis
- Multi-Media Analysis

## Supported Providers

- OpenAI (GPT-4, GPT-4-Turbo, GPT-3.5-Turbo, Whisper)
- Anthropic (Claude-3 Opus, Sonnet, Haiku)
- Ollama (Llama2, CodeLlama, Mistral)