const PipelineOrchestrator = require('./pipelineOrchestrator');
const WebScrapingAgent = require('../modules/web-scraping');
const fs = require('fs');
const path = require('path');

// Load configuration
const configPath = path.join(__dirname, 'scrapingConfig.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

async function runScrapingPipeline() {
  console.log('🚀 Starting Scraping Pipeline for Senara and Neurova...');

  try {
    // Create web scraping agent instance
    const webScrapingAgent = new WebScrapingAgent();

    // Create orchestrator instance with the web scraping service
    const orchestrator = new PipelineOrchestrator({
      webScrapingService: webScrapingAgent
    });

    // Process each channel
    for (const [channelId, channelConfig] of Object.entries(config.channels)) {
      console.log(`\n🔍 Processing channel: ${channelConfig.name} (${channelId})`);

      // Create pipeline configuration for this channel
      const pipelineConfig = {
        channelId: channelId,
        channelName: channelConfig.name,
        keywords: channelConfig.keywords,
        sources: channelConfig.sources,
        topics: channelConfig.topics,
        scrapeContent: true,
        generateScripts: false,
        createVideo: false,
        generateThumbnails: false,
        optimizeSEO: false,
        translateContent: false
      };

      // Create pipeline
      const pipelineId = await orchestrator.createPipeline(pipelineConfig);

      // Execute pipeline
      const results = await orchestrator.executePipeline(pipelineId);

      // Save results to file
      const outputDir = path.join(__dirname, '../data/scraping-results');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const dateStr = new Date().toISOString().split('T')[0];
      const outputPath = path.join(outputDir, `${channelId}-scraping-results-${dateStr}.json`);

      // Prepare results for saving
      const savedResults = {
        channelId: results.channelId,
        channelName: results.channelName,
        scrapedAt: new Date().toISOString(),
        keywords: results.scrapedContent.keywords || [],
        topics: results.scrapedContent.topics || [],
        content: results.scrapedContent.content || [],
        mostViewedContent: results.scrapedContent.content
          ? results.scrapedContent.content
              .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
              .slice(0, 3) // Top 3 most viewed
          : [],
        analysis: results.analyzedContent || {},
        metadata: {
          totalItems: results.scrapedContent.content ? results.scrapedContent.content.length : 0,
          qualityScore: results.analyzedContent ? results.analyzedContent.contentQuality : null
        }
      };

      fs.writeFileSync(outputPath, JSON.stringify(savedResults, null, 2));
      console.log(`✅ Results saved to: ${outputPath}`);

      // Display summary
      console.log(`\n📈 Summary for ${channelConfig.name}:`);
      console.log(`   Keywords: ${(savedResults.keywords || []).join(', ')}`);
      console.log(`   Topics: ${(savedResults.topics || []).join(', ')}`);
      console.log(`   Total content items: ${savedResults.metadata.totalItems}`);

      if (savedResults.mostViewedContent && savedResults.mostViewedContent.length > 0) {
        console.log(`\n🔥 Most viewed content:`);
        savedResults.mostViewedContent.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title}`);
          console.log(`      Views: ${item.viewCount?.toLocaleString() || 'N/A'}`);
          console.log(`      Engagement: ${item.likeCount?.toLocaleString() || 'N/A'} Likes, ${item.commentCount?.toLocaleString() || 'N/A'} Comments, ${item.shareCount?.toLocaleString() || 'N/A'} Shares`);
          console.log(`      Published: ${item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'N/A'}`);
        });
      }
    }

    console.log('\n✅ All pipelines completed successfully!');
  } catch (error) {
    console.error('❌ Pipeline execution failed:', error);
    process.exit(1);
  }
}

// Run the pipeline
if (require.main === module) {
  runScrapingPipeline();
}

module.exports = { runScrapingPipeline };