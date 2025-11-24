const BookWriterAgent = require('../services/agent-controller/modules/book-writer/bookWriterAgent');

async function testBookWriterAgent() {
  console.log('🎬 Starting Book Writer Agent Test');

  // Initialize the agent
  const bookWriter = new BookWriterAgent();

  // Test creating a simple book
  try {
    console.log('\n📝 Testing book creation...');
    const result = await bookWriter.createBook({
      topic: 'Künstliche Intelligenz in der modernen Gesellschaft',
      format: 'non-fiction',
      useScraper: false // Disable scraper for simple test
    });

    console.log('\n✅ Book creation result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n🎉 Book Writer Agent is working correctly!');
      console.log(`📁 Book saved to: ${result.bookPath}`);
    } else {
      console.log('\n❌ Book creation failed:');
      console.log(result.error);
    }
  } catch (error) {
    console.log('\n💥 Test failed with error:');
    console.log(error.message);
  }
}

// Run the test
testBookWriterAgent();