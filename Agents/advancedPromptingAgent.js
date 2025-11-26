const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Advanced Prompting Service
 * Specialized LLM prompt engineering for optimal YouTube script generation
 */
class AdvancedPromptingService {
  constructor() {
    this.promptsDir = path.join(__dirname, '../../../data/prompt-templates');
    this.cacheDir = path.join(__dirname, '../../../data/prompt-cache');
    this.resultsDir = path.join(__dirname, '../../../data/prompt-results');
    
    // Prompt template configurations
    this.promptTemplates = {
      // Content-Type specific templates
      contentTypes: {
        'news': {
          systemPrompt: `Du bist ein erfahrener YouTube-News-Creator. Erstelle Scripts, die:
- Aktuelle Ereignisse präzise und fesselnd präsentieren
- Mit einem starken Hook beginnen, der die Dringlichkeit vermittelt
- Fakten strukturiert und verständlich aufbereiten
- Den Kontext und die Auswirkungen für die Zielgruppe erklären
- Mit einem klaren Call-to-Action enden`,
          
          sectionPrompts: {
            hook: `Erstelle einen kraftvollen 10-15 Sekunden Hook für ein News-Video über "{topic}". 
Nutze diese Elemente: Dringlichkeit, Überraschung, direkte Ansprache der Zielgruppe.
Verwende emotionale Trigger und konkrete Zahlen/Fakten wenn verfügbar.
Trending Keywords: {keywords}`,
            
            main_points: `Strukturiere die Hauptpunkte zu "{topic}" für ein {length}-Video:
- 3-5 Kernpunkte in logischer Reihenfolge
- Jeder Punkt mit konkreten Fakten/Zahlen
- Verbindungen zwischen den Punkten
- Bezug zu aktuellen Trends: {keywords}
Zielgruppe: {audience}, Ton: {tone}`,
            
            context: `Erkläre den Kontext und die Bedeutung von "{topic}":
- Warum ist das jetzt wichtig?
- Welche Auswirkungen hat das auf {audience}?
- Historischer oder vergleichender Kontext
- Zukünftige Entwicklungen/Prognosen
Länge: {length}, Ton: {tone}`
          }
        },
        
        'tutorial': {
          systemPrompt: `Du bist ein Experte für Tutorial-Content. Erstelle Scripts, die:
- Komplexe Prozesse in einfache Schritte unterteilen
- Mit dem Problem/Bedürfnis der Zielgruppe beginnen
- Schritt-für-Schritt-Anleitungen mit klaren Erklärungen
- Häufige Fehler und deren Vermeidung ansprechen
- Praktische Beispiele und Anwendungen zeigen`,
          
          sectionPrompts: {
            hook: `Erstelle einen Problem-fokusierten Hook für ein Tutorial zu "{topic}":
- Identifiziere das Haupt-Problem/Bedürfnis
- Verspreche eine konkrete Lösung
- Erwähne den Zeitrahmen oder Schwierigkeitsgrad
- Nutze "Du wirst lernen..." oder "Nach diesem Video kannst du..."
Keywords: {keywords}`,
            
            solution_steps: `Entwickle eine klare Schritt-für-Schritt-Anleitung für "{topic}":
- 3-7 Hauptschritte je nach Videolänge ({length})
- Jeder Schritt mit konkreten Aktionen
- Erwähne benötigte Tools/Materialien
- Weise auf häufige Fehler hin
- Baue Erfolgskontrolle ein
Zielgruppe: {audience}, Stil: {tone}`
          }
        },
        
        'review': {
          systemPrompt: `Du bist ein objektiver Reviewer mit Expertise. Erstelle Scripts, die:
- Ausgewogene und faire Bewertungen liefern
- Kriterien und Bewertungsmaßstäbe transparent machen
- Vor- und Nachteile ehrlich darstellen
- Vergleiche mit Alternativen ziehen
- Klare Empfehlungen für verschiedene Nutzertypen geben`,
          
          sectionPrompts: {
            overview: `Erstelle eine objektive Übersicht zu "{topic}":
- Was wird genau bewertet?
- Welche Kriterien sind wichtig?
- Kurze Einordnung in den Markt/Kontext
- Erwartungen der Zielgruppe: {audience}
Länge: {length}, Keywords: {keywords}`,
            
            pros_cons: `Analysiere Pro und Contra von "{topic}":
- 3-5 klare Vorteile mit Begründung
- 3-5 ehrliche Nachteile/Schwächen
- Gewichtung nach Relevanz für {audience}
- Konkrete Beispiele und Situationen
Ton: {tone}, Trending: {keywords}`
          }
        },
        
        'entertainment': {
          systemPrompt: `Du bist ein charismatischer Entertainment-Creator. Erstelle Scripts, die:
- Von der ersten Sekunde an fesseln und unterhalten
- Persönlichkeit und Authentizität ausstrahlen
- Geschichten und emotionale Momente einbauen
- Interaktion mit der Community fördern
- Überraschungsmomente und Wendungen enthalten`,
          
          sectionPrompts: {
            story: `Entwickle eine fesselnde Story zu "{topic}":
- Persönlicher Bezug oder interessante Anekdote
- Dramatische Struktur mit Höhepunkten
- Emotionale Verbindung zur Zielgruppe: {audience}
- Überraschende Wendungen oder Erkenntnisse
Länge: {length}, Stil: {tone}, Keywords: {keywords}`,
            
            personal_touch: `Füge persönliche Elemente zu "{topic}" hinzu:
- Eigene Erfahrungen oder Meinungen
- Verbindung zur Community
- Authentische Reaktionen/Emotionen
- "Behind the scenes" Einblicke
Zielgruppe: {audience}, Trending: {keywords}`
          }
        },
        
        'explanation': {
          systemPrompt: `Du bist ein Bildungsexperte für komplexe Themen. Erstelle Scripts, die:
- Schwierige Konzepte verständlich erklären
- Vom Bekannten zum Unbekannten führen
- Analogien und Beispiele nutzen
- Schritt für Schritt aufbauen
- Verständnis durch Wiederholung festigen`,
          
          sectionPrompts: {
            concept: `Erkläre das Grundkonzept von "{topic}" verständlich:
- Beginne mit einer einfachen Definition
- Nutze Analogien aus dem Alltag
- Erkläre "Warum ist das wichtig?"
- Baue von einfach zu komplex auf
Zielgruppe: {audience}, Länge: {length}`,
            
            breakdown: `Zerlege "{topic}" in verstehbare Teile:
- 3-5 Hauptkomponenten identifizieren
- Jede Komponente einzeln erklären
- Verbindungen zwischen den Teilen zeigen
- Konkrete Beispiele für jede Komponente
Stil: {tone}, Keywords: {keywords}`
          }
        }
      },
      
      // Length-specific optimization strategies
      lengthStrategies: {
        '30s': {
          approach: 'ultra_compressed',
          maxConcepts: 1,
          promptModifier: `ULTRA-KURZ (30 Sekunden): 
- NUR das wichtigste Konzept
- Direkter, knackiger Stil
- Keine Umschweife
- Maximal 75 Wörter
- Jedes Wort muss zählen`,
          structure: ['hook', 'key_message', 'cta']
        },
        
        '1min': {
          approach: 'compressed',
          maxConcepts: 2,
          promptModifier: `KURZ (1 Minute):
- 1-2 Hauptpunkte maximal
- Schneller Einstieg
- Kompakte Erklärungen
- 130-150 Wörter
- Fokus auf das Wesentliche`,
          structure: ['hook', 'main_point', 'conclusion']
        },
        
        '5min': {
          approach: 'standard',
          maxConcepts: 4,
          promptModifier: `STANDARD (5 Minuten):
- 3-4 Hauptpunkte ausführlich
- Beispiele und Erklärungen
- Strukturierter Aufbau
- 650-750 Wörter
- Ausgewogene Tiefe`,
          structure: ['hook', 'intro', 'main_points', 'examples', 'conclusion']
        },
        
        '10min': {
          approach: 'comprehensive',
          maxConcepts: 6,
          promptModifier: `AUSFÜHRLICH (10 Minuten):
- 5-6 detaillierte Punkte
- Tiefgehende Analysen
- Mehrere Beispiele
- 1300-1500 Wörter
- Umfassende Behandlung`,
          structure: ['hook', 'intro', 'context', 'main_points', 'examples', 'implications', 'conclusion']
        },
        
        '15min': {
          approach: 'deep_dive',
          maxConcepts: 8,
          promptModifier: `DEEP DIVE (15 Minuten):
- 7-8 umfassende Aspekte
- Expertenebene Detail
- Kritische Analyse
- 2000-2300 Wörter
- Vollständige Exploration`,
          structure: ['hook', 'intro', 'background', 'main_analysis', 'case_studies', 'implications', 'future_outlook', 'conclusion']
        }
      },
      
      // Tone-specific modifiers
      toneModifiers: {
        'informativ': {
          style: 'professional_neutral',
          languageLevel: 'formal_accessible',
          promptAddition: `Ton INFORMATIV:
- Sachlich und professionell
- Klare, präzise Sprache
- Fakten im Vordergrund
- Neutrale Perspektive
- Bildungsfokus`,
          vocabulary: 'precise, factual, educational',
          emotionalLevel: 'calm, authoritative'
        },
        
        'unterhaltsam': {
          style: 'engaging_casual',
          languageLevel: 'conversational',
          promptAddition: `Ton UNTERHALTSAM:
- Locker und zugänglich
- Humor und Persönlichkeit
- Geschichten und Anekdoten
- Direkte Ansprache
- Emotionale Verbindung`,
          vocabulary: 'vivid, relatable, expressive',
          emotionalLevel: 'enthusiastic, warm'
        },
        
        'educational': {
          style: 'structured_teaching',
          languageLevel: 'clear_methodical',
          promptAddition: `Ton EDUCATIONAL:
- Lehrreich und strukturiert
- Schritt-für-Schritt Aufbau
- Verständnis-orientiert
- Wiederholung wichtiger Punkte
- Lernziel-fokussiert`,
          vocabulary: 'explanatory, systematic, supportive',
          emotionalLevel: 'encouraging, patient'
        },
        
        'überzeugend': {
          style: 'persuasive_confident',
          languageLevel: 'compelling_direct',
          promptAddition: `Ton ÜBERZEUGEND:
- Kraftvoll und motivierend
- Klare Standpunkte
- Logische Argumente
- Emotionale Appelle
- Handlungsaufforderung`,
          vocabulary: 'powerful, convincing, decisive',
          emotionalLevel: 'passionate, confident'
        },
        
        'persönlich': {
          style: 'authentic_intimate',
          languageLevel: 'personal_relatable',
          promptAddition: `Ton PERSÖNLICH:
- Authentisch und nahbar
- Persönliche Erfahrungen
- Emotionale Offenheit
- Community-Verbindung
- Vertrauensaufbau`,
          vocabulary: 'intimate, genuine, heartfelt',
          emotionalLevel: 'vulnerable, connecting'
        }
      }
    };
    
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
    this.initializePromptTemplates();
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
   * Initialize default prompt templates
   */
  initializePromptTemplates() {
    const defaultPrompts = {
      universal: {
        qualityChecks: [
          "Ist der Inhalt für die Zielgruppe relevant?",
          "Ist die Sprache angemessen und verständlich?",
          "Sind die Informationen akkurat und aktuell?",
          "Motiviert das Script zur gewünschten Aktion?",
          "Ist die Länge optimal für das Format?"
        ],
        fallbackStrategies: [
          "Bei LLM-Ausfall: Template-basierte Generierung",
          "Bei schlechter Qualität: Prompt-Vereinfachung",
          "Bei Token-Überschreitung: Schrittweise Kürzung"
        ]
      }
    };

    const promptFile = path.join(this.promptsDir, 'default-prompts.json');
    if (!fs.existsSync(promptFile)) {
      fs.writeFileSync(promptFile, JSON.stringify(defaultPrompts, null, 2));
    }
  }

  /**
   * Generate optimized prompt for script section
   */
  generateOptimizedPrompt(options = {}) {
    const {
      section,
      contentType,
      targetLength,
      tone,
      topic,
      trendingKeywords = [],
      audience = 'alle',
      sourceContent = '',
      customInstructions = ''
    } = options;

    try {
      // Get base templates
      const contentTemplate = this.promptTemplates.contentTypes[contentType];
      const lengthStrategy = this.promptTemplates.lengthStrategies[targetLength];
      const toneModifier = this.promptTemplates.toneModifiers[tone];

      if (!contentTemplate || !lengthStrategy || !toneModifier) {
        throw new Error(`Invalid template combination: ${contentType}/${targetLength}/${tone}`);
      }

      // Build optimized prompt
      let prompt = '';

      // 1. System context
      prompt += contentTemplate.systemPrompt + '\n\n';

      // 2. Length-specific instructions
      prompt += lengthStrategy.promptModifier + '\n\n';

      // 3. Tone-specific instructions  
      prompt += toneModifier.promptAddition + '\n\n';

      // 4. Section-specific prompt
      if (contentTemplate.sectionPrompts[section]) {
        let sectionPrompt = contentTemplate.sectionPrompts[section];
        
        // Replace placeholders
        sectionPrompt = sectionPrompt
          .replace(/{topic}/g, topic)
          .replace(/{length}/g, targetLength)
          .replace(/{tone}/g, tone)
          .replace(/{audience}/g, audience)
          .replace(/{keywords}/g, trendingKeywords.join(', ') || 'Keine spezifischen Keywords');

        prompt += sectionPrompt + '\n\n';
      }

      // 5. Source content context
      if (sourceContent) {
        prompt += `QUELL-CONTENT:\n${sourceContent.substring(0, 500)}${sourceContent.length > 500 ? '...' : ''}\n\n`;
      }

      // 6. Custom instructions
      if (customInstructions) {
        prompt += `ZUSÄTZLICHE ANWEISUNGEN:\n${customInstructions}\n\n`;
      }

      // 7. Quality requirements
      prompt += `QUALITÄTSANFORDERUNGEN:
- Zielgruppen-gerecht für: ${audience}
- Sprachstil: ${toneModifier.vocabulary}
- Emotionale Ebene: ${toneModifier.emotionalLevel}
- Längen-Optimierung: ${lengthStrategy.approach}
- Trending Keywords einbauen: ${trendingKeywords.slice(0, 3).join(', ') || 'flexibel'}`;

      return {
        prompt: this.optimizeTokenUsage(prompt),
        metadata: {
          section,
          contentType,
          targetLength,
          tone,
          estimatedTokens: this.estimateTokens(prompt),
          optimizationLevel: this.getOptimizationLevel(prompt),
          qualityScore: this.calculateQualityScore(options)
        }
      };

    } catch (error) {
      console.error('❌ Failed to generate optimized prompt:', error);
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
        line.includes('SYSTEM:') || 
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
   * Calculate quality score for prompt options
   */
  calculateQualityScore(options) {
    let score = 0;

    // Topic specificity
    if (options.topic && options.topic.length > 5) score += 20;
    
    // Content type match
    if (this.promptTemplates.contentTypes[options.contentType]) score += 20;
    
    // Length strategy match
    if (this.promptTemplates.lengthStrategies[options.targetLength]) score += 20;
    
    // Tone consistency
    if (this.promptTemplates.toneModifiers[options.tone]) score += 20;
    
    // Trending keywords
    if (options.trendingKeywords && options.trendingKeywords.length > 0) score += 10;
    
    // Source content
    if (options.sourceContent && options.sourceContent.length > 50) score += 10;

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
    const { section, topic, targetLength, tone } = options;
    
    const fallback = `Erstelle einen ${section} für ein ${targetLength} YouTube-Video über "${topic}".
Stil: ${tone}
Halte es prägnant und zielgruppen-gerecht.`;

    return {
      prompt: fallback,
      metadata: {
        isFallback: true,
        section,
        estimatedTokens: this.estimateTokens(fallback),
        qualityScore: 50
      }
    };
  }

  /**
   * Test prompt with different LLM providers
   */
  async testPrompt(promptOptions, testProviders = ['ollama']) {
    const promptData = this.generateOptimizedPrompt(promptOptions);
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
    
    const responseLength = Math.min(1000, prompt.length * 0.5 + Math.random() * 500);
    const mockContent = `[Mock ${provider} response für: ${prompt.substring(0, 50)}...] `.repeat(Math.ceil(responseLength / 60));
    
    return {
      content: mockContent.substring(0, responseLength),
      tokenUsage: {
        prompt: this.estimateTokens(prompt),
        response: this.estimateTokens(mockContent),
        total: this.estimateTokens(prompt + mockContent)
      }
    };
  }

  /**
   * Assess response quality
   */
  assessResponseQuality(response, originalOptions) {
    let score = 0;
    
    // Length appropriateness
    const targetWords = this.getTargetWords(originalOptions.targetLength);
    const actualWords = response.split(/\s+/).length;
    const lengthScore = Math.max(0, 100 - Math.abs(actualWords - targetWords) / targetWords * 100);
    score += lengthScore * 0.3;
    
    // Topic relevance (simple keyword check)
    const topicWords = originalOptions.topic.toLowerCase().split(/\s+/);
    const responseWords = response.toLowerCase();
    const relevance = topicWords.filter(word => responseWords.includes(word)).length / topicWords.length;
    score += relevance * 100 * 0.3;
    
    // Structure presence
    const hasStructure = response.includes('\n') || response.split('.').length > 2;
    score += hasStructure ? 20 : 0;
    
    // Trending keywords integration
    const keywords = originalOptions.trendingKeywords || [];
    const keywordScore = keywords.filter(kw => 
      responseWords.includes(kw.toLowerCase())
    ).length / Math.max(keywords.length, 1) * 100;
    score += keywordScore * 0.2;
    
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
   * Generate recommendation based on test results
   */
  generateRecommendation(results) {
    const providers = Object.keys(results.providerResults);
    
    if (providers.length === 0) {
      return 'Keine erfolgreichen Tests - Überprüfe Provider-Konfiguration';
    }
    
    // Find best provider by quality and cost
    let bestProvider = providers[0];
    let bestScore = 0;
    
    for (const provider of providers) {
      const result = results.providerResults[provider];
      if (result.error) continue;
      
      // Composite score: quality (70%) + cost efficiency (30%)
      const qualityScore = result.quality || 0;
      const costEfficiency = result.cost.total === 0 ? 100 : Math.max(0, 100 - result.cost.total * 1000);
      const compositeScore = qualityScore * 0.7 + costEfficiency * 0.3;
      
      if (compositeScore > bestScore) {
        bestScore = compositeScore;
        bestProvider = provider;
      }
    }
    
    const bestResult = results.providerResults[bestProvider];
    
    return `Empfohlener Provider: ${bestProvider} 
(Qualität: ${Math.round(bestResult.quality)}%, Kosten: $${bestResult.cost.total.toFixed(4)}, 
Antwortzeit: ${bestResult.responseTime}ms)`;
  }

  /**
   * Save test results
   */
  async saveTestResults(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `prompt-test-${results.testId}-${timestamp}.json`;
    const filepath = path.join(this.resultsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    console.log(`💾 Prompt test results saved: ${filename}`);
  }

  /**
   * Get service statistics
   */
  getStats() {
    try {
      const testFiles = fs.readdirSync(this.resultsDir)
        .filter(f => f.startsWith('prompt-test-') && f.endsWith('.json'));
      
      const stats = {
        totalTests: testFiles.length,
        supportedContentTypes: Object.keys(this.promptTemplates.contentTypes),
        supportedLengths: Object.keys(this.promptTemplates.lengthStrategies),
        supportedTones: Object.keys(this.promptTemplates.toneModifiers),
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

module.exports = AdvancedPromptingService;