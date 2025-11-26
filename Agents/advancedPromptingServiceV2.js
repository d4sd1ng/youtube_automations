const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Advanced Prompting Service V2
 * Enhanced LLM prompt engineering with Chain-of-Thought, Few-Shot Learning, and Self-Reflection
 */
class AdvancedPromptingServiceV2 {
  constructor() {
    this.promptsDir = path.join(__dirname, '../../data/prompt-templates');
    this.cacheDir = path.join(__dirname, '../../data/prompt-cache');
    this.resultsDir = path.join(__dirname, '../../data/prompt-results');

    // NEW: Template Management Integration
    this.templateManagementService = require('./templateManagementService');
    this.templateService = new this.templateManagementService();

    // Load advanced prompting framework
    this.framework = this.loadFramework();

    // Token efficiency settings
    this.tokenOptimization = {
      maxPromptTokens: 1500,
      maxResponseTokens: 2000,
      compressionStrategies: {
        'aggressive': 0.6,
        'moderate': 0.8,
        'light': 0.9
      }
    };

    this.ensureDirectories();
  }

  /**
   * Load advanced prompting framework
   */
  loadFramework() {
    try {
      const frameworkPath = path.join(this.promptsDir, 'advanced-prompting-framework.json');
      if (fs.existsSync(frameworkPath)) {
        const rawData = fs.readFileSync(frameworkPath, 'utf8');
        const data = JSON.parse(rawData);
        return data; // Return the entire data object
      } else {
        console.error('❌ Advanced prompting framework not found at:', frameworkPath);
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to load advanced prompting framework:', error);
      return null;
    }
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.promptsDir, this.cacheDir, this.resultsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate enhanced prompt with Chain-of-Thought reasoning using templates
   */
  generateEnhancedPrompt(options = {}) {
    const {
      contentType,
      targetLength,
      tone,
      topic,
      trendingKeywords = [],
      audience = 'alle',
      sourceContent = '',
      customInstructions = '',
      templateName = null
    } = options;

    try {
      // Validate framework is loaded
      if (!this.framework) {
        throw new Error('Prompting framework not loaded');
      }

      let contentTemplate;

      // NEW: Use custom template if specified
      if (templateName && this.templateService.isTemplateAvailable('prompt', templateName)) {
        contentTemplate = this.templateService.loadTemplate('prompt', templateName);
        // If it's a custom template, we need to access the template data directly
        if (contentTemplate && contentTemplate.system_prompt) {
          // This is a direct template structure
        } else if (contentTemplate && contentTemplate.prompt_templates) {
          // This is the framework structure, get the appropriate content type
          contentTemplate = contentTemplate.prompt_templates[contentType] ||
                           Object.values(contentTemplate.prompt_templates)[0];
        }
      } else {
        // Get content template (note: templates are under prompt_templates, not directly in framework)
        contentTemplate = this.framework.prompt_templates[contentType];
      }

      if (!contentTemplate) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      // Build enhanced prompt with improved structure and quality
      let prompt = '';

      // 1. Role definition with enhanced characteristics
      prompt += `ROLE DEFINITION:\n`;
      prompt += `You are a world-class expert in ${contentType} content creation.\n`;
      prompt += `Your expertise includes: ${contentTemplate.role_playing.characteristics}\n\n`;
      prompt += `PERSONA GUIDANCE:\n`;
      prompt += `${contentTemplate.role_playing.persona_guidance}\n\n`;

      // 2. System context with quality standards
      prompt += `SYSTEM CONTEXT AND QUALITY STANDARDS:\n`;
      prompt += `${contentTemplate.system_prompt}\n`;
      prompt += `Quality Requirements:\n`;
      prompt += `- Provide highly detailed and comprehensive content\n`;
      prompt += `- Use clear, engaging language appropriate for ${audience}\n`;
      prompt += `- Incorporate current trends: ${trendingKeywords.join(', ') || 'None specified'}\n`;
      prompt += `- Structure content logically with smooth transitions\n`;
      prompt += `- Ensure factual accuracy and provide specific examples\n\n`;

      // 3. Enhanced Chain-of-Thought structure with quality checkpoints
      prompt += `ADVANCED CHAIN-OF-THOUGHT REASONING WITH QUALITY CHECKPOINTS:\n`;
      prompt += `Follow this structured thinking process:\n`;
      for (const [step, instruction] of Object.entries(contentTemplate.chain_of_thought_structure)) {
        prompt += `- ${step.toUpperCase()}: ${instruction.replace('{topic}', topic).replace('{keywords}', trendingKeywords.join(', ') || 'relevant trends')}\n`;
      }
      prompt += `\nQuality Checkpoints:\n`;
      prompt += `1. After Step 1: Verify problem identification is specific and relevant\n`;
      prompt += `2. After Step 3: Ensure hypothesis formation considers multiple perspectives\n`;
      prompt += `3. After Step 4: Check solution development for completeness and clarity\n`;
      prompt += `4. After Step 5: Validate all facts and claims with reliable sources\n\n`;

      // 4. Enhanced Few-shot examples with quality explanations
      if (contentTemplate.few_shot_examples && contentTemplate.few_shot_examples.length > 0) {
        prompt += `ENHANCED FEW-SHOT EXAMPLES WITH QUALITY EXPLANATIONS:\n`;
        contentTemplate.few_shot_examples.forEach((example, index) => {
          // Handle different example structures
          const exampleObj = example.example_1 ? example.example_1 : example;
          if (exampleObj.topic) {
            prompt += `Example ${index + 1}:\n`;
            prompt += `Topic: ${exampleObj.topic}\n`;
            prompt += `Thought Process: ${exampleObj.thought_process}\n`;
            prompt += `Structure: ${exampleObj.script_structure}\n`;
            if (exampleObj.output_example) {
              prompt += `Output Example: ${exampleObj.output_example}\n`;
            }
            prompt += `Quality Analysis: This example demonstrates excellent structure, clear thinking, and engaging delivery.\n\n`;
          }
        });
      }

      // 5. Detailed task specification with quality requirements
      prompt += `YOUR DETAILED TASK WITH QUALITY REQUIREMENTS:\n`;
      prompt += `Create a ${contentType} for a ${targetLength} YouTube video about "${topic}".\n`;
      prompt += `Target Audience: ${audience}\n`;
      prompt += `Tone: ${tone}\n`;
      if (trendingKeywords.length > 0) {
        prompt += `Trending Keywords to Incorporate: ${trendingKeywords.join(', ')}\n`;
      }
      prompt += `\nQuality Requirements:\n`;
      prompt += `- Provide deep insights and unique perspectives\n`;
      prompt += `- Include specific facts, statistics, or examples\n`;
      prompt += `- Use engaging storytelling techniques\n`;
      prompt += `- Address potential audience questions or objections\n`;
      prompt += `- Include clear calls-to-action where appropriate\n\n`;

      // 6. Source content context with analysis guidance
      if (sourceContent) {
        prompt += `SOURCE CONTENT FOR ANALYSIS AND INTEGRATION:\n`;
        prompt += `${sourceContent.substring(0, 1000)}${sourceContent.length > 1000 ? '...' : ''}\n`;
        prompt += `\nGuidance: Analyze this content for key insights and integrate relevant information while maintaining your own unique perspective.\n\n`;
      }

      // 7. Custom instructions with quality enhancement
      if (customInstructions) {
        prompt += `ADDITIONAL CUSTOM INSTRUCTIONS WITH QUALITY ENHANCEMENT:\n`;
        prompt += `${customInstructions}\n`;
        prompt += `Enhancement: Ensure these instructions are fully integrated while maintaining overall content quality.\n\n`;
      }

      // 8. Enhanced Self-reflection component with detailed quality metrics
      prompt += `COMPREHENSIVE SELF-REFLECTION AND QUALITY ASSESSMENT:\n`;
      prompt += `Before finalizing your script, conduct a thorough self-assessment:\n\n`;

      // Check if self_reflection exists in contentTemplate first
      if (contentTemplate.self_reflection_checklist) {
        const reflectionPrompts = contentTemplate.self_reflection_checklist
          .map(rp => rp.replace('{audience}', audience).replace('{keywords}', trendingKeywords.join(', ') || 'relevant trends'))
          .map((rp, index) => `${index + 1}. ${rp}`)
          .join('\n');
        prompt += reflectionPrompts + '\n\n';
      } else if (this.framework.components && this.framework.components.self_reflection && this.framework.components.self_reflection.default_prompts) {
        // Fallback to framework-level self_reflection
        const reflectionPrompts = this.framework.components.self_reflection.default_prompts
          .map(rp => rp.replace('{audience}', audience).replace('{keywords}', trendingKeywords.join(', ') || 'relevant trends'))
          .map((rp, index) => `${index + 1}. ${rp}`)
          .join('\n');
        prompt += reflectionPrompts + '\n\n';
      }

      // Add enhanced quality metrics
      prompt += `Enhanced Quality Metrics:\n`;
      prompt += `1. Content Depth: Have you provided substantial insights beyond surface-level information?\n`;
      prompt += `2. Audience Engagement: Does your content actively engage the target audience?\n`;
      prompt += `3. Originality: Have you offered unique perspectives or novel combinations of ideas?\n`;
      prompt += `4. Practical Value: Does your content provide actionable insights or solutions?\n`;
      prompt += `5. Structural Excellence: Is your content well-organized with smooth transitions?\n\n`;

      prompt += `Revise and improve your content based on this self-assessment to achieve the highest quality.\n\n`;

      // 9. Enhanced Output format specification with quality guidelines
      prompt += `ENHANCED OUTPUT FORMAT SPECIFICATION WITH QUALITY GUIDELINES:\n`;
      prompt += `Structure your response as follows:\n`;
      prompt += `- Compelling Hook: Grab attention immediately with a surprising fact, question, or statement\n`;
      prompt += `- Clear Introduction: Introduce the topic and establish relevance\n`;
      prompt += `- Well-Organized Main Content: Use clear sections with descriptive headings\n`;
      prompt += `- Engaging Delivery: Use storytelling, examples, and varied sentence structures\n`;
      prompt += `- Strong Conclusion: Summarize key points and provide clear takeaways\n`;
      prompt += `- Appropriate Call-to-Action: Encourage engagement or next steps\n\n`;
      prompt += `Formatting Requirements:\n`;
      prompt += `- Length: Approximately ${targetLength}\n`;
      prompt += `- Tone: ${tone}, suitable for ${audience}\n`;
      prompt += `- Language: Clear, engaging, and appropriate for YouTube audience\n`;
      prompt += `- Style: Conversational yet professional\n\n`;

      // 10. Final quality reinforcement
      prompt += `FINAL QUALITY REINFORCEMENT:\n`;
      prompt += `Remember: Your goal is to create exceptional content that educates, entertains, and inspires your audience.\n`;
      prompt += `Strive for depth, clarity, and originality in every section.\n`;
      prompt += `Take time to refine and polish your work before submission.\n`;

      return {
        prompt: this.optimizeTokenUsage(prompt),
        metadata: {
          contentType,
          targetLength,
          tone,
          estimatedTokens: this.estimateTokens(prompt),
          optimizationLevel: this.getOptimizationLevel(prompt),
          qualityScore: this.calculateEnhancedQualityScore(options, prompt)
        }
      };

    } catch (error) {
      console.error('❌ Failed to generate enhanced prompt:', error);
      return this.generateFallbackPrompt(options);
    }
  }

  /**
   * Optimize prompt for token efficiency
   */
  optimizeTokenUsage(prompt) {
    const estimatedTokens = this.estimateTokens(prompt);

    if (estimatedTokens <= this.tokenOptimization.maxPromptTokens) {
      return prompt; // Already optimal
    }

    // Apply compression strategies
    let optimized = prompt;

    // Remove redundant phrases
    optimized = optimized.replace(/\b(bitte|auch|dabei|jedoch|allerdings)\b/g, '');

    // Compress whitespace
    optimized = optimized.replace(/\n{3,}/g, '\n\n');
    optimized = optimized.replace(/\s{2,}/g, ' ');

    // Shorten explanations if still too long
    if (this.estimateTokens(optimized) > this.tokenOptimization.maxPromptTokens) {
      const lines = optimized.split('\n');
      const importantLines = lines.filter(line =>
        line.includes('ROLE:') ||
        line.includes('AUFGABE:') ||
        line.includes('{topic}') ||
        line.trim().length < 50
      );
      optimized = importantLines.join('\n');
    }

    return optimized;
  }

  /**
   * Estimate token count for prompt
   */
  estimateTokens(text) {
    // Rough estimation: 1 token ≈ 4 characters for German text
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate enhanced quality score for prompt options
   */
  calculateEnhancedQualityScore(options, prompt) {
    let score = 0;

    // Topic specificity and relevance (0-20)
    if (options.topic && options.topic.length > 10) score += 20;
    else if (options.topic && options.topic.length > 5) score += 15;
    else score += 5;

    // Content type match and framework support (0-15)
    if (this.framework && this.framework.prompt_templates[options.contentType]) score += 15;
    else score += 5;

    // Length and tone specification (0-15)
    if (options.targetLength && options.tone) score += 15;
    else if (options.targetLength || options.tone) score += 10;
    else score += 5;

    // Audience targeting (0-10)
    if (options.audience && options.audience !== 'alle') score += 10;
    else if (options.audience) score += 5;
    else score += 2;

    // Trending keywords utilization (0-10)
    if (options.trendingKeywords && options.trendingKeywords.length > 2) score += 10;
    else if (options.trendingKeywords && options.trendingKeywords.length > 0) score += 5;
    else score += 2;

    // Source content integration (0-10)
    if (options.sourceContent && options.sourceContent.length > 100) score += 10;
    else if (options.sourceContent && options.sourceContent.length > 50) score += 5;
    else score += 2;

    // Custom instructions (0-10)
    if (options.customInstructions && options.customInstructions.length > 20) score += 10;
    else if (options.customInstructions && options.customInstructions.length > 10) score += 5;
    else score += 2;

    // Prompt complexity and depth (0-10)
    const promptLengthScore = Math.min(10, Math.floor(this.estimateTokens(prompt) / 100));
    score += promptLengthScore;

    return Math.min(score, 100);
  }

  /**
   * Get optimization level based on prompt complexity
   */
  getOptimizationLevel(prompt) {
    const tokens = this.estimateTokens(prompt);

    if (tokens < 500) return 'light';
    if (tokens < 1000) return 'moderate';
    return 'aggressive';
  }

  /**
   * Generate fallback prompt for error cases
   */
  generateFallbackPrompt(options) {
    const { contentType, topic, targetLength, tone } = options;

    const fallback = `ROLE: Du bist ein Experte für YouTube-Content.

AUFGABE: Erstelle ein ${contentType} für ein ${targetLength} YouTube-Video über "${topic}".
Stil: ${tone}
Halte es prägnant und zielgruppen-gerecht.

STRUKTUR:
1. Einleitung mit Hook
2. Hauptteil
3. Fazit mit Call-to-Action`;

    return {
      prompt: fallback,
      metadata: {
        isFallback: true,
        contentType,
        estimatedTokens: this.estimateTokens(fallback),
        qualityScore: 50
      }
    };
  }

  /**
   * Test prompt with different LLM providers
   */
  async testPrompt(promptOptions, testProviders = ['ollama']) {
    const promptData = this.generateEnhancedPrompt(promptOptions);
    const testId = uuidv4();

    const results = {
      testId,
      prompt: promptData.prompt,
      metadata: promptData.metadata,
      providerResults: {},
      qualityAnalysis: {},
      recommendation: ''
    };

    console.log(`🧪 Testing prompt ${testId} with providers:`, testProviders);

    for (const provider of testProviders) {
      try {
        const startTime = Date.now();

        // Mock LLM call for now - would integrate with actual LLM services
        const mockResponse = await this.mockLLMCall(promptData.prompt, provider);

        results.providerResults[provider] = {
          response: mockResponse.content,
          responseTime: Date.now() - startTime,
          tokenUsage: mockResponse.tokenUsage,
          quality: this.assessResponseQuality(mockResponse.content, promptOptions),
          cost: this.estimateCost(mockResponse.tokenUsage, provider)
        };

      } catch (error) {
        results.providerResults[provider] = {
          error: error.message,
          success: false
        };
      }
    }

    // Analyze results and generate recommendation
    results.recommendation = this.generateRecommendation(results);

    // Save test results
    await this.saveTestResults(results);

    return results;
  }

  /**
   * Mock LLM call for testing
   */
  async mockLLMCall(prompt, provider) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));

    // Generate a more realistic response based on the prompt quality
    // Higher quality prompts should produce higher quality responses
    const promptQuality = this.calculateEnhancedQualityScore(
      {
        topic: prompt.match(/YouTube video about "([^"]+)"/)?.[1] || "default topic",
        contentType: prompt.match(/Create a ([^ ]+) for/)?.[1] || "news",
        targetLength: prompt.match(/([0-9]+min) YouTube video/)?.[1] || "5min",
        tone: prompt.match(/Tone: ([^ ]+)/)?.[1] || "informativ"
      },
      prompt
    );

