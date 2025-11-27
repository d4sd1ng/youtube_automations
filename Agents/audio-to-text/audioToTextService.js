const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

class AudioToTextService {
  constructor(options = {}) {
    // Initialize OpenAI only if API key is available
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      this.hasOpenAI = true;
    } else {
      console.warn('⚠️ OpenAI API key not configured - using mock transcription');
      this.openai = null;
      this.hasOpenAI = false;
    }

    // Allow customization of temp directory
    this.tempDir = options.tempDir || path.join(__dirname, 'temp');
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Convert audio file to text using OpenAI Whisper
   * @param {string} audioPath - Path to audio file
   * @param {object} options - Processing options
   * @returns {Promise<object>} - Transcription result
   */
  async convertAudioToText(audioPath, options = {}) {
    try {
      console.log('🎵 Starting audio-to-text conversion...');

      // Prepare audio file (convert if needed)
      const processedAudioPath = await this.prepareAudioFile(audioPath);

      // Use OpenAI Whisper for transcription
      const transcription = await this.transcribeWithWhisper(processedAudioPath, options);

      // Clean up temporary files
      this.cleanupTempFile(processedAudioPath);

      return {
        success: true,
        text: transcription.text,
        language: transcription.language || 'de',
        duration: transcription.duration,
        confidence: transcription.confidence || 0.9,
        timestamp: new Date().toISOString(),
        metadata: {
          originalFile: path.basename(audioPath),
          processedFile: path.basename(processedAudioPath),
          service: 'whisper-openai'
        }
      };

    } catch (error) {
      console.error('❌ Audio-to-text conversion failed:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Prepare audio file for transcription (convert format, reduce size)
   * @param {string} inputPath - Input audio file path
   * @returns {Promise<string>} - Path to processed file
   */
  async prepareAudioFile(inputPath) {
    const outputPath = path.join(this.tempDir, `processed_${Date.now()}.mp3`);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .audioChannels(1)
        .audioFrequency(16000)
        .format('mp3')
        .on('end', () => {
          console.log('✅ Audio preprocessing completed');
          resolve(outputPath);
        })
        .on('error', (error) => {
          console.error('❌ Audio preprocessing failed:', error);
          reject(error);
        })
        .save(outputPath);
    });
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   * @param {string} audioPath - Path to audio file
   * @param {object} options - Transcription options
   * @returns {Promise<object>} - Transcription result
   */
  async transcribeWithWhisper(audioPath, options = {}) {
    try {
      // If OpenAI is not available, return mock transcription
      if (!this.hasOpenAI) {
        console.log('🤖 Using mock transcription (OpenAI not configured)');
        const metadata = await this.getAudioMetadata(audioPath);
        return {
          text: 'Mock transcription: This is a sample transcription for testing purposes. The audio has been processed successfully.',
          language: options.language || 'de',
          duration: metadata.duration,
          segments: [],
          confidence: 0.85
        };
      }

      const audioFile = fs.createReadStream(audioPath);

      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: options.language || 'de',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment']
      });

      return {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        segments: transcription.segments || [],
        confidence: this.calculateAverageConfidence(transcription.segments || [])
      };

    } catch (error) {
      console.error('❌ Whisper transcription failed:', error);
      throw error;
    }
  }

  /**
   * Calculate average confidence from segments
   * @param {Array} segments - Transcription segments
   * @returns {number} - Average confidence score
   */
  calculateAverageConfidence(segments) {
    if (!segments.length) return 0.8; // Default confidence

    const totalConfidence = segments.reduce((sum, segment) => {
      return sum + (segment.avg_logprob || 0.8);
    }, 0);

    return Math.max(0, Math.min(1, totalConfidence / segments.length + 1));
  }

  /**
   * Get audio file metadata
   * @param {string} audioPath - Path to audio file
   * @returns {Promise<object>} - Audio metadata
   */
  async getAudioMetadata(audioPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(audioPath, (error, metadata) => {
        if (error) {
          reject(error);
        } else {
          const format = metadata.format;
          resolve({
            duration: Math.round(format.duration),
            size: format.size,
            bitrate: format.bit_rate,
            format: format.format_name,
            codec: metadata.streams[0]?.codec_name || 'unknown'
          });
        }
      });
    });
  }

  /**
   * Clean up temporary file
   * @param {string} filePath - Path to temporary file
   */
  cleanupTempFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('🗑️ Cleaned up temporary file:', path.basename(filePath));
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup temp file:', error.message);
    }
  }

  /**
   * Validate audio file format and size
   * @param {string} audioPath - Path to audio file
   * @returns {Promise<object>} - Validation result
   */
  async validateAudioFile(audioPath) {
    try {
      const stats = fs.statSync(audioPath);
      const metadata = await this.getAudioMetadata(audioPath);

      const maxSize = 25 * 1024 * 1024; // 25MB limit for Whisper
      const maxDuration = 60 * 60; // 1 hour limit

      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
        metadata
      };

      if (stats.size > maxSize) {
        validation.errors.push(`File too large: ${Math.round(stats.size / 1024 / 1024)}MB (max: 25MB)`);
        validation.isValid = false;
      }

      if (metadata.duration > maxDuration) {
        validation.errors.push(`Audio too long: ${Math.round(metadata.duration / 60)}min (max: 60min)`);
        validation.isValid = false;
      }

      if (metadata.duration < 1) {
        validation.warnings.push('Very short audio file (less than 1 second)');
      }

      return validation;

    } catch (error) {
      return {
        isValid: false,
        errors: [`Invalid audio file: ${error.message}`],
        warnings: [],
        metadata: null
      };
    }
  }
}

module.exports = AudioToTextService;