# @agents/audio-to-text

Audio to Text Service using OpenAI Whisper for transcription.

## Installation

```bash
npm install @agents/audio-to-text
```

## Usage

### As a Library

```javascript
const AudioToTextService = require('@agents/audio-to-text');

const audioService = new AudioToTextService({
  tempDir: './temp'
});

// Convert audio to text
const result = await audioService.convertAudioToText('./audio/sample.mp3', {
  language: 'de'
});

console.log('Transcription result:', result);

// Validate audio file
const validation = await audioService.validateAudioFile('./audio/sample.mp3');
console.log('Validation result:', validation);
```

### As a Standalone Service

```bash
npm start
```

The service will start on port 3012.

## API Endpoints

- `GET /health` - Health check
- `POST /api/audio/transcribe` - Convert audio to text
- `POST /api/audio/validate` - Validate audio file

## Configuration

The service can be configured with the following options:

- `tempDir` - Directory for temporary files (default: 'temp')

To use OpenAI Whisper, set the `OPENAI_API_KEY` environment variable.

## License

ISC