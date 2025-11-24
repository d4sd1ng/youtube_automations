const fs = require('fs');
const path = require('path');

/**
 * SEO Optimization Service
 * Handles SEO optimization for content and channels
 */
class SEOOptimizationService {
  constructor() {
    this.seoDir = path.join(__dirname, '../../data/seo');
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    if (!fs.existsSync(this.seoDir)) {
      fs.mkdirSync(this.seoDir, { recursive: true });
    }
  }

  /**
   * Optimize content for SEO
   */
  async optimizeContent(contentData) {
    try {
      console.log(`🔍 Optimizing content for SEO: ${contentData.title}`);

      // Analyze content for SEO
      const analysis = this.analyzeContentSEO(contentData);

      // Generate SEO recommendations
      const recommendations = this.generateSEORecommendations(analysis);

      // Optimize metadata
      const optimizedMetadata = this.optimizeMetadata(contentData, analysis);

      console.log(`✅ SEO optimization completed for: ${contentData.title}`);

      return {
        contentId: contentData.contentId,
        analysis,
        recommendations,
        optimizedMetadata,
        optimizedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ SEO optimization failed:', error);
      throw error;
    }
  }

  /**
   * Analyze content for SEO factors
   */
  analyzeContentSEO(contentData) {
    const { title, description, tags, content } = contentData;

    // Keyword analysis
    const allText = `${title} ${description} ${tags.join(' ')} ${content}`.toLowerCase();
    const words = allText.match(/\b\w+\b/g) || [];
    const wordCount = words.length;

    // Keyword frequency analysis
    const keywordFrequency = {};
    words.forEach(word => {
      if (word.length > 3) { // Only consider words longer than 3 characters
        keywordFrequency[word] = (keywordFrequency[word] || 0) + 1;
      }
    });

    // Top keywords
    const topKeywords = Object.entries(keywordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, frequency]) => ({ keyword, frequency }));

    // SEO factor analysis
    const titleLength = title ? title.length : 0;
    const descriptionLength = description ? description.length : 0;
    const tagCount = tags.length;

