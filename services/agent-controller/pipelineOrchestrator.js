  async generateScript(pipelineId, topic, options = {}) {
    try {
      console.log(`📝 Generating script for pipeline ${pipelineId}`);

      // Prepare script data
      const scriptData = {
        topic,
        contentType: options.contentType || 'explanation',
        targetLength: options.targetLength || '5min',
        tone: options.tone || 'informativ',
        audience: options.audience || 'all',
        trendingKeywords: options.trendingKeywords || [],
        customInstructions: options.customInstructions || '',
        useChainOfThought: options.useChainOfThought !== false, // Default to true
        enableSelfReflection: options.enableSelfReflection !== false // Default to true
      };

      // Generate script
      const scriptResult = await this.scriptService.generateScript(scriptData);

      // Perform final quality check before submitting for approval
      console.log(`🔍 Performing final quality check for script ${scriptResult.scriptId}`);
      const qualityCheck = await this.scriptService.finalQualityCheck(
        scriptResult.scriptId,
        scriptResult.content,
        scriptResult.metadata
      );

      // Check approval status
      if (qualityCheck.approvalStatus === 'rejected') {
        throw new Error(`Script rejected due to quality issues: ${qualityCheck.approvalReason}`);
      }

      // Add quality check results to script metadata
      scriptResult.metadata.qualityCheck = qualityCheck;

      // NEW: Submit script for approval before proceeding
      console.log('📋 Submitting script for approval...');
      const approvalAgent = this.agentPool.getAgent('ContentApprovalAgent');
      if (!approvalAgent) {
        throw new Error('ContentApprovalAgent not available');
      }

      // Submit script for approval
      const approvalSubmission = await approvalAgent.execute({
        type: 'submit-for-approval',
        content: {
          type: 'script',
          topic: topic,
          contentType: options.contentType || 'explanation',
          scriptData: scriptResult,
          metadata: scriptResult.metadata
        }
      });

      if (!approvalSubmission.success) {
        throw new Error(`Failed to submit script for approval: ${approvalSubmission.error}`);
      }

      console.log(`📋 Script submitted for approval with ID: ${approvalSubmission.result.approvalId}`);

      // Wait for approval (in a real implementation, this would be asynchronous)
      // For demo purposes, we'll auto-approve after a short delay
      console.log('⏳ Waiting for content approval...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, we'll auto-approve
      // In a real implementation, this would wait for actual user approval
      const approvalResult = await approvalAgent.execute({
        type: 'approve-content',
        approvalId: approvalSubmission.result.approvalId,
        reviewNotes: 'Auto-approved for demo purposes'
      });

      if (!approvalResult.success || approvalResult.result.status !== 'approved') {
        throw new Error('Script was not approved for production');
      }

      console.log('✅ Script approved for production');

      // Save updated script with quality check results
      this.scriptService.saveScript(scriptResult.scriptId, scriptResult.content, scriptResult.metadata);

      console.log(`✅ Script generated and approved for production: ${scriptResult.scriptId}`);

      // Save to pipeline results
      const pipelineResult = {
        scriptId: scriptResult.scriptId,
        content: scriptResult.content,
        metadata: scriptResult.metadata
      };

      await this.savePipelineResult(pipelineId, 'script', pipelineResult);

      return pipelineResult;
    } catch (error) {
      console.error('❌ Script generation failed:', error);
      throw error;
    }
  }