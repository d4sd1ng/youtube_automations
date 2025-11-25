const fs = require('fs');
const path = require('path');

/**
 * Simple Workflow Executor
 * Demonstrates how agents can work together in a coordinated workflow
 */
class SimpleWorkflowExecutor {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
  }

  /**
   * Execute a simple content creation workflow
   * @param {Object} workflowData - The workflow data
   * @returns {Promise<Object>} Workflow result
   */
  async executeContentCreationWorkflow(workflowData) {
    try {
      console.log('[SimpleWorkflowExecutor] Starting content creation workflow');
      
      // Step 1: Content Planning
      console.log('[SimpleWorkflowExecutor] Step 1: Content Planning');
      
      const contentPlanResult = await this.orchestrator.contentPlanningAgent.execute({
        type: 'create-content-plan',
        channelId: 'workflow-channel',
        planOptions: {
          title: `Content Plan for ${workflowData.topic}`,
          period: 'week',
          startDate: new Date().toISOString(),
          contentTypes: ['long', 'short'],
          keywords: workflowData.keywords || []
        }
      });
      
      if (!contentPlanResult.success) {
        throw new Error('Content planning failed: ' + contentPlanResult.error);
      }
      
      // Step 2: Script Generation
      console.log('[SimpleWorkflowExecutor] Step 2: Script Generation');
      
      const scriptResult = await this.orchestrator.scriptService.execute({
        type: 'generate-script',
        topic: contentPlanResult.result.contentPlan.title,
        options: {
          scriptType: workflowData.scriptLength || 'medium',
          tone: workflowData.tone || 'informative',
          keywords: workflowData.keywords || []
        }
      });
      
      if (!scriptResult.success) {
        throw new Error('Script generation failed: ' + scriptResult.error);
      }
      
      // Step 3: Video Processing
      console.log('[SimpleWorkflowExecutor] Step 3: Video Processing');
      
      const videoResult = await this.orchestrator.videoService.execute({
        type: 'create-video-from-script',
        scriptId: scriptResult.result.script.id,
        videoOptions: {
          style: workflowData.videoStyle || 'standard',
          duration: workflowData.videoDuration || '5min'
        }
      });
      
      if (!videoResult.success) {
        throw new Error('Video processing failed: ' + videoResult.error);
      }
      
      // Step 4: Thumbnail Generation
      console.log('[SimpleWorkflowExecutor] Step 4: Thumbnail Generation');
      
      const thumbnailResult = await this.orchestrator.thumbnailService.execute({
        type: 'generate-thumbnails',
        contentData: {
          title: contentPlanResult.result.contentPlan.title,
          keywords: workflowData.keywords || [],
          contentType: 'video',
          contentId: scriptResult.result.script.id
        },
        options: {
          count: 3,
          style: workflowData.thumbnailStyle || 'bold',
          platform: workflowData.platform || 'youtube'
        }
      });
      
      if (!thumbnailResult.success) {
        throw new Error('Thumbnail generation failed: ' + thumbnailResult.error);
      }
      
      // Step 5: SEO Optimization
      console.log('[SimpleWorkflowExecutor] Step 5: SEO Optimization');
      
      const seoResult = await this.orchestrator.seoService.execute({
        type: 'optimize-video',
        videoData: {
          title: contentPlanResult.result.contentPlan.title,
          description: scriptResult.result.script.script || '',
          keywords: workflowData.keywords || [],
          id: scriptResult.result.script.id
        },
        options: {
          language: 'de',
          category: 'Entertainment',
          optimizationLevel: 'standard'
        }
      });
      
      if (!seoResult.success) {
        throw new Error('SEO optimization failed: ' + seoResult.error);
      }
      
      // Step 6: Hashtag Optimization
      console.log('[SimpleWorkflowExecutor] Step 6: Hashtag Optimization');
      
      const hashtagResult = await this.orchestrator.hashtagOptimizationAgent.execute({
        type: 'optimize-hashtags',
        content: {
          title: contentPlanResult.result.contentPlan.title,
          description: scriptResult.result.script.script || ''
        },
        platform: workflowData.platform || 'youtube'
      });
      
      if (!hashtagResult.success) {
        throw new Error('Hashtag optimization failed: ' + hashtagResult.error);
      }
      
      // Step 7: Caption Generation
      console.log('[SimpleWorkflowExecutor] Step 7: Caption Generation');
      
      const captionResult = await this.orchestrator.captionGenerationAgent.execute({
        type: 'generate-captions',
        content: {
          title: contentPlanResult.result.contentPlan.title,
          text: scriptResult.result.script.script || '',
          id: scriptResult.result.script.id
        },
        options: {
          platform: workflowData.platform || 'youtube'
        }
      });
      
      if (!captionResult.success) {
        throw new Error('Caption generation failed: ' + captionResult.error);
      }
      
      // Workflow completed successfully
      const workflowResult = {
        contentPlan: contentPlanResult.result.contentPlan,
        script: scriptResult.result.script || scriptResult.result,
        video: videoResult.result.createdVideo || videoResult.result,
        thumbnail: thumbnailResult.result.thumbnails || thumbnailResult.result,
        seo: seoResult.result.optimization || seoResult.result,
        hashtags: hashtagResult.result.hashtags || hashtagResult.result,
        caption: captionResult.result.captions || captionResult.result,
        timestamp: new Date().toISOString()
      };
      
      // Save workflow result
      const resultsDir = path.join(__dirname, '../../data/workflow-results');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      const resultPath = path.join(resultsDir, `workflow-result-${Date.now()}.json`);
      fs.writeFileSync(resultPath, JSON.stringify(workflowResult, null, 2));
      
      console.log('[SimpleWorkflowExecutor] Content creation workflow completed successfully');
      
      return {
        status: 'completed',
        result: workflowResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[SimpleWorkflowExecutor] Workflow failed:', error);
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = SimpleWorkflowExecutor;