const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * Audio Extraction Service - YouTube-DL Integration
 * Extracts audio from YouTube videos discovered by VideoDiscoveryService
 */
class AudioExtractionService {
  constructor() {
    this.downloadDir = path.join(__dirname, '../../../data/audio-extracts');
    this.tempDir = path.join(__dirname, '../../../data/temp');
    this.maxDuration = 1800; // 30 minutes max
    this.maxFileSize = 50 * 1024 * 1024; // 50MB max

    // Initialize directories
    this.ensureDirectories();

    // Quality settings
    this.audioFormats = {
      high: 'bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio',
      medium: 'bestaudio[abr<=128]/bestaudio',
      low: 'worstaudio[ext=m4a]/worstaudio[ext=mp3]/worstaudio',
      // Neue Formate hinzufügen
      flac: 'bestaudio[ext=flac]/bestaudio',
      wav: 'bestaudio[ext=wav]/bestaudio',
      aac: 'bestaudio[ext=aac]/bestaudio'
    };

    // Rate limiting for API compliance
    this.requestDelay = 3000; // 3 seconds between downloads
    this.lastDownload = 0;

    // Retry settings
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.downloadDir, this.tempDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Check if youtube-dl or yt-dlp is available
   */
  async checkYoutubeDL() {
    try {
      // Try yt-dlp first (more actively maintained)
      await execPromise('which yt-dlp');
      return 'yt-dlp';
    } catch (error) {
      try {
        // Fallback to youtube-dl
        await execPromise('which youtube-dl');
        return 'youtube-dl';
      } catch (error2) {
        throw new Error('Neither yt-dlp nor youtube-dl found. Please install one of them.');
      }
    }
  }

  /**
   * Extract audio from a single video with retry logic
   */
  async extractAudioFromVideo(videoData, options = {}) {
    const { quality = 'medium', maxDuration = this.maxDuration } = options;

    console.log(`🎵 Extracting audio from: ${videoData.title}`);

    // Rate limiting
    await this.waitForRateLimit();

    // Retry logic
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const youtubeDL = await this.checkYoutubeDL();
        const videoUrl = `https://www.youtube.com/watch?v=${videoData.videoId}`;

        // Generate safe filename
        const safeTitle = this.sanitizeFilename(videoData.title);
        const outputPath = path.join(this.tempDir, `${videoData.videoId}_${safeTitle}`);

        // Build youtube-dl command
        const command = this.buildExtractionCommand(
          youtubeDL,
          videoUrl,
          outputPath,
          quality,
          maxDuration
        );

        console.log(`🔄 Running: ${command}`);

        // Execute extraction
        const { stdout, stderr } = await execPromise(command, {
          timeout: 300000, // 5 minutes timeout
          maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });

        // Find extracted file
        const extractedFile = this.findExtractedFile(outputPath);
        if (!extractedFile) {
          throw new Error('Audio extraction completed but file not found');
        }

        // Validate file
        await this.validateAudioFile(extractedFile);

        // Move to final location
        const finalPath = path.join(this.downloadDir, path.basename(extractedFile));
        fs.renameSync(extractedFile, finalPath);

        // Extract metadata
        const metadata = await this.extractMetadata(finalPath);

        const result = {
          success: true,
          videoId: videoData.videoId,
          videoTitle: videoData.title,
          channelTitle: videoData.channelTitle,
          audioPath: finalPath,
          fileSize: fs.statSync(finalPath).size,
          extractedAt: new Date().toISOString(),
          quality: quality,
          duration: await this.getAudioDuration(finalPath),
          metadata: metadata
        };

        console.log(`✅ Audio extracted successfully: ${path.basename(finalPath)}`);
        return result;

      } catch (error) {
        console.error(`❌ Audio extraction attempt ${attempt} failed for ${videoData.videoId}:`, error.message);

        // If this is the last attempt, return failure
        if (attempt === this.maxRetries) {
          return {
            success: false,
            videoId: videoData.videoId,
            videoTitle: videoData.title,
            error: error.message,
            extractedAt: new Date().toISOString(),
            attempts: attempt
          };
        }

        // Wait before retrying
        console.log(`⏳ Retrying in ${this.retryDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
  }

  /**
   * Build youtube-dl extraction command with intelligent quality adjustment
   */
  buildExtractionCommand(youtubeDL, videoUrl, outputPath, quality, maxDuration) {
    // Intelligente Qualitätsanpassung basierend auf Dateigröße und Dauer
    let formatString = this.audioFormats[quality] || this.audioFormats.medium;
    let audioQuality = '0'; // Beste Qualität

    // Anpassung der Qualität basierend auf den Anforderungen
    if (quality === 'low') {
      audioQuality = '9'; // Niedrigste Qualität
    } else if (quality === 'medium') {
      audioQuality = '5'; // Mittlere Qualität
    }

    // Erweiterte Optionen für bessere Extraktion
    const options = [
      youtubeDL,
      '--extract-audio',
      '--audio-format', this.getAudioFormatExtension(quality),
      '--audio-quality', audioQuality,
      '--format', formatString,
      '--max-duration', maxDuration.toString(),
      '--max-filesize', '50M',
      '--no-playlist',
      '--no-warnings',
      '--ignore-errors',
      '--retries', '3',
      '--fragment-retries', '3',
      '--continue',
      '--output', `"${outputPath}.%(ext)s"`,
      `"${videoUrl}"`
    ];

    return options.join(' ');
  }

  /**
   * Get audio format extension based on quality setting
   */
  getAudioFormatExtension(quality) {
    switch (quality) {
      case 'high':
        return 'm4a'; // Beste Komprimierung und Qualität
      case 'medium':
        return 'mp3'; // Gute Komprimierung und weite Verbreitung
      case 'low':
        return 'mp3'; // Kleinste Dateigröße
      case 'flac':
        return 'flac'; // Verlustfreie Qualität
      case 'wav':
        return 'wav'; // Unkomprimiert
      case 'aac':
        return 'aac'; // Effiziente Komprimierung
      default:
        return 'mp3';
    }
  }

  /**
   * Intelligent quality adjustment based on content analysis
   */
  async analyzeAndAdjustQuality(videoData, initialQuality) {
    try {
      // In einer erweiterten Implementierung würden wir hier den Inhalt analysieren
      // und die Qualität entsprechend anpassen (z.B. höhere Qualität für Musik,
      // niedrigere Qualität für Sprache)

      // Für jetzt verwenden wir eine einfache Heuristik
      const title = videoData.title.toLowerCase();
      const content = (videoData.content || '').toLowerCase();

      // Höhere Qualität für Musikinhalte
      if (title.includes('music') || title.includes('song') ||
          content.includes('music') || content.includes('song')) {
        return 'high';
      }

      // Niedrigere Qualität für Sprachinhalte
      if (title.includes('podcast') || title.includes('talk') ||
          content.includes('podcast') || content.includes('talk')) {
        return initialQuality === 'high' ? 'medium' : initialQuality;
      }

      // Standardqualität für andere Inhalte
      return initialQuality;
    } catch (error) {
      console.warn('⚠️ Failed to analyze content for quality adjustment:', error.message);
      return initialQuality;
    }
  }

  /**
   * Enhanced error handling with detailed error categorization
   */
  categorizeError(error) {
    const errorString = error.toString().toLowerCase();

    if (errorString.includes('network') || errorString.includes('timeout') ||
        errorString.includes('connection')) {
      return 'NETWORK_ERROR';
    }

    if (errorString.includes('format') || errorString.includes('codec')) {
      return 'FORMAT_ERROR';
    }

    if (errorString.includes('permission') || errorString.includes('access')) {
      return 'PERMISSION_ERROR';
    }

    if (errorString.includes('quota') || errorString.includes('limit')) {
      return 'QUOTA_ERROR';
    }

    if (errorString.includes('file') || errorString.includes('not found')) {
      return 'FILE_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * Find the extracted audio file
   */
  findExtractedFile(basePath) {
    const possibleExtensions = ['.mp3', '.m4a', '.opus', '.webm'];

    for (const ext of possibleExtensions) {
      const filePath = basePath + ext;
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }

    // Check directory for any audio files
    const dir = path.dirname(basePath);
    const basename = path.basename(basePath);

    try {
      const files = fs.readdirSync(dir);
      const audioFile = files.find(file =>
        file.startsWith(basename) &&
        possibleExtensions.some(ext => file.endsWith(ext))
      );

      return audioFile ? path.join(dir, audioFile) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate extracted audio file
   */
  async validateAudioFile(filePath) {
    const stats = fs.statSync(filePath);

    if (stats.size === 0) {
      throw new Error('Extracted file is empty');
    }

    if (stats.size > this.maxFileSize) {
      throw new Error(`File too large: ${stats.size} bytes`);
    }

    // Basic audio file validation (check first few bytes)
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    const fileSignature = buffer.toString('hex');
    const audioSignatures = [
      'fffb', 'fff3', 'fff2', // MP3
      '66747970', // M4A/MP4
      '4f676753' // OGG
    ];

    const isValidAudio = audioSignatures.some(sig =>
      fileSignature.toLowerCase().startsWith(sig.toLowerCase())
    );

    if (!isValidAudio) {
      throw new Error('File does not appear to be a valid audio file');
    }
  }

  /**
   * Extract metadata from audio file using ffprobe
   */
  async extractMetadata(filePath) {
    try {
      const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
      const { stdout } = await execPromise(command);
      const metadata = JSON.parse(stdout);

      return {
        format: metadata.format.format_name,
        duration: parseFloat(metadata.format.duration) || 0,
        bitrate: parseInt(metadata.format.bit_rate) || 0,
        sampleRate: metadata.streams && metadata.streams[0] ?
          parseInt(metadata.streams[0].sample_rate) : 0,
        channels: metadata.streams && metadata.streams[0] ?
          parseInt(metadata.streams[0].channels) : 0,
        codec: metadata.streams && metadata.streams[0] ?
          metadata.streams[0].codec_name : 'unknown'
      };
    } catch (error) {
      console.warn(`⚠️ Failed to extract metadata: ${error.message}`);
      return {};
    }
  }

  /**
   * Get audio duration using ffprobe if available
   */
  async getAudioDuration(filePath) {
    try {
      const command = `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`;
      const { stdout } = await execPromise(command);
      return parseFloat(stdout.trim()) || 0;
    } catch (error) {
      // Fallback: estimate from file size (rough estimate)
      const stats = fs.statSync(filePath);
      return Math.round(stats.size / (128 * 1024 / 8)); // Assume 128kbps
    }
  }

  /**
   * Sanitize filename for safe file system usage
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 50); // Limit length
  }

  /**
   * Rate limiting helper
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastDownload = now - this.lastDownload;
    if (timeSinceLastDownload < this.requestDelay) {
      await new Promise(resolve =>
        setTimeout(resolve, this.requestDelay - timeSinceLastDownload)
      );
    }
    this.lastDownload = Date.now();
  }

  /**
   * Extract audio from multiple videos (batch processing) with progress tracking
   */
  async extractAudioFromVideos(videos, options = {}) {
    const { maxConcurrent = 2, quality = 'medium' } = options;

    console.log(`🎵 Starting batch audio extraction for ${videos.length} videos`);

    const results = [];
    const progress = {
      total: videos.length,
      completed: 0,
      successful: 0,
      failed: 0,
      totalSize: 0,
      totalDuration: 0
    };

    // Process videos in batches
    for (let i = 0; i < videos.length; i += maxConcurrent) {
      const batch = videos.slice(i, i + maxConcurrent);
      console.log(`🔄 Processing batch ${Math.floor(i/maxConcurrent) + 1}/${Math.ceil(videos.length/maxConcurrent)}`);

      // Process batch with concurrency control
      const batchPromises = batch.map(async (video) => {
        try {
          // Intelligente Qualitätsanpassung
          const adjustedQuality = await this.analyzeAndAdjustQuality(video, quality);
          const result = await this.extractAudioFromVideo(video, {
            quality: adjustedQuality
          });

          // Aktualisiere Fortschritt
          progress.completed++;
          if (result.success) {
            progress.successful++;
            progress.totalSize += (result.fileSize || 0);
            progress.totalDuration += (result.duration || 0);
          } else {
            progress.failed++;
          }

          // Logge Fortschritt
          const percentage = Math.round((progress.completed / progress.total) * 100);
          console.log(`📊 Progress: ${progress.completed}/${progress.total} (${percentage}%) - Successful: ${progress.successful}, Failed: ${progress.failed}`);

          return result;
        } catch (error) {
          progress.completed++;
          progress.failed++;

          const percentage = Math.round((progress.completed / progress.total) * 100);
          console.log(`📊 Progress: ${progress.completed}/${progress.total} (${percentage}%) - Successful: ${progress.successful}, Failed: ${progress.failed}`);

          return {
            success: false,
            videoId: video.videoId,
            videoTitle: video.title,
            error: error.message,
            errorType: this.categorizeError(error),
            extractedAt: new Date().toISOString()
          };
        }
      });

      // Warte auf Abschluss des Batches
      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason.message,
            errorType: this.categorizeError(result.reason),
            extractedAt: new Date().toISOString()
          });
        }
      });
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`🎉 Batch extraction completed: ${successful.length} successful, ${failed.length} failed`);

    return {
      summary: {
        total: videos.length,
        successful: successful.length,
        failed: failed.length,
        totalSize: successful.reduce((sum, r) => sum + (r.fileSize || 0), 0),
        totalDuration: successful.reduce((sum, r) => sum + (r.duration || 0), 0),
        successRate: Math.round((successful.length / videos.length) * 100)
      },
      progress: progress,
      results: results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clean up old audio files
   */
  async cleanupOldFiles(maxAgeHours = 24) {
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    const now = Date.now();

    const directories = [this.downloadDir, this.tempDir];
    let cleanedCount = 0;
    let freedSpace = 0;

    for (const dir of directories) {
      try {
        const files = fs.readdirSync(dir);

        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);

          if (now - stats.mtime.getTime() > maxAge) {
            freedSpace += stats.size;
            fs.unlinkSync(filePath);
            cleanedCount++;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to clean directory ${dir}:`, error.message);
      }
    }

    console.log(`🧹 Cleanup completed: ${cleanedCount} files removed, ${Math.round(freedSpace / 1024 / 1024)}MB freed`);

    return {
      filesRemoved: cleanedCount,
      spaceFreed: freedSpace,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get service statistics with detailed metrics
   */
  getStats() {
    const stats = {
      downloadDirectory: this.downloadDir,
      tempDirectory: this.tempDir,
      maxDuration: this.maxDuration,
      maxFileSize: this.maxFileSize,
      availableFiles: 0,
      totalSize: 0,
      formats: Object.keys(this.audioFormats),
      retrySettings: {
        maxRetries: this.maxRetries,
        retryDelay: this.retryDelay
      }
    };

    try {
      const files = fs.readdirSync(this.downloadDir);
      stats.availableFiles = files.length;

      files.forEach(file => {
        const filePath = path.join(this.downloadDir, file);
        const fileStats = fs.statSync(filePath);
        stats.totalSize += fileStats.size;
      });
    } catch (error) {
      console.warn('⚠️ Failed to read download directory stats');
    }

    return stats;
  }
}

module.exports = AudioExtractionService;