    // Generate response length based on target length
    const targetLengthMatch = prompt.match(/([0-9]+min) YouTube video/);
    let responseLength = 750; // default for 5min

    if (targetLengthMatch) {
      const target = targetLengthMatch[1];
      const mapping = {
        '30s': 75,
        '1min': 150,
        '5min': 750,
        '10min': 1500,
        '15min': 2250
      };
      responseLength = mapping[target] || 750;
    }

    // Generate content based on content type
    const contentTypeMatch = prompt.match(/Create a ([^ ]+) for/);
    const contentType = contentTypeMatch ? contentTypeMatch[1] : "news";

    // Create a more realistic mock response
    let mockContent = "";

    switch(contentType) {
      case 'news':
        mockContent = `Wusstet ihr, dass ${promptQuality > 80 ? 'wir' : 'Experten'} aktuelle Entwicklungen im Bereich "${prompt.match(/YouTube video about "([^"]+)"/)?.[1] || 'Technologie'}" beobachten? Heute zeigen wir euch die wichtigsten Fakten und Auswirkungen.\n\n`;
        mockContent += "Inhaltspunkt 1: Wichtige Entwicklungen\n";
        mockContent += "Inhaltspunkt 2: Auswirkungen auf die Gesellschaft\n";
        mockContent += "Inhaltspunkt 3: Zukünftige Trends\n\n";
        mockContent += `Fazit: ${promptQuality > 85 ? 'Diese Entwicklungen werden unser Leben nachhaltig verändern.' : 'Bleibt dran für weitere Updates.'}`;
        break;

      case 'tutorial':
        mockContent = `In diesem Tutorial zeige ich euch, wie ihr "${prompt.match(/YouTube video about "([^"]+)"/)?.[1] || 'etwas Neues'}" meistert.\n\n`;
        mockContent += "Schritt 1: Vorbereitung\n";
        mockContent += "Schritt 2: Durchführung\n";
        mockContent += "Schritt 3: Überprüfung\n\n";
        mockContent += `Ergebnis: ${promptQuality > 85 ? 'Ihr habt es geschafft!' : 'Weitere Übung empfohlen.'}`;
        break;

      default:
        mockContent = `Willkommen zu unserem Video über "${prompt.match(/YouTube video about "([^"]+)"/)?.[1] || 'ein interessantes Thema'}".\n\n`;
        mockContent += "Abschnitt 1: Einführung\n";
        mockContent += "Abschnitt 2: Hauptteil\n";
        mockContent += "Abschnitt 3: Zusammenfassung\n\n";
        mockContent += `Abschluss: ${promptQuality > 85 ? 'Danke fürs Zuschauen!' : 'Kommentiert gerne eure Meinung.'}`;
    }

