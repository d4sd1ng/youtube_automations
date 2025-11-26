const WebScrapingService = require('./services/agent-controller/webScrapingService');

async function runScrapingTest() {
  console.log('🚀 Starte Web Scraping Test...');

  // Erstelle eine Instanz des WebScrapingService
  const scrapingService = new WebScrapingService();

  // Teste das Scraping mit den drei Oberbegriffen
  console.log('\n🔍 Scraping mit den drei Oberbegriffen: ki, afd, politik');
  try {
    const result = await scrapingService.execute({
      type: 'scrape-keywords',
      keywords: ['ki', 'afd', 'politik'],
      sources: ['youtube', 'twitter', 'tiktok', 'instagram', 'bundestag', 'landtage', 'politische-talkshows']
    });
    console.log('✅ Scraping erfolgreich:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Fehler beim Scraping:', error);
  }

  console.log('\n🏁 Web Scraping Test abgeschlossen!');
}

// Starte den Test
runScrapingTest();