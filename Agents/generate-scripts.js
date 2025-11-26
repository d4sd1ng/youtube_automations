const ScriptGenerationAgent = require('x:/AGENTS/modules/script-generation/scriptGenerationAgent');
const fs = require('fs');

// Ensure data directory exists
const dataDir = './data/scripts';
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data');
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize script generation agent
const scriptAgent = new ScriptGenerationAgent();

async function generateScripts() {
  try {
    console.log('🚀 Starting script generation for both topics...');

    // Generate script for KI topic
    console.log('\n📝 Generating script for KI topic...');
    const kiTopic = "KI und Datenschutz: Wie schützen TikTok und Instagram persönliche Daten?";
    const kiResult = await scriptAgent.generateScript(kiTopic, {
      scriptType: 'long-form',
      duration: 600
    });

    console.log('✅ KI script generated successfully');
    console.log('📋 KI Script ID:', kiResult.script.id);
    console.log('📄 KI Script Title:', kiResult.script.title);

    // Generate script for Politics topic
    console.log('\n📝 Generating script for Politics topic...');
    const politicsTopic = "Bundestagsdebatte heute: KI-Regulierung in Deutschland";
    const politicsResult = await scriptAgent.generateScript(politicsTopic, {
      scriptType: 'long-form',
      duration: 600
    });

    console.log('✅ Politics script generated successfully');
    console.log('📋 Politics Script ID:', politicsResult.script.id);
    console.log('📄 Politics Script Title:', politicsResult.script.title);

    // List all scripts
    console.log('\n📚 Listing all generated scripts...');
    const scripts = await scriptAgent.listScripts();
    console.log(`✅ Found ${scripts.length} scripts`);

    scripts.forEach(script => {
      console.log(`  - ${script.title} (${script.id})`);
    });

    console.log('\n🎉 Script generation completed for both topics!');
  } catch (error) {
    console.error('❌ Error generating scripts:', error);
  }
}

// Run the script generation
generateScripts();w