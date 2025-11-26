const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Multi-Input Processing Service
 * Processes multiple input sources with batch and queue management
 */
class MultiInputProcessingService {
  constructor() {
    this.inputsDir = path.join(__dirname, '../../data/inputs');
    this.processedDir = path.join(__dirname, '../../data/processed');
    this.queueDir = path.join(__dirname, '../../data/queue');
    this.batchDir = path.join(__dirname, '../../data/batch');
    
    this.processingQueue = [];
    this.isProcessing = false;
    this.batchSize = parseInt(process.env.BATCH_SIZE) || 5;
    this.maxConcurrent = parseInt(process.env.MAX_CONCURRENT_INPUTS) || 3;
    
    this.ensureDirectories();
    this.startQueueProcessor();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.inputsDir, this.processedDir, this.queueDir, this.batchDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Add input to processing queue
   */
  async addInput(inputData) {
    try {
      const inputId = uuidv4();
      const inputMetadata = {
        inputId,
        ...inputData,
        status: 'queued',
        queuedAt: new Date().toISOString(),
        processedAt: null,
        error: null
      };
      
      // Save input to queue
      const queuePath = path.join(this.queueDir, `input-${inputId}.json`);
      fs.writeFileSync(queuePath, JSON.stringify(inputMetadata, null, 2));
      
      // Add to in-memory queue
      this.processingQueue.push(inputId);
      
      console.log(`📥 Input added to queue: ${inputId}`);
      
      return inputMetadata;
    } catch (error) {
      console.error('❌ Failed to add input to queue:', error);
      throw error;
    }
  }

  /**
   * Start queue processor
   */
  startQueueProcessor() {
    // Process queue every 5 seconds
    setInterval(() => {
      if (!this.isProcessing && this.processingQueue.length > 0) {
        this.processQueue();
      }
    }, 5000);
  }

  /**
   * Process input queue
   */
  async processQueue() {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      console.log(`🔄 Processing queue with ${this.processingQueue.length} items`);
      
      // Create batch from queue
      const batch = this.processingQueue.splice(0, this.batchSize);
      
      // Process batch
      await this.processBatch(batch);
      
      console.log(`✅ Batch processed successfully`);
    } catch (error) {
      console.error('❌ Failed to process queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process batch of inputs
   */
  async processBatch(batch) {
    try {
      console.log(`📦 Processing batch of ${batch.length} inputs`);
      
      // Create batch directory
      const batchId = uuidv4();
      const batchPath = path.join(this.batchDir, `batch-${batchId}`);
      fs.mkdirSync(batchPath, { recursive: true });
      
      // Save batch info
      const batchInfo = {
        batchId,
        inputIds: batch,
        createdAt: new Date().toISOString(),
        processedAt: null,
        status: 'processing'
      };
      
      fs.writeFileSync(path.join(batchPath, 'batch-info.json'), JSON.stringify(batchInfo, null, 2));
      
      // Process each input concurrently (up to maxConcurrent)
      const results = [];
      for (let i = 0; i < batch.length; i += this.maxConcurrent) {
        const chunk = batch.slice(i, i + this.maxConcurrent);
        const chunkResults = await Promise.all(chunk.map(inputId => this.processInput(inputId)));
        results.push(...chunkResults);
      }
      
      // Update batch status
      batchInfo.processedAt = new Date().toISOString();
      batchInfo.status = 'completed';
      batchInfo.results = results;
      
      fs.writeFileSync(path.join(batchPath, 'batch-info.json'), JSON.stringify(batchInfo, null, 2));
      
      console.log(`✅ Batch ${batchId} completed with ${results.length} results`);
      
      return results;
    } catch (error) {
      console.error('❌ Failed to process batch:', error);
      throw error;
    }
  }

  /**
   * Process individual input
   */
  async processInput(inputId) {
    try {
      console.log(`⚙️ Processing input: ${inputId}`);
      
      // Load input from queue
      const queuePath = path.join(this.queueDir, `input-${inputId}.json`);
      if (!fs.existsSync(queuePath)) {
        throw new Error(`Input ${inputId} not found in queue`);
      }
      
      const inputMetadata = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
      
      // Update status to processing
      inputMetadata.status = 'processing';
      inputMetadata.processingStartedAt = new Date().toISOString();
      fs.writeFileSync(queuePath, JSON.stringify(inputMetadata, null, 2));
      
      // Process the input (this would be customized based on input type)
      const result = await this.processInputData(inputMetadata);
      
      // Move to processed directory
      const processedPath = path.join(this.processedDir, `input-${inputId}.json`);
      inputMetadata.status = 'completed';
      inputMetadata.processedAt = new Date().toISOString();
      inputMetadata.result = result;
      fs.writeFileSync(processedPath, JSON.stringify(inputMetadata, null, 2));
      
      // Remove from queue
      fs.unlinkSync(queuePath);
      
      console.log(`✅ Input processed successfully: ${inputId}`);
      
      return {
        inputId,
        status: 'completed',
        result
      };
    } catch (error) {
      console.error(`❌ Failed to process input ${inputId}:`, error);
      
      // Update error status
      try {
        const queuePath = path.join(this.queueDir, `input-${inputId}.json`);
        if (fs.existsSync(queuePath)) {
          const inputMetadata = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
          inputMetadata.status = 'error';
          inputMetadata.processedAt = new Date().toISOString();
          inputMetadata.error = error.message;
          fs.writeFileSync(queuePath, JSON.stringify(inputMetadata, null, 2));
        }
      } catch (writeError) {
        console.error(`❌ Failed to update error status for input ${inputId}:`, writeError);
      }
      
      return {
        inputId,
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Process input data (to be customized based on input type)
   */
  async processInputData(inputData) {
    // This is a placeholder implementation
    // In a real system, this would process the input based on its type
    
    const { inputType, content, source } = inputData;
    
    switch(inputType) {
      case 'text':
        return this.processTextInput(content, source);
      case 'url':
        return this.processUrlInput(content, source);
      case 'file':
        return this.processFileInput(content, source);
      default:
        return this.processGenericInput(inputData);
    }
  }

  /**
   * Process text input
   */
  async processTextInput(content, source) {
    // Simulate text processing
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
    
    return {
      processedContent: content.trim(),
      wordCount: content.trim().split(/\s+/).length,
      source,
      processingType: 'text'
    };
  }

  /**
   * Process URL input
   */
  async processUrlInput(url, source) {
    // Simulate URL processing
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 800));
    
    return {
      url,
      title: `Processed content from ${url}`,
      summary: `This is a summary of content from ${url}`,
      source,
      processingType: 'url'
    };
  }

  /**
   * Process file input
   */
  async processFileInput(filePath, source) {
    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 1000));
    
    return {
      filePath,
      fileSize: Math.floor(Math.random() * 1000000),
      fileType: path.extname(filePath),
      source,
      processingType: 'file'
    };
  }

  /**
   * Process generic input
   */
  async processGenericInput(inputData) {
    // Simulate generic processing
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 600));
    
    return {
      ...inputData,
      processedAt: new Date().toISOString(),
      processingType: 'generic'
    };
  }

  /**
   * Get input status
   */
  getInputStatus(inputId) {
    try {
      // Check processed directory first
      const processedPath = path.join(this.processedDir, `input-${inputId}.json`);
      if (fs.existsSync(processedPath)) {
        return JSON.parse(fs.readFileSync(processedPath, 'utf8'));
      }
      
      // Check queue directory
      const queuePath = path.join(this.queueDir, `input-${inputId}.json`);
      if (fs.existsSync(queuePath)) {
        return JSON.parse(fs.readFileSync(queuePath, 'utf8'));
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Failed to get status for input ${inputId}:`, error);
      return null;
    }
  }

  /**
   * List all inputs
   */
  listInputs() {
    try {
      const inputs = [];
      
      // Add queued inputs
      const queuedFiles = fs.readdirSync(this.queueDir)
        .filter(f => f.startsWith('input-') && f.endsWith('.json'));
      
      queuedFiles.forEach(f => {
        const inputId = f.replace('input-', '').replace('.json', '');
        const metadata = JSON.parse(fs.readFileSync(path.join(this.queueDir, f), 'utf8'));
        inputs.push({
          inputId,
          ...metadata
        });
      });
      
      // Add processed inputs
      const processedFiles = fs.readdirSync(this.processedDir)
        .filter(f => f.startsWith('input-') && f.endsWith('.json'));
      
      processedFiles.forEach(f => {
        const inputId = f.replace('input-', '').replace('.json', '');
        const metadata = JSON.parse(fs.readFileSync(path.join(this.processedDir, f), 'utf8'));
        inputs.push({
          inputId,
          ...metadata
        });
      });
      
      return inputs;
    } catch (error) {
      console.error('❌ Failed to list inputs:', error);
      return [];
    }
  }

  /**
   * List batches
   */
  listBatches() {
    try {
      const batches = [];
      
      const batchDirs = fs.readdirSync(this.batchDir)
        .filter(d => d.startsWith('batch-'));
      
      batchDirs.forEach(d => {
        const batchInfoPath = path.join(this.batchDir, d, 'batch-info.json');
        if (fs.existsSync(batchInfoPath)) {
          const batchInfo = JSON.parse(fs.readFileSync(batchInfoPath, 'utf8'));
          batches.push(batchInfo);
        }
      });
      
      return batches;
    } catch (error) {
      console.error('❌ Failed to list batches:', error);
      return [];
    }
  }

  /**
   * Get processing statistics
   */
  getStats() {
    const inputs = this.listInputs();
    const batches = this.listBatches();
    
    const queuedInputs = inputs.filter(i => i.status === 'queued').length;
    const processingInputs = inputs.filter(i => i.status === 'processing').length;
    const completedInputs = inputs.filter(i => i.status === 'completed').length;
    const errorInputs = inputs.filter(i => i.status === 'error').length;
    
    const completedBatches = batches.filter(b => b.status === 'completed').length;
    
    return {
      totalInputs: inputs.length,
      queuedInputs,
      processingInputs,
      completedInputs,
      errorInputs,
      totalBatches: batches.length,
      completedBatches,
      queueLength: this.processingQueue.length,
      batchSize: this.batchSize,
      maxConcurrent: this.maxConcurrent
    };
  }

  /**
   * Clear processed inputs
   */
  clearProcessedInputs() {
    try {
      const processedFiles = fs.readdirSync(this.processedDir)
        .filter(f => f.startsWith('input-') && f.endsWith('.json'));
      
      processedFiles.forEach(f => {
        fs.unlinkSync(path.join(this.processedDir, f));
      });
      
      console.log(`🧹 Cleared ${processedFiles.length} processed inputs`);
      
      return {
        cleared: processedFiles.length
      };
    } catch (error) {
      console.error('❌ Failed to clear processed inputs:', error);
      throw error;
    }
  }

  /**
   * Clear queue
   */
  clearQueue() {
    try {
      const queuedFiles = fs.readdirSync(this.queueDir)
        .filter(f => f.startsWith('input-') && f.endsWith('.json'));
      
      queuedFiles.forEach(f => {
        fs.unlinkSync(path.join(this.queueDir, f));
      });
      
      // Clear in-memory queue
      this.processingQueue = [];
      
      console.log(`🧹 Cleared ${queuedFiles.length} queued inputs`);
      
      return {
        cleared: queuedFiles.length
      };
    } catch (error) {
      console.error('❌ Failed to clear queue:', error);
      throw error;
    }
  }
}

module.exports = MultiInputProcessingService;