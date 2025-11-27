const fs = require('fs');
const path = require('path');

/**
 * Chapter Writer for Book Writer Agent
 * Writes individual chapters and manages content generation
 */
class ChapterWriter {
  constructor(config = {}) {
    this.config = {
      defaultWordCount: 1000,
      maxRetries: 3,
      ...config
    };

    this.chaptersDir = path.join(__dirname, '../../../data/content/chapters');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.chaptersDir)) {
      fs.mkdirSync(this.chaptersDir, { recursive: true });
    }
  }

  /**
   * Write a chapter based on chapter data and style guide
   * @param {Object} chapterData - Data for the chapter
   * @param {Object} styleGuide - Style guide for writing
   * @param {Object} researchData - Research data to reference
   * @returns {Promise<Object>} Written chapter with quality score
   */
  async writeChapter(chapterData, styleGuide, researchData) {
    console.log(`✍️ Writing chapter: ${chapterData.title}`);

    let attempt = 0;
    let content = null;
    let qualityScore = 0;

    // Retry loop for chapter generation
    while (attempt < this.config.maxRetries && !content) {
      try {
        // Generate chapter content
        content = await this.generateChapterContent(chapterData, styleGuide, researchData);

        // Assess quality
        qualityScore = await this.assessQuality(content, chapterData, styleGuide);

        // Check if revision is needed
        if (qualityScore < 0.8) { // 80% quality threshold
          console.log(`🔄 Chapter quality score ${qualityScore.toFixed(2)} below threshold, revising...`);
          content = await this.handleRevision(content, chapterData, styleGuide, qualityScore);
          qualityScore = await this.assessQuality(content, chapterData, styleGuide);
        }

        attempt++;
      } catch (error) {
        console.error(`❌ Error writing chapter (attempt ${attempt + 1}):`, error.message);
        attempt++;

        if (attempt >= this.config.maxRetries) {
          throw new Error(`Failed to write chapter after ${this.config.maxRetries} attempts: ${error.message}`);
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }

    // Compile chapter result
    const chapterResult = {
      chapter: chapterData,
      content: content,
      qualityScore: qualityScore,
      wordCount: content ? content.split(' ').length : 0,
      needsRevision: qualityScore < 0.8,
      generatedAt: new Date().toISOString()
    };

    // Save chapter
    await this.saveChapter(chapterResult);

    console.log(`✅ Chapter written with quality score: ${qualityScore.toFixed(2)}`);
    return chapterResult;
  }

  /**
   * Generate chapter content using AI
   */
  async generateChapterContent(chapterData, styleGuide, researchData) {
    console.log(`🤖 Generating content for chapter: ${chapterData.title}`);

    // Reduce timeout for testing
    const timeout = process.env.NODE_ENV === 'test' ? 100 : 3000;
    await new Promise(resolve => setTimeout(resolve, timeout));

    // Extract key information for content generation
    const topic = chapterData.topic || 'General Topic';
    const keyPoints = chapterData.keyPoints || [];
    const chapterType = chapterData.type || 'main';

    // Generate content based on chapter type
    let content = '';

    switch (chapterType) {
      case 'introduction':
        content = this.generateIntroductionContent(topic, keyPoints, styleGuide, researchData);
        break;
      case 'conclusion':
        content = this.generateConclusionContent(topic, keyPoints, styleGuide, researchData);
        break;
      default:
        content = this.generateMainChapterContent(topic, keyPoints, styleGuide, researchData);
    }

    console.log(`✅ Content generated for chapter: ${chapterData.title}`);
    return content;
  }

  /**
   * Generate introduction content
   */
  generateIntroductionContent(topic, keyPoints, styleGuide, researchData) {
    return `\\chapter{Einleitung}

Willkommen zu diesem umfassenden Werk über ${topic}. In den folgenden Kapiteln werden wir uns detailliert mit den verschiedenen Aspekten dieses faszinierenden Themas beschäftigen.

\\section{Zielsetzung des Buches}

Das Ziel dieses Buches ist es, ein fundiertes Verständnis von ${topic} zu vermitteln. Wir werden von den Grundlagen ausgehen und uns schrittweise zu komplexeren Konzepten vorarbeiten.

\\section{Überblick über die Kapitelstruktur}

${keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\\n')}

\\section{Warum dieses Thema wichtig ist}

${topic} hat in der heutigen Zeit eine zunehmend wichtige Rolle erlangt. Die Relevanz dieses Themas zeigt sich in verschiedenen Bereichen unseres täglichen Lebens und unserer Gesellschaft.

In den folgenden Kapiteln werden wir diese Aspekte detailliert untersuchen und Ihnen ein umfassendes Verständnis vermitteln.

Lassen Sie uns mit dem ersten Kapitel beginnen, in dem wir die Grundlagen von ${topic} erläutern werden.`;
  }

  /**
   * Generate main chapter content
   */
  generateMainChapterContent(topic, keyPoints, styleGuide, researchData) {
    return `\\section{Einführung}

In diesem Kapitel werden wir uns mit einem zentralen Aspekt von ${topic} beschäftigen. Die folgenden Abschnitte werden Ihnen ein tiefgründiges Verständnis der wichtigsten Konzepte vermitteln.

\\section{Theoretische Grundlagen}

Die theoretischen Grundlagen von ${topic} sind komplex und vielschichtig. Es gibt verschiedene Ansätze und Modelle, die versuchen, die Phänomene zu erklären.

${keyPoints.map(point => `\\subsection{${point}}

Dieser Abschnitt behandelt ${point.toLowerCase()}. Es ist wichtig zu verstehen, wie dieser Aspekt in das Gesamtbild passt.

[Hier würde detaillierter Inhalt stehen, der auf den Forschungsdaten basiert]

Beispiele und Fallstudien helfen dabei, die theoretischen Konzepte zu veranschaulichen und besser zu verstehen.`).join('\\n\\n')}

\\section{Praktische Anwendungen}

Die praktische Anwendung der Theorie ist entscheidend für das Verständnis. In diesem Abschnitt werden wir konkrete Beispiele betrachten.

\\subsection{Fallstudien}

Fallstudien bieten wertvolle Einblicke in die reale Anwendung der Konzepte. Sie zeigen, wie Theorie in die Praxis umgesetzt wird.

\\subsection{Best Practices}

Basierend auf den Forschungsergebnissen können wir einige Best Practices ableiten:

\\begin{itemize}
  \\item Erstens: Klare Definition der Ziele
  \\item Zweitens: Systematische Herangehensweise
  \\item Drittens: Kontinuierliche Evaluation
\\end{itemize}

\\section{Zusammenfassung}

In diesem Kapitel haben wir die wichtigsten Aspekte von ${topic} behandelt. Die vorgestellten Konzepte bilden die Grundlage für das Verständnis komplexerer Zusammenhänge im nächsten Kapitel.`;
  }

  /**
   * Generate conclusion content
   */
  generateConclusionContent(topic, keyPoints, styleGuide, researchData) {
    return `\\chapter{Fazit}

Wir haben nun einen umfassenden Überblick über ${topic} gewonnen. In diesem letzten Kapitel werden wir die wichtigsten Erkenntnisse zusammenfassen und einen Ausblick auf zukünftige Entwicklungen geben.

\\section{Zusammenfassung der wichtigsten Erkenntnisse}

${keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\\n')}

\\section{Ausblick auf zukünftige Entwicklungen}

Die Zukunft von ${topic} ist vielversprechend. Neue Technologien und Erkenntnisse werden weitere Entwicklungen ermöglichen.

\\section{Handlungsempfehlungen}

Basierend auf den Erkenntnissen dieses Buches können wir folgende Handlungsempfehlungen ableiten:

\\begin{enumerate}
  \\item Verstehen Sie die Grundlagen gründlich
  \\item Bleiben Sie über neue Entwicklungen informiert
  \\item Wenden Sie das Gelernte in der Praxis an
  \\item Austauschen Sie sich mit anderen Experten
\\end{enumerate}

\\section{Abschließende Gedanken}

${topic} ist ein dynamisches Feld, das ständig neue Entwicklungen und Erkenntnisse hervorbringt. Dieses Buch hat Ihnen einen fundierten Überblick gegeben, aber die Reise des Lernens geht weiter.

Wir hoffen, dass dieses Werk Ihnen einen wertvollen Beitrag zum Verständnis von ${topic} geleistet hat und Sie in Ihrer weiteren Arbeit damit erfolgreich sein werden.`;
  }

  /**
   * Assess content quality
   */
  async assessQuality(content, chapterData, styleGuide) {
    console.log(`🔍 Assessing quality for chapter: ${chapterData.title}`);

    // Reduce timeout for testing
    const timeout = process.env.NODE_ENV === 'test' ? 50 : 1000;
    await new Promise(resolve => setTimeout(resolve, timeout));

    // Calculate quality metrics
    const wordCount = content ? content.split(' ').length : 0;
    const sentenceCount = content ? content.split(/[.!?]+/).length : 0;
    const paragraphCount = content ? content.split('\n\n').length : 0;

    // Quality factors (0-1 scale)
    const lengthScore = Math.min(1, wordCount / (this.config.defaultWordCount * 1.5)); // Prefer longer content
    const structureScore = paragraphCount >= 3 ? 1 : paragraphCount / 3; // Prefer multiple paragraphs
    const keywordScore = this.calculateKeywordScore(content, chapterData.keyPoints);
    const readabilityScore = this.calculateReadabilityScore(content);

    // Weighted average
    const qualityScore = (
      lengthScore * 0.3 +
      structureScore * 0.2 +
      keywordScore * 0.3 +
      readabilityScore * 0.2
    );

    console.log(`✅ Quality assessed for chapter: ${chapterData.title} (Score: ${qualityScore.toFixed(2)})`);
    return qualityScore;
  }

  /**
   * Calculate keyword score
   */
  calculateKeywordScore(content, keyPoints) {
    if (!content || !keyPoints || keyPoints.length === 0) return 0.5;

    const contentLower = content.toLowerCase();
    let matches = 0;

    for (const point of keyPoints) {
      const pointLower = point.toLowerCase();
      // Count occurrences of key point terms in content
      const regex = new RegExp(pointLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const pointMatches = (contentLower.match(regex) || []).length;
      if (pointMatches > 0) matches++;
    }

    return matches / keyPoints.length;
  }

  /**
   * Calculate readability score
   */
  calculateReadabilityScore(content) {
    if (!content) return 0.5;

    const words = content.split(' ').length;
    const sentences = content.split(/[.!?]+/).length;
    const syllables = this.estimateSyllables(content);

    // Simple readability formula (Flesch Reading Ease adapted)
    if (words === 0 || sentences === 0) return 0.5;

    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = syllables / words;

    // Score between 0 and 1 (higher is better readability)
    const sentenceScore = Math.max(0, Math.min(1, 1 - (avgSentenceLength - 15) / 30));
    const syllableScore = Math.max(0, Math.min(1, 1 - (avgSyllablesPerWord - 2) / 3));

    return (sentenceScore + syllableScore) / 2;
  }

  /**
   * Estimate syllables in text
   */
  estimateSyllables(text) {
    // Very simple syllable estimation
    const words = text.split(' ');
    let syllableCount = 0;

    for (const word of words) {
      // Count vowel groups as syllables
      const vowelGroups = word.match(/[aeiouy]+/gi);
      syllableCount += vowelGroups ? vowelGroups.length : 1;
    }

    return syllableCount;
  }

  /**
   * Handle chapter revision
   */
  async handleRevision(content, chapterData, styleGuide, qualityScore) {
    console.log(`🔄 Revising chapter: ${chapterData.title} (Quality: ${qualityScore.toFixed(2)})`);

    // Reduce timeout for testing
    const timeout = process.env.NODE_ENV === 'test' ? 100 : 2000;
    await new Promise(resolve => setTimeout(resolve, timeout));

    // Generate revision feedback
    const feedback = this.generateRevisionFeedback(content, chapterData, styleGuide, qualityScore);

    // Apply revisions
    const revisedContent = this.applyRevisions(content, feedback, chapterData);

    console.log(`✅ Chapter revised: ${chapterData.title}`);
    return revisedContent;
  }

  /**
   * Generate revision feedback
   */
  generateRevisionFeedback(qualityScore, content, chapterData) {
    const feedback = [];

    if (qualityScore < 0.6) {
      feedback.push('Content needs significant expansion and development');
    } else if (qualityScore < 0.8) {
      feedback.push('Content needs refinement and additional details');
    }

    // Check for specific issues
    const wordCount = content ? content.split(' ').length : 0;
    if (wordCount < this.config.defaultWordCount * 0.8) {
      feedback.push(`Content is too short (currently ${wordCount} words, target ${this.config.defaultWordCount})`);
    }

    // Check structure
    const paragraphCount = content ? content.split('\n\n').length : 0;
    if (paragraphCount < 3) {
      feedback.push('Content needs better structure with more paragraphs');
    }

    // Check key points coverage
    if (chapterData.keyPoints) {
      const missingPoints = chapterData.keyPoints.filter(point =>
        !content.includes(point) && !content.toLowerCase().includes(point.toLowerCase())
      );

      if (missingPoints.length > 0) {
        feedback.push(`Missing coverage of key points: ${missingPoints.join(', ')}`);
      }
    }

    return feedback;
  }

  /**
   * Apply revisions to content
   */
  applyRevisions(content, feedback, chapterData) {
    // In a real implementation, this would use AI to revise content based on feedback
    // For now, we'll simulate improvements

    let revisedContent = content;

    // Apply some generic improvements
    if (feedback.includes('Content needs significant expansion and development')) {
      revisedContent += '\\n\\n\\section{Zusätzliche Perspektiven}\\n\\nDieser Abschnitt bietet zusätzliche Perspektiven und vertiefte Analysen zu den bisher behandelten Themen.';
    }

    if (feedback.includes('Content needs refinement and additional details')) {
      revisedContent = revisedContent.replace(/\\section{/g, '\\n\\n\\section{').replace(/\\subsection{/g, '\\n\\subsection{');
    }

    // Add more content if too short
    if (feedback.some(f => f.includes('too short'))) {
      revisedContent += '\\n\\n\\section{Vertiefung}\\n\\nDiese Ergänzung bietet zusätzliche Details und vertieft die bisherigen Erklärungen.';
    }

    return revisedContent;
  }

  /**
   * Save chapter
   */
  async saveChapter(chapterResult) {
    try {
      const filename = `chapter-${chapterResult.chapter.number}-${this.sanitizeFilename(chapterResult.chapter.title)}.json`;
      const filepath = path.join(this.chaptersDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(chapterResult, null, 2));
      console.log(`💾 Chapter saved: ${filepath}`);

      return filepath;
    } catch (error) {
      console.error(`❌ Failed to save chapter: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load chapter
   */
  async loadChapter(chapterNumber, chapterTitle) {
    try {
      const filename = `chapter-${chapterNumber}-${this.sanitizeFilename(chapterTitle)}.json`;
      const filepath = path.join(this.chaptersDir, filename);

      if (fs.existsSync(filepath)) {
        const content = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to load chapter: ${error.message}`);
      return null;
    }
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  /**
   * Get chapter summary
   */
  async getChapterSummary(chapterNumber, chapterTitle) {
    try {
      const chapter = await this.loadChapter(chapterNumber, chapterTitle);

      if (chapter) {
        return {
          title: chapter.chapter.title,
          number: chapter.chapter.number,
          wordCount: chapter.wordCount,
          qualityScore: chapter.qualityScore,
          needsRevision: chapter.needsRevision,
          generatedAt: chapter.generatedAt
        };
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to get chapter summary: ${error.message}`);
      return null;
    }
  }
}

module.exports = ChapterWriter;