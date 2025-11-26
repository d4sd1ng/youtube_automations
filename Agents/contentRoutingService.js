const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const QualityAssuranceService = require('./qualityAssuranceService');

/**
 * Content Routing Service
 * Leitet Inhalte basierend auf Momentum-Scores und Zielgruppen zu den richtigen Kanälen und Formaten
 */
class ContentRoutingService {
  constructor() {
    this.routingDir = path.join(__dirname, '../../data/routing');
    this.channelsDir = path.join(__dirname, '../../data/channels');
    this.qaService = new QualityAssuranceService();
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.routingDir, this.channelsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Route content by momentum scores to appropriate channels
   */
  routeContentByMomentum(routingData) {
    try {
      console.log('🔄 Routing content by momentum scores...');
      
      const { topics_with_momentum, channels, content_formats } = routingData;
      const routingResults = {};
      
      // Load channel strategies
      const channelStrategies = this.loadChannelStrategies();
      
      // For each topic, determine best channel and formats
      topics_with_momentum.forEach(topic => {
        const topicId = uuidv4();
        const bestChannel = this.determineBestChannel(topic, channelStrategies);
        const bestFormats = this.determineBestFormats(topic, bestChannel, channelStrategies);
        
        routingResults[topicId] = {
          topic: topic,
          assigned_channel: bestChannel,
          assigned_formats: bestFormats,
          routing_score: this.calculateRoutingScore(topic, bestChannel, channelStrategies),
          created_at: new Date().toISOString()
        };
      });
      
      // Save routing results
      this.saveRoutingResults(routingResults);
      
      console.log(`✅ Content routed to ${Object.keys(routingResults).length} topics across channels`);
      return routingResults;
    } catch (error) {
      console.error('❌ Failed to route content by momentum:', error);
      throw error;
    }
  }

  /**
   * Load channel strategies from configuration
   */
  loadChannelStrategies() {
    try {
      const strategyPath = path.join(this.channelsDir, 'dual-channel-strategy.json');
      if (fs.existsSync(strategyPath)) {
        return JSON.parse(fs.readFileSync(strategyPath, 'utf8'));
      }
      return {};
    } catch (error) {
      console.error('❌ Failed to load channel strategies:', error);
      return {};
    }
  }

  /**
   * Determine the best channel for a topic
   */
  determineBestChannel(topic, channelStrategies) {
    // Calculate scores for each channel
    const channelScores = {};
    
    // Autonova scoring (business/tech topics)
    if (this.matchesChannelKeywords(topic.topic.toLowerCase(), channelStrategies.autonova)) {
      channelScores.autonova = this.calculateChannelScore(topic, channelStrategies.autonova);
    } else {
      channelScores.autonova = 0;
    }
    
    // Politara scoring (politics/law topics)
    if (this.matchesChannelKeywords(topic.topic.toLowerCase(), channelStrategies.politara)) {
      channelScores.politara = this.calculateChannelScore(topic, channelStrategies.politara);
    } else {
      channelScores.politara = 0;
    }
    
    // Return channel with highest score
    return Object.keys(channelScores).reduce((a, b) => channelScores[a] > channelScores[b] ? a : b);
  }

  /**
   * Check if topic matches channel keywords
   */
  matchesChannelKeywords(topic, channelStrategy) {
    // Handle different strategy structures for autonova and politara
    let keywords = [];
    
    if (channelStrategy.lead_generation) {
      // Autonova structure
      keywords = [
        ...channelStrategy.content_goals,
        ...channelStrategy.lead_generation.top_of_funnel,
        ...channelStrategy.lead_generation.middle_of_funnel,
        ...channelStrategy.lead_generation.bottom_of_funnel
      ];
    } else if (channelStrategy.content_strategy) {
      // Politara structure
      keywords = [
        ...channelStrategy.content_goals,
        ...channelStrategy.content_strategy.top_of_funnel,
        ...channelStrategy.content_strategy.middle_of_funnel,
        ...channelStrategy.content_strategy.bottom_of_funnel
      ];
    } else {
      // Fallback to content_goals only
      keywords = channelStrategy.content_goals || [];
    }
    
    // Add lead strategy keywords for autonova if available
    if (channelStrategy.lead_strategy) {
      const leadStrategyKeywords = [
        ...channelStrategy.lead_strategy.conversion_optimization.primary_cta,
        ...channelStrategy.lead_strategy.conversion_optimization.secondary_cta,
        ...channelStrategy.lead_strategy.conversion_optimization.tertiary_cta
      ];
      keywords = [...keywords, ...leadStrategyKeywords];
    }
    
    // Add LinkedIn content keywords for autonova if available
    if (channelStrategy.content_types && channelStrategy.content_types.linkedin_content) {
      const linkedinKeywords = [
        "LinkedIn",
        "Thought Leadership",
        "Branchenanalysen",
        "Unternehmensnachrichten",
        "Expert Insights"
      ];
      keywords = [...keywords, ...linkedinKeywords];
    }
    
    const topicLower = topic.toLowerCase();
    return keywords.some(keyword => topicLower.includes(keyword.toLowerCase()));
  }

  /**
   * Calculate channel score for a topic
   */
  calculateChannelScore(topic, channelStrategy) {
    // Base score on momentum
    let score = topic.momentum_score || 5.0;
    
    // Boost score if topic matches channel focus areas
    let focusAreas = [];
    
    if (channelStrategy.lead_generation) {
      // Autonova structure
      focusAreas = [
        ...channelStrategy.content_goals,
        ...channelStrategy.lead_generation.top_of_funnel
      ];
    } else if (channelStrategy.content_strategy) {
      // Politara structure
      focusAreas = [
        ...channelStrategy.content_goals,
        ...channelStrategy.content_strategy.top_of_funnel
      ];
    } else {
      // Fallback to content_goals only
      focusAreas = channelStrategy.content_goals || [];
    }
    
    // Add lead strategy focus areas for autonova if available
    if (channelStrategy.lead_strategy) {
      const leadStrategyFocus = [
        ...channelStrategy.lead_strategy.conversion_optimization.primary_cta,
        ...channelStrategy.lead_strategy.conversion_optimization.secondary_cta
      ];
      focusAreas = [...focusAreas, ...leadStrategyFocus];
    }
    
    // Add LinkedIn content focus areas for autonova if available
    if (channelStrategy.content_types && channelStrategy.content_types.linkedin_content) {
      const linkedinFocus = [
        "Branchenanalysen",
        "Thought Leadership",
        "Expert Insights"
      ];
      focusAreas = [...focusAreas, ...linkedinFocus];
    }
    
    const topicLower = topic.topic.toLowerCase();
    const matches = focusAreas.filter(area => topicLower.includes(area.toLowerCase()));
    score += matches.length * 2; // Boost by 2 points for each match
    
    return Math.min(score, 10.0); // Cap at 10.0
  }

  /**
   * Determine the best formats for a topic and channel
   */
  determineBestFormats(topic, channel, channelStrategies) {
    const channelStrategy = channelStrategies[channel];
    const formats = [];
    
    // Add default formats based on channel
    if (channel === 'autonova') {
      formats.push('short', 'long', 'blog', 'case_study', 'newsletter');
    } else if (channel === 'politara') {
      formats.push('short', 'long', 'podcast', 'newsletter', 'email');
    }
    
    // Adjust formats based on topic momentum
    if (topic.momentum_score > 7.5) {
      // High momentum - add all formats
      formats.push('podcast', 'email');
    } else if (topic.momentum_score < 5.0) {
      // Low momentum - focus on fewer formats
      return ['short', 'newsletter'];
    }
    
    // For autonova, prioritize formats that support lead generation
    if (channel === 'autonova') {
      formats.push('case_study', 'email');
      
      // Add LinkedIn content format if available in strategy
      if (channelStrategy.content_types && channelStrategy.content_types.linkedin_content) {
        formats.push('linkedin_article', 'linkedin_post');
      }
    }
    
    // Remove duplicates
    return [...new Set(formats)];
  }

  /**
   * Calculate routing score
   */
  calculateRoutingScore(topic, channel, channelStrategies) {
    const channelScore = this.calculateChannelScore(topic, channelStrategies[channel]);
    const momentumScore = topic.momentum_score || 5.0;
    
    // Weighted average
    return (channelScore * 0.6) + (momentumScore * 0.4);
  }

  /**
   * Assign keywords and topics to routed content
   */
  assignKeywordsAndTopics(routingResults) {
    try {
      console.log('🏷️ Assigning keywords and topics...');
      
      const assignedContent = {};
      
      for (const [topicId, routingInfo] of Object.entries(routingResults)) {
        // Extract keywords from topic
        const keywords = this.extractKeywords(routingInfo.topic.topic);
        
        assignedContent[topicId] = {
          ...routingInfo,
          assigned_keywords: keywords,
          content_uuid: uuidv4(),
          assigned_at: new Date().toISOString()
        };
      }
      
      // Save assigned content
      this.saveAssignedContent(assignedContent);
      
      console.log(`✅ Keywords and topics assigned to ${Object.keys(assignedContent).length} items`);
      return assignedContent;
    } catch (error) {
      console.error('❌ Failed to assign keywords and topics:', error);
      throw error;
    }
  }

  /**
   * Extract keywords from topic text
   */
  extractKeywords(topicText) {
    // Simple keyword extraction (in a real implementation, this would use NLP)
    const stopWords = ['der', 'die', 'das', 'und', 'oder', 'von', 'mit', 'für', 'ist', 'ein', 'eine'];
    const words = topicText.toLowerCase().split(/\s+/);
    
    // Filter out stop words and short words
    const keywords = words.filter(word => 
      word.length > 3 && 
      !stopWords.includes(word) &&
      !/\d/.test(word) // Remove words with numbers
    );
    
    // Remove duplicates
    return [...new Set(keywords)];
  }

  /**
   * Integrate shorts into workflow
   */
  integrateShortsIntoWorkflow(shortCreationResults) {
    try {
      console.log('🔗 Integrating shorts into workflow...');
      
      const integratedShorts = {};
      
      for (const [videoId, shortData] of Object.entries(shortCreationResults)) {
        // Perform quality assurance on shorts
        const qaResults = this.qaService.assessVideoQuality(shortData);
        
        integratedShorts[videoId] = {
          ...shortData,
          quality_metrics: qaResults,
          workflow_status: 'integrated',
          integration_timestamp: new Date().toISOString(),
          scheduled_upload_time: this.calculateNextUploadTime()
        };
      }
      
      // Save integration results
      this.saveShortIntegration(integratedShorts);
      
      console.log(`✅ ${Object.keys(integratedShorts).length} shorts integrated into workflow`);
      return integratedShorts;
    } catch (error) {
      console.error('❌ Failed to integrate shorts into workflow:', error);
      throw error;
    }
  }

  /**
   * Calculate next upload time
   */
  calculateNextUploadTime() {
    // For demonstration, set to 2 hours from now
    const now = new Date();
    now.setHours(now.getHours() + 2);
    return now.toISOString();
  }

  /**
   * Save routing results
   */
  saveRoutingResults(routingResults) {
    try {
      const filename = `routing-results-${Date.now()}.json`;
      const filepath = path.join(this.routingDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(routingResults, null, 2));
      console.log(`💾 Routing results saved: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to save routing results:', error);
    }
  }

  /**
   * Save assigned content
   */
  saveAssignedContent(assignedContent) {
    try {
      const filename = `assigned-content-${Date.now()}.json`;
      const filepath = path.join(this.routingDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(assignedContent, null, 2));
      console.log(`💾 Assigned content saved: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to save assigned content:', error);
    }
  }

  /**
   * Save short integration results
   */
  saveShortIntegration(integratedShorts) {
    try {
      const filename = `integrated-shorts-${Date.now()}.json`;
      const filepath = path.join(this.routingDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(integratedShorts, null, 2));
      console.log(`💾 Short integration results saved: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to save short integration results:', error);
    }
  }

  /**
   * Get routing statistics
   */
  getStats() {
    try {
      const routingFiles = fs.readdirSync(this.routingDir)
        .filter(f => f.startsWith('routing-results-') && f.endsWith('.json'));
      
      const assignedFiles = fs.readdirSync(this.routingDir)
        .filter(f => f.startsWith('assigned-content-') && f.endsWith('.json'));
      
      const shortFiles = fs.readdirSync(this.routingDir)
        .filter(f => f.startsWith('integrated-shorts-') && f.endsWith('.json'));
      
      return {
        totalRoutingJobs: routingFiles.length,
        totalAssignedContent: assignedFiles.length,
        totalIntegratedShorts: shortFiles.length,
        lastRoutingJob: routingFiles.length > 0 ? routingFiles[routingFiles.length - 1] : null
      };
    } catch (error) {
      console.error('❌ Failed to get routing stats:', error);
      return {
        totalRoutingJobs: 0,
        totalAssignedContent: 0,
        totalIntegratedShorts: 0,
        error: error.message
      };
    }
  }
}

module.exports = ContentRoutingService;