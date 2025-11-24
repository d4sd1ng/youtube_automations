// Liste der zu prüfenden Kanalnamen
const channelNames = {
  political: [
    "Senara", "Polara", "Demokrata", "Regiera", "Staata",
    "Parlara", "Ministra", "Kongressa", "Wahlinfo", "Bürgerblick"
  ],
  technology: [
    "Neurova", "Technova", "KInova", "Softnova", "Digitova",
    "Machnova", "Codinova", "Algorithma", "DataNova", "Robota"
  ]
};

// Funktion zum Prüfen, ob ein Kanalname wahrscheinlich verfügbar ist
// Da wir keine API-Zugriffe haben, basiert dies auf der Wahrscheinlichkeit,
// dass kreative, zusammengesetzte Namen noch nicht vergeben sind
function checkChannelAvailability(channelName) {
  // Diese Funktion simuliert eine Prüfung basierend auf Namenskomplexität
  // Je komplexer und kreativer der Name, desto wahrscheinlicher ist er verfügbar

  // Namen mit weniger als 5 Zeichen sind oft belegt
  if (channelName.length < 5) {
    return false;
  }

  // Namen mit mehr als 12 Zeichen sind oft verfügbar
  if (channelName.length > 12) {
    return true;
  }

  // Zusammengesetzte Namen mit spezifischen Endungen sind oft verfügbar
  const creativeEndings = ['ara', 'ova', 'nova', 'ta', 'ma'];
  const hasCreativeEnding = creativeEndings.some(ending =>
    channelName.toLowerCase().endsWith(ending.toLowerCase())
  );

  // Namen mit Umlauten sind oft verfügbar
  const hasUmlauts = /[äöüÄÖÜ]/.test(channelName);

  // Basierend auf diesen Kriterien schätzen wir die Verfügbarkeit
  return hasCreativeEnding || hasUmlauts || channelName.length > 8;
}

// Funktion zum Prüfen mehrerer Kanäle
function checkAllChannels() {
  console.log("🔍 Verfügbarkeitsprüfung für Kanalnamen (geschätzt):\n");

  console.log("🏛️ Politische Kanäle:");
  for (const channelName of channelNames.political) {
    const isAvailable = checkChannelAvailability(channelName);
    const status = isAvailable ? "✅ Wahrscheinlich verfügbar" : "⚠️ Möglicherweise belegt";
    console.log(`  ${channelName}: ${status}`);
  }

  console.log("\n💻 Technologie-Kanäle:");
  for (const channelName of channelNames.technology) {
    const isAvailable = checkChannelAvailability(channelName);
    const status = isAvailable ? "✅ Wahrscheinlich verfügbar" : "⚠️ Möglicherweise belegt";
    console.log(`  ${channelName}: ${status}`);
  }
}

// Funktion zum Prüfen eines spezifischen Kanalnamens
function checkChannel(channelName) {
  const isAvailable = checkChannelAvailability(channelName);
  return {
    channelName,
    available: isAvailable,
    status: isAvailable ? "Wahrscheinlich verfügbar" : "Möglicherweise belegt"
  };
}

// Hauptfunktion
function main() {
  // Prüfe alle Kanäle
  checkAllChannels();

  console.log("\n🎯 Empfehlung:");
  console.log("   Diese Prüfung basiert auf Namenskomplexität und -struktur.");
  console.log("   Für eine exakte Prüfung müssen Sie die Namen manuell auf");
  console.log("   den jeweiligen Plattformen (YouTube, Instagram, etc.) suchen.");
}

// Führe die Prüfung aus, wenn das Skript direkt aufgerufen wird
if (require.main === module) {
  main();
}

module.exports = {
  checkChannel,
  checkAllChannels
};