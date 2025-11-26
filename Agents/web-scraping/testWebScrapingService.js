const WebScrapingService = require('./webScrapingService');

async function testWebScrapingService() {
  console.log('Testing WebScrapingService...');
  
  // Create an instance of the service
  const scrapingService = new WebScrapingService();
  
  // Test the service status
  console.log('Service Status:', scrapingService.getStatus());
  
  // Test scraping political content
  console.log('\nTesting political content scraping...');
  try {
    const politicalResult = await scrapingService.execute({
      type: 'scrape-political-content',
      keywords: ['Klimawandel', 'Digitalisierung']
    });
    console.log('Political Content Scraping Result:', JSON.stringify(politicalResult, null, 2));
  } catch (error) {
    console.error('Error scraping political content:', error);
  }
  
  // Test scraping business content
  console.log('\nTesting business content scraping...');
  try {
    const businessResult = await scrapingService.execute({
      type: 'scrape-business-content',
      keywords: ['Künstliche Intelligenz', 'Blockchain']
    });
    console.log('Business Content Scraping Result:', JSON.stringify(businessResult, null, 2));
  } catch (error) {
    console.error('Error scraping business content:', error);
  }
  
  // Test scraping YouTube content
  console.log('\nTesting YouTube content scraping...');
  try {
    const youtubeResult = await scrapingService.execute({
      type: 'scrape-youtube',
      keywords: ['Technologie Trends 2025']
    });
    console.log('YouTube Content Scraping Result:', JSON.stringify(youtubeResult, null, 2));
  } catch (error) {
    console.error('Error scraping YouTube content:', error);
  }
  
  // Test listing scraping results
  console.log('\nListing all scraping results...');
  try {
    const results = await scrapingService.execute({
      type: 'list-scraping-results'
    });
    console.log('All Scraping Results:', JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error listing scraping results:', error);
  }
}

// Run the test
testWebScrapingService();
