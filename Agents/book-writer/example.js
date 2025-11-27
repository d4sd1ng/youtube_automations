/**
 * Beispielanwendung für den Book Writer Agent
 *
 * Dieses Skript zeigt, wie der Book Writer Agent verwendet werden kann,
 * um ein Buch zu einem bestimmten Thema zu erstellen.
 */

const BookWriterAgent = require('./BookWriterAgent');

async function main() {
  console.log('🚀 Starte Book Writer Agent Beispiel');

  // Initialisiere den Agenten
  const agent = new BookWriterAgent();

  // Definiere das Buchthema
  const topic = 'Künstliche Intelligenz in der deutschen Politik';

  // Optionale Konfiguration
  const options = {
    author: 'Max Mustermann',
    genre: 'Sachbuch',
    targetMarket: 'germany',
    language: 'de'
  };

  try {
    console.log(`📚 Starte Bucherstellung für Thema: "${topic}"`);

    // Erstelle das Buch
    const book = await agent.createBook(topic, options);

    console.log('✅ Buch erfolgreich erstellt!');
    console.log(` Titel: ${book.title}`);
    console.log(` Kapitel: ${book.chapters.length}`);
    console.log(` Status: ${book.status}`);

    // Zeige Statistiken
    const stats = agent.getStats();
    console.log('\n📈 Agentenstatistiken:');
    console.log(` Abgeschlossene Projekte: ${stats.completedProjects}`);
    console.log(` Erfolgsrate: ${stats.successRate.toFixed(2)}%`);

  } catch (error) {
    console.error('❌ Fehler bei der Bucherstellung:', error.message);
    process.exit(1);
  }
}

// Führe das Beispiel aus, wenn das Skript direkt aufgerufen wird
if (require.main === module) {
  main();
}

module.exports = main;