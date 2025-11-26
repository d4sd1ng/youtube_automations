# Script Generation Service Module

A standalone script generation module for creating video scripts using LLMs with advanced prompting techniques.

## Features

- Generate video scripts using advanced LLM prompting techniques
- Support for multiple content types and tones
- Customizable script length and audience targeting
- Advanced prompting features (Chain of Thought, Self-Reflection, Few-Shot Examples)
- Multi-channel script generation capability
- Script storage and management
- RESTful API for easy integration
- Standalone server mode

## Installation

```bash
npm install @agents/script-generation
```

## Usage

### As a Library

```javascript
const ScriptGenerationService = require('@agents/script-generation');

// Initialize service
const scriptService = new ScriptGenerationService({
  scriptsDir: './data/scripts', // Optional custom directory
  templatesDir: './data/templates/scripts',
  promptTemplatesDir: './data/prompt-templates'
});

// Generate a script
const result = await scriptService.generateScript({
  topic: 'Introduction to AI',
  contentType: 'educational',
  targetLength: '2-3min',
  tone: 'professional',
  audience: 'students and professionals'
});

console.log('Script generated with ID:', result.scriptId);
```

### As a Standalone API Service

```bash
npm start
```

The service will start on port 3003 by default.

## API Endpoints

- `GET /health` - Health check
- `POST /api/scripts/generate` - Generate a new script
- `POST /api/scripts/generate-multi` - Generate scripts for multiple channels
- `GET /api/scripts/:scriptId` - Get script by ID
- `GET /api/scripts` - List all scripts
- `DELETE /api/scripts/:scriptId` - Delete script

## Advanced Prompting Features

1. **Chain of Thought**: Enable step-by-step reasoning in script generation
2. **Self-Reflection**: Automatic quality assessment and improvement
3. **Few-Shot Examples**: Provide examples to guide script structure
4. **Role Play Context**: Define specific roles for more targeted content
5. **Custom Instructions**: Add specific requirements for the script

## Script Quality Assessment

The service includes built-in quality assessment features:
- Content relevance scoring
- Engagement potential analysis
- Tone consistency checking
- Structure quality evaluation
- Keyword optimization assessment

## Environment Variables

- `PORT` - Port to run the server on (default: 3003)
- `NODE_ENV` - Environment (development/production)

## Monetization Focus

This service is designed with monetization in mind:
- Optimized for high-engagement content creation
- Supports multiple channels and content types
- Professional quality that increases viewer retention
- Configurable for different audience segments
- Integration-ready for content management systems

## Content Types

The service supports various content types:
- Educational content
- Entertainment scripts
- Product demonstrations
- Tutorial videos
- Explainer videos
- Storytelling content