    // Adjust length to match target
    const currentWords = mockContent.split(/\s+/).length;
    if (currentWords < responseLength) {
      // Add more content
      const wordsToAdd = responseLength - currentWords;
      mockContent += "\n\nWeitere Informationen:\n" + "Zusätzlicher Inhalt. ".repeat(Math.ceil(wordsToAdd / 3));
    } else if (currentWords > responseLength) {
      // Trim content
      const words = mockContent.split(/\s+/);
      mockContent = words.slice(0, responseLength).join(' ');
    }

    return {
      content: mockContent,
      tokenUsage: {
        prompt: this.estimateTokens(prompt),
        response: this.estimateTokens(mockContent),
        total: this.estimateTokens(prompt + mockContent)
      }
    };
  }

  /**
   * Assess response quality with enhanced metrics
   */
  assessResponseQuality(response, originalOptions) {
    let score = 0;

    // Length appropriateness (0-20)
    const targetWords = this.getTargetWords(originalOptions.targetLength);
    const actualWords = response.split(/\s+/).length;
    const lengthScore = Math.max(0, 100 - Math.abs(actualWords - targetWords) / targetWords * 100);
    score += lengthScore * 0.2;

    // Topic relevance (0-20)
    const topicWords = originalOptions.topic.toLowerCase().split(/\s+/);
    const responseWords = response.toLowerCase();
    const relevance = topicWords.filter(word => responseWords.includes(word)).length / Math.max(topicWords.length, 1) * 100;
    score += relevance * 0.2;

    // Structure presence (0-15)
    const hasStructure = (response.includes('\n') ? 1 : 0) + (response.split('.').length > 2 ? 1 : 0);
    score += hasStructure * 7.5;

    // Trending keywords integration (0-15)
    const keywords = originalOptions.trendingKeywords || [];
    const keywordScore = keywords.filter(kw =>
      responseWords.includes(kw.toLowerCase())
    ).length / Math.max(keywords.length, 1) * 100;
    score += keywordScore * 0.15;

    // Depth of content (0-15)
    // Check for specific indicators of depth
    const depthIndicators = ['detailed', 'comprehensive', 'specifically', 'example', 'analysis', 'research', 'studies', 'findings', 'in-depth', 'thorough'];
    const depthScore = depthIndicators.filter(indicator =>
      responseWords.includes(indicator)
    ).length / depthIndicators.length * 100;
    score += depthScore * 0.15;

    // Engagement factors (0-15)
    // Check for engagement indicators
    const engagementIndicators = ['hook', 'attention', 'interesting', 'surprising', 'story', 'question', 'imagine', 'consider', 'think about', 'engaging', 'compelling'];
    const engagementScore = engagementIndicators.filter(indicator =>
      responseWords.includes(indicator)
    ).length / engagementIndicators.length * 100;
    score += engagementScore * 0.15;

    return Math.min(score, 100);
  }

  /**
   * Get target word count for length
   */
  getTargetWords(targetLength) {
    const mapping = {
      '30s': 75,
      '1min': 150,
      '5min': 750,
      '10min': 1500,
      '15min': 2250
    };
    return mapping[targetLength] || 750;
  }

  /**
   * Estimate cost for token usage
   */
  estimateCost(tokenUsage, provider) {
    const costs = {
      'openai': { input: 0.003, output: 0.006 }, // per 1K tokens
      'anthropic': { input: 0.008, output: 0.024 },
      'ollama': { input: 0, output: 0 }
    };

    const providerCosts = costs[provider] || costs.ollama;

    return {
      input: (tokenUsage.prompt / 1000) * providerCosts.input,
      output: (tokenUsage.response / 1000) * providerCosts.output,
      total: (tokenUsage.prompt / 1000) * providerCosts.input +
             (tokenUsage.response / 1000) * providerCosts.output
    };
  }

  /**
   * Generate recommendation based on test results with enhanced analysis
   */
  generateRecommendation(results) {
    const providers = Object.keys(results.providerResults);

    if (providers.length === 0) {
      return 'Keine erfolgreichen Tests - Überprüfe Provider-Konfiguration';
    }

    // Find best provider by quality and cost
    let bestProvider = providers[0];
    let bestScore = 0;
    let bestQuality = 0;
    let bestResponseTime = 0;

    for (const provider of providers) {
      const result = results.providerResults[provider];
      if (result.error) continue;

      // Composite score: quality (70%) + cost efficiency (15%) + speed (15%)
      const qualityScore = result.quality || 0;
      const costEfficiency = result.cost.total === 0 ? 100 : Math.max(0, 100 - result.cost.total * 1000);
      const speedScore = Math.max(0, 100 - result.responseTime / 100); // Normalize to 100ms base
      const compositeScore = qualityScore * 0.7 + costEfficiency * 0.15 + speedScore * 0.15;

      if (compositeScore > bestScore) {
        bestScore = compositeScore;
        bestProvider = provider;
        bestQuality = qualityScore;
        bestResponseTime = result.responseTime;
      }
    }

    // Provide detailed recommendation
    const bestResult = results.providerResults[bestProvider];

    return `Empfohlener Provider: ${bestProvider}\n` +
           `Qualität: ${Math.round(bestQuality)}%\n` +
           `Kosten: $${bestResult.cost.total.toFixed(4)}\n` +
           `Antwortzeit: ${bestResponseTime}ms\n` +
           `Composite Score: ${Math.round(bestScore)}\n\n` +
           `Bewertung: ${this.getQualityDescription(bestQuality)}`;
  }

  /**
   * Get quality description based on score
   */
  getQualityDescription(score) {
    if (score >= 90) return "Hervorragend - Sehr hohe Qualität";
    if (score >= 80) return "Sehr Gut - Hohe Qualität mit guten Ergebnissen";
    if (score >= 70) return "Gut - Solide Qualität, einige Verbesserungsmöglichkeiten";
    if (score >= 60) return "Befriedigend - Akzeptable Qualität";
    if (score >= 50) return "Ausreichend - Minimale Anforderungen erfüllt";
    if (score >= 40) return "Mangelhaft - Deutliche Verbesserung nötig";
    return "Ungenügend - Starke Qualitätsprobleme";
  }

  /**
   * Save test results
   */
  async saveTestResults(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `enhanced-prompt-test-${results.testId}-${timestamp}.json`;
    const filepath = path.join(this.resultsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    console.log(`💾 Enhanced prompt test results saved: ${filename}`);
  }

  /**
   * Get service statistics
   */
  getStats() {
    try {
      const testFiles = fs.readdirSync(this.resultsDir)
        .filter(f => f.startsWith('enhanced-prompt-test-') && f.endsWith('.json'));

      const stats = {
        totalTests: testFiles.length,
        supportedContentTypes: this.framework ? Object.keys(this.framework.prompt_templates) : [],
        tokenOptimization: this.tokenOptimization,
        averageQuality: 0,
        recentTests: []
      };

      // Analyze recent tests
      const recentTests = testFiles
        .slice(-10)
        .map(file => {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(this.resultsDir, file)));
            return {
              testId: data.testId,
              qualityScore: data.metadata.qualityScore,
              providers: Object.keys(data.providerResults),
              recommendation: data.recommendation
            };
          } catch (error) {
            return null;
          }
        })
        .filter(test => test !== null);

      stats.recentTests = recentTests;
      stats.averageQuality = recentTests.length > 0
        ? recentTests.reduce((sum, test) => sum + test.qualityScore, 0) / recentTests.length
        : 0;

      return stats;
    } catch (error) {
      console.error('❌ Failed to get prompt stats:', error);
      return {
        totalTests: 0,
        error: error.message
      };
    }
  }
}

module.exports = AdvancedPromptingServiceV2;