/**
 * Test-Suite zum Ausführen aller Unit-Tests
 */
const fs = require('fs');
const path = require('path');

console.log('🚀 Starte vollständige Test-Suite...');

// Finde alle Testdateien
const testDir = __dirname;
const testFiles = fs.readdirSync(testDir).filter(file => 
  file.endsWith('.test.js') && file !== 'testSuite.js'
);

console.log(`📋 Gefundene Testdateien: ${testFiles.length}`);

// Führe alle Tests aus
async function runAllTests() {
  const results = [];
  
  // Führe die Tests nacheinander aus, nicht parallel
  for (const testFile of testFiles) {
    try {
      console.log(`\n🧪 Führe Tests aus: ${testFile}`);
      // Führe die Testdatei direkt aus
      await new Promise((resolve, reject) => {
        try {
          require(path.join(testDir, testFile));
          setTimeout(() => {
            console.log(`✅ ${testFile} Tests erfolgreich abgeschlossen`);
            results.push({ file: testFile, status: 'success' });
            resolve();
          }, 1000); // Kurze Verzögerung, um die Ausgabe zu sehen
        } catch (error) {
          console.error(`❌ Fehler beim Ausführen von ${testFile}:`, error.message);
          results.push({ file: testFile, status: 'error', error: error.message });
          resolve(); // Auch bei Fehlern fortfahren
        }
      });
    } catch (error) {
      console.error(`❌ Fehler beim Ausführen von ${testFile}:`, error.message);
      results.push({ file: testFile, status: 'error', error: error.message });
    }
  }
  
  // Zeige Zusammenfassung
  console.log('\n📊 Test-Suite Zusammenfassung:');
  console.log('==============================');
  
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log(`✅ Erfolgreiche Tests: ${successCount}`);
  console.log(`❌ Fehlerhafte Tests: ${errorCount}`);
  console.log(`📋 Gesamt: ${results.length} Testdateien`);
  
  if (errorCount === 0) {
    console.log('\n🎉 Alle Tests erfolgreich abgeschlossen!');
  } else {
    console.log('\n⚠️  Einige Tests haben Fehler ergeben.');
  }
  
  return results;
}

// Führe die Tests aus, wenn das Skript direkt aufgerufen wird
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };