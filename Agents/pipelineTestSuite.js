const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

/**
 * Pipeline Test Suite - End-to-End Testing Infrastructure
 * Comprehensive testing for service integration and pipeline execution
 */
class PipelineTestSuite extends EventEmitter {
  constructor(pipelineOrchestrator, services = {}) {
    super();
    
    this.orchestrator = pipelineOrchestrator;
    this.services = services;
    
    // Test configuration
    this.testResultsDir = path.join(__dirname, '../../../logs/pipeline-tests');
    this.mockDataDir = path.join(__dirname, '../../../data/test-mocks');
    
    // Test tracking
    this.activeTests = new Map();
    this.testHistory = [];
    this.testMetrics = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      averageExecutionTime: 0,
      lastTestRun: null
    };
    
    // Test scenarios
    this.testScenarios = {
      'basic_video_to_audio': {
        name: 'Basic Video Discovery to Audio Extraction',
        template: 'video_to_audio_pipeline',
        config: {
          topic: 'AI Technology Trends',
          contentType: 'explanation',
          targetLength: '5min'
        },
        expectedSteps: ['video_discovery', 'audio_extraction', 'audio_to_avatar'],
        timeout: 300000, // 5 minutes
        criticalStep: 'audio_extraction'
      },
      
      'full_content_pipeline': {
        name: 'Complete Content Creation Pipeline',
        template: 'full_content_pipeline', 
        config: {
          topic: 'Climate Change Solutions',
          contentType: 'educational',
          targetLength: '10min',
          tone: 'informativ'
        },
        expectedSteps: ['video_discovery', 'audio_extraction', 'trend_analysis', 'script_generation', 'avatar_generation'],
        timeout: 600000, // 10 minutes
        criticalStep: 'script_generation'
      },
      
      'error_recovery_test': {
        name: 'Error Recovery and Service Resilience',
        template: 'video_to_audio_pipeline',
        config: {
          topic: 'Invalid Topic for Testing',
          contentType: 'test_error',
          targetLength: '1min'
        },
        expectedSteps: ['video_discovery', 'audio_extraction'],
        timeout: 180000, // 3 minutes
        criticalStep: 'video_discovery',
        expectFailure: true
      },
      
      // NEW: Recovery Testing Scenarios
      'recovery_basic': {
        name: 'Basic Recovery Test',
        template: 'video_to_audio_pipeline',
        config: {
          topic: 'Recovery Test Topic',
          contentType: 'recovery_test',
          targetLength: '2min',
          simulateFailure: true // This will trigger recovery mechanisms
        },
        expectedSteps: ['video_discovery', 'audio_extraction', 'audio_to_avatar'],
        timeout: 240000, // 4 minutes
        criticalStep: 'audio_extraction',
        expectRecovery: true
      }
    };
    