    return {
      wordCount,
      topKeywords,
      titleLength,
      descriptionLength,
      tagCount,
      hasTitle: !!title,
      hasDescription: !!description,
      hasTags: tagCount > 0,
      titleOptimalLength: titleLength >= 50 && titleLength <= 60,
      descriptionOptimalLength: descriptionLength >= 150 && descriptionLength <= 160,
      optimalTagCount: tagCount >= 5 && tagCount <= 10
    };
  }

  /**
   * Generate SEO recommendations based on analysis
   */
  generateSEORecommendations(analysis) {
    const recommendations = [];

    if (!analysis.hasTitle) {
      recommendations.push('Add a compelling title to your content');
    } else if (!analysis.titleOptimalLength) {
      recommendations.push(`Optimize title length. Current: ${analysis.titleLength} characters. Recommended: 50-60 characters`);
    }

    if (!analysis.hasDescription) {
      recommendations.push('Add a descriptive meta description');
    } else if (!analysis.descriptionOptimalLength) {
      recommendations.push(`Optimize description length. Current: ${analysis.descriptionLength} characters. Recommended: 150-160 characters`);
    }

    if (!analysis.hasTags) {
      recommendations.push('Add relevant tags to your content');
    } else if (!analysis.optimalTagCount) {
      recommendations.push(`Adjust tag count. Current: ${analysis.tagCount} tags. Recommended: 5-10 tags`);
    }

    if (analysis.topKeywords.length === 0) {
      recommendations.push('Incorporate relevant keywords into your content');
    } else {
      const primaryKeyword = analysis.topKeywords[0].keyword;
      recommendations.push(`Primary keyword identified: "${primaryKeyword}". Ensure it appears in title, description, and content`);
    }

    if (analysis.wordCount < 300) {
      recommendations.push(`Content may be too short. Current: ${analysis.wordCount} words. Recommended: At least 300 words for better SEO`);
    }

    return recommendations;
  }

  /**
   * Optimize metadata based on SEO analysis
   */
  optimizeMetadata(contentData, analysis) {
    const { title, description, tags } = contentData;

    // Optimize title
    let optimizedTitle = title || '';
    if (optimizedTitle.length > 60) {
      optimizedTitle = optimizedTitle.substring(0, 57) + '...';
    }

    // Optimize description
    let optimizedDescription = description || '';
    if (optimizedDescription.length > 160) {
      optimizedDescription = optimizedDescription.substring(0, 157) + '...';
    }

    // Optimize tags
    let optimizedTags = [...tags];
    if (analysis.topKeywords.length > 0 && optimizedTags.length < 10) {
      // Add top keywords as tags if we have space
      const keywordsToAdd = analysis.topKeywords
        .slice(0, 10 - optimizedTags.length)
        .map(kw => kw.keyword);
      optimizedTags = [...optimizedTags, ...keywordsToAdd];
    }

    return {
      title: optimizedTitle,
      description: optimizedDescription,
      tags: optimizedTags
    };
  }

  /**
   * Optimize channel for SEO
   */
  async optimizeChannel(channelData) {
    try {
      console.log(`🔍 Optimizing channel for SEO: ${channelData.name}`);

      // Analyze channel for SEO
      const analysis = this.analyzeChannelSEO(channelData);

      // Generate SEO recommendations
      const recommendations = this.generateChannelSEORecommendations(analysis);

      console.log(`✅ Channel SEO optimization completed for: ${channelData.name}`);

      return {
        channelId: channelData.channelId,
        analysis,
        recommendations,
        optimizedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Channel SEO optimization failed:', error);
      throw error;
    }
  }

  /**
   * Analyze channel for SEO factors
   */
  analyzeChannelSEO(channelData) {
    const { name, description, keywords } = channelData;

    return {
      hasName: !!name,
      hasDescription: !!description,
      hasKeywords: !!keywords && keywords.length > 0,
      nameLength: name ? name.length : 0,
      descriptionLength: description ? description.length : 0,
      keywordCount: keywords ? keywords.length : 0,
      nameOptimalLength: name && name.length >= 20 && name.length <= 50,
      descriptionOptimalLength: description && description.length >= 150 && description.length <= 1000
    };
  }

  /**
   * Generate channel SEO recommendations
   */
  generateChannelSEORecommendations(analysis) {
    const recommendations = [];

    if (!analysis.hasName) {
      recommendations.push('Add a channel name');
    } else if (!analysis.nameOptimalLength) {
      recommendations.push(`Optimize channel name length. Current: ${analysis.nameLength} characters. Recommended: 20-50 characters`);
    }

    if (!analysis.hasDescription) {
      recommendations.push('Add a channel description');
    } else if (!analysis.descriptionOptimalLength) {
      recommendations.push(`Optimize channel description length. Current: ${analysis.descriptionLength} characters. Recommended: 150-1000 characters`);
    }

    if (!analysis.hasKeywords) {
      recommendations.push('Add relevant keywords to your channel');
    } else if (analysis.keywordCount < 5) {
      recommendations.push(`Add more keywords to your channel. Current: ${analysis.keywordCount}. Recommended: At least 5 keywords`);
    }

    return recommendations;
  }

  /**
   * Save SEO analysis to file
   */
  saveSEOAnalysis(contentId, analysis) {
    try {
      const filePath = path.join(this.seoDir, `${contentId}_seo.json`);
      fs.writeFileSync(filePath, JSON.stringify(analysis, null, 2));
      console.log(`✅ SEO analysis saved: ${contentId}`);
    } catch (error) {
      console.error('❌ Failed to save SEO analysis:', error);
    }
  }

  /**
   * Load SEO analysis from file
   */
  loadSEOAnalysis(contentId) {
    try {
      const filePath = path.join(this.seoDir, `${contentId}_seo.json`);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Failed to load SEO analysis:', error);
      return null;
    }
  }
}

module.exports = SEOOptimizationService;