    this.ensureTestDirectories();
    this.initializeMockData();
  }

  /**
   * Ensure test directories exist
   */
  ensureTestDirectories() {
    [this.testResultsDir, this.mockDataDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Initialize mock data for testing
   */
  initializeMockData() {
    const mockVideoData = {
      videos: [
        {
          videoId: 'test_video_1',
          title: 'AI Trends 2024 - Complete Guide',
          channelTitle: 'Tech Education Channel',
          viewCount: 150000,
          publishedAt: new Date().toISOString(),
          engagementRate: 5.2
        },
        {
          videoId: 'test_video_2', 
          title: 'Future of Machine Learning',
          channelTitle: 'AI Research Hub',
          viewCount: 89000,
          publishedAt: new Date().toISOString(),
          engagementRate: 4.8
        }
      ],
      categories: ['ai_tech'],
      metadata: {
        searchTopic: 'AI Technology Trends',
        timestamp: new Date().toISOString(),
        totalResults: 2
      }
    };

    const mockAudioData = {
      success: true,
      totalAttempts: 2,
      successfulExtractions: 1,
      failedExtractions: 1,
      audioFiles: [
        {
          success: true,
          videoId: 'test_video_1',
          videoTitle: 'AI Trends 2024 - Complete Guide',
          channelTitle: 'Tech Education Channel',
          audioPath: '/data/audio-extracts/test_video_1_ai_trends.mp3',
          fileSize: 12485760, // ~12MB
          extractedAt: new Date().toISOString(),
          quality: 'medium',
          duration: 312 // 5:12 minutes
        }
      ],
      metadata: {
        extractedAt: new Date().toISOString(),
        sourceVideos: [
          {
            videoId: 'test_video_1',
            title: 'AI Trends 2024 - Complete Guide'
          }
        ]
      }
    };

    const mockAvatarData = {
      success: true,
      avatarJobId: 'test_avatar_job_1',
      avatarName: 'Test Avatar - AI Trends',
      avatarType: 'head_only',
      estimatedDuration: 4500, // 4.5 seconds
      sourceAudio: {
        videoId: 'test_video_1',
        videoTitle: 'AI Trends 2024 - Complete Guide',
        audioPath: '/data/audio-extracts/test_video_1_ai_trends.mp3'
      },
      metadata: {
        createdAt: new Date().toISOString(),
        pipelineTopic: 'AI Technology Trends'
      }
    };

    // Save mock data
    const mockDataFile = path.join(this.mockDataDir, 'pipeline-test-data.json');
    fs.writeFileSync(mockDataFile, JSON.stringify({
      videoDiscoveryMock: mockVideoData,
      audioExtractionMock: mockAudioData,
      avatarGenerationMock: mockAvatarData
    }, null, 2));
  }

  /**
   * Run comprehensive test suite
   */
  async runFullTestSuite() {
    const suiteId = uuidv4();
    const startTime = Date.now();

    console.log(`🧪 Starting Pipeline Test Suite: ${suiteId}`);
    
    const suiteResults = {
      suiteId,
      startTime,
      endTime: null,
      duration: null,
      scenarios: [],
      summary: {
        totalScenarios: Object.keys(this.testScenarios).length,
        passedScenarios: 0,
        failedScenarios: 0,
        overallSuccess: false
      }
    };

    try {
      // Run each test scenario
      for (const [scenarioId, scenario] of Object.entries(this.testScenarios)) {
        console.log(`\n🎯 Running scenario: ${scenario.name}`);
        
        const scenarioResult = await this.runTestScenario(scenarioId, scenario);
        suiteResults.scenarios.push(scenarioResult);
        
        if (scenarioResult.success) {
          suiteResults.summary.passedScenarios++;
        } else {
          suiteResults.summary.failedScenarios++;
        }
        
        // Wait between scenarios to avoid resource conflicts
        await this.delay(2000);
      }

      // Calculate suite results
      suiteResults.endTime = Date.now();
      suiteResults.duration = suiteResults.endTime - startTime;
      suiteResults.summary.overallSuccess = suiteResults.summary.failedScenarios === 0;

      // Update metrics
      this.updateTestMetrics(suiteResults);

      // Save results
      await this.saveTestResults(suiteResults);

      console.log(`\n✅ Test Suite Completed: ${suiteResults.summary.passedScenarios}/${suiteResults.summary.totalScenarios} scenarios passed`);
      
      return suiteResults;

    } catch (error) {
      console.error(`❌ Test Suite Failed:`, error);
      
      suiteResults.endTime = Date.now();
      suiteResults.duration = suiteResults.endTime - startTime;
      suiteResults.error = error.message;
      suiteResults.summary.overallSuccess = false;

      await this.saveTestResults(suiteResults);
      throw error;
    }
  }

  /**
   * Run individual test scenario
   */
  async runTestScenario(scenarioId, scenario) {
    const testId = uuidv4();
    const startTime = Date.now();

    const result = {
      testId,
      scenarioId,
      name: scenario.name,
      startTime,
      endTime: null,
      duration: null,
      success: false,
      steps: [],
      errors: [],
      metrics: {
        pipelineExecutionTime: null,
        stepsCompleted: 0,
        stepsExpected: scenario.expectedSteps.length
      }
    };

    this.activeTests.set(testId, result);

    try {
      console.log(`  📋 Testing: ${scenario.name}`);
      console.log(`  🎯 Expected steps: ${scenario.expectedSteps.join(' → ')}`);

      // Execute pipeline with test configuration
      const pipelineResult = await this.executePipelineWithTimeout(
        scenario.template,
        scenario.config,
        scenario.timeout
      );

      result.metrics.pipelineExecutionTime = pipelineResult.duration;
      result.pipelineResult = pipelineResult;

      // Validate pipeline execution
      const validationResult = await this.validatePipelineExecution(
        pipelineResult,
        scenario
      );

      result.steps = validationResult.steps;
      result.success = validationResult.success;
      result.metrics.stepsCompleted = validationResult.stepsCompleted;

      if (!result.success) {
        result.errors.push(...validationResult.errors);
      }

      result.endTime = Date.now();
      result.duration = result.endTime - startTime;

      console.log(`  ${result.success ? '✅' : '❌'} ${scenario.name}: ${result.success ? 'PASSED' : 'FAILED'}`);
      
      if (result.errors.length > 0) {
        console.log(`  📋 Errors: ${result.errors.length}`);
        result.errors.forEach(error => console.log(`    - ${error}`));
      }

      return result;

    } catch (error) {
      console.error(`  ❌ Scenario failed: ${error.message}`);
      
      result.endTime = Date.now();
      result.duration = result.endTime - startTime;
      result.success = false;
      result.errors.push(error.message);

      return result;
      
    } finally {
      this.activeTests.delete(testId);
    }
  }

  /**
   * Execute pipeline with timeout protection
   */
  async executePipelineWithTimeout(template, config, timeout) {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Pipeline execution timed out after ${timeout}ms`));
      }, timeout);

      try {
        const result = await this.orchestrator.executePipeline({
          templateName: template,
          ...config
        });

        clearTimeout(timeoutId);
        resolve(result);
        
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Validate pipeline execution results
   */
  async validatePipelineExecution(pipelineResult, scenario) {
    const validation = {
      success: true,
      steps: [],
      stepsCompleted: 0,
      errors: []
    };

    // Basic success validation
    if (!pipelineResult.success) {
      if (scenario.expectFailure) {
        console.log(`  ℹ️  Expected failure occurred - this is correct for this test`);
        validation.success = true;
        return validation;
      } else {
        validation.success = false;
        validation.errors.push('Pipeline execution failed unexpectedly');
        return validation;
      }
    }

    // If we expected failure but got success
    if (scenario.expectFailure && pipelineResult.success) {
      validation.success = false;
      validation.errors.push('Expected pipeline to fail but it succeeded');
      return validation;
    }

    // Validate expected steps were executed
    if (!pipelineResult.results) {
      validation.success = false;
      validation.errors.push('No pipeline results found');
      return validation;
    }

    // Check each expected step
    for (const expectedStep of scenario.expectedSteps) {
      if (pipelineResult.results[expectedStep]) {
        validation.steps.push({
          stepId: expectedStep,
          status: 'completed',
          result: pipelineResult.results[expectedStep]
        });
        validation.stepsCompleted++;
      } else {
        validation.success = false;
        validation.errors.push(`Expected step '${expectedStep}' was not executed`);
        validation.steps.push({
          stepId: expectedStep,
          status: 'missing',
          result: null
        });
      }
    }

    // Validate critical step
    if (scenario.criticalStep) {
      const criticalStepResult = pipelineResult.results[scenario.criticalStep];
      if (!criticalStepResult || !criticalStepResult.success) {
        validation.success = false;
        validation.errors.push(`Critical step '${scenario.criticalStep}' failed or missing`);
      }
    }

    return validation;
  }

  /**
   * Update test metrics
   */
  updateTestMetrics(suiteResults) {
    this.testMetrics.totalTests++;
    this.testMetrics.lastTestRun = new Date().toISOString();

    if (suiteResults.summary.overallSuccess) {
      this.testMetrics.passedTests++;
    } else {
      this.testMetrics.failedTests++;
    }

    // Update average execution time
    const totalTime = this.testMetrics.averageExecutionTime * (this.testMetrics.totalTests - 1);
    this.testMetrics.averageExecutionTime = 
      (totalTime + suiteResults.duration) / this.testMetrics.totalTests;
  }

  /**
   * Save test results
   */
  async saveTestResults(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `pipeline-test-${timestamp}.json`;
    const filepath = path.join(this.testResultsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    
    // Keep only last 10 test results
    this.cleanupOldResults();
    
    console.log(`💾 Test results saved: ${filename}`);
  }

  /**
   * Cleanup old test result files
   */
  cleanupOldResults() {
    try {
      const files = fs.readdirSync(this.testResultsDir)
        .filter(f => f.startsWith('pipeline-test-') && f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(this.testResultsDir, f),
          mtime: fs.statSync(path.join(this.testResultsDir, f)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime);

      files.slice(10).forEach(file => {
        fs.unlinkSync(file.path);
      });
    } catch (error) {
      console.warn('⚠️ Cleanup failed:', error.message);
    }
  }

  /**
   * Get test statistics
   */
  getTestStats() {
    return {
      metrics: this.testMetrics,
      activeTests: this.activeTests.size,
      availableScenarios: Object.keys(this.testScenarios).length,
      lastResults: this.getLatestTestResults()
    };
  }

  /**
   * Get latest test results
   */
  getLatestTestResults() {
    try {
      const files = fs.readdirSync(this.testResultsDir)
        .filter(f => f.startsWith('pipeline-test-') && f.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length === 0) return null;

      const latestFile = path.join(this.testResultsDir, files[0]);
      return JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    } catch (error) {
      return null;
    }
  }

  /**
   * Utility: Delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = PipelineTestSuite;