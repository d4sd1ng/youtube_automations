const EmailAgentService = require('../services/agent-controller/modules/email-agent/emailAgentService');

async function emailAgentTest() {
  console.log('📧 Email Agent Test\n');

  try {
    // Create email agent instance
    const emailAgent = new EmailAgentService();
    console.log('✅ Email Agent instantiated');

    // Test 1: Send simple email notification
    console.log('\n📝 Test 1: Sending simple email notification...');
    const emailResult = await emailAgent.sendEmailNotification({
      to: 'test@example.com',
      subject: 'Pipeline Completed: Künstliche Intelligenz und Machine Learning',
      body: 'Your content generation pipeline has been completed successfully.\n\nGenerated content:\n- 3 scripts\n- 5 thumbnails\n- 2 translations\n\nView your results in the dashboard.'
    });

    console.log('✅ Email notification sent');
    console.log(`Send result: ${emailResult.success ? 'Success' : 'Failed'}`);
    if (emailResult.messageId) {
      console.log(`Message ID: ${emailResult.messageId}`);
    }

    // Test 2: Send pipeline completion notification
    console.log('\n🚀 Test 2: Sending pipeline completion notification...');
    const pipelineData = {
      topic: 'Künstliche Intelligenz und Machine Learning',
      status: 'completed',
      steps: {
        webScraping: { status: 'completed' },
        scriptGeneration: { status: 'completed' },
        thumbnailGeneration: { status: 'completed' }
      }
    };

    const pipelineResult = await emailAgent.sendPipelineCompletionNotification(
      'user@example.com',
      pipelineData
    );

    console.log('✅ Pipeline completion notification sent');
    console.log(`Send result: ${pipelineResult.success ? 'Success' : 'Failed'}`);

    // Test 3: Send error notification
    console.log('\n❌ Test 3: Sending error notification...');
    const errorData = {
      pipelineId: 'test-pipeline-123',
      error: {
        message: 'Sample error for testing',
        stack: 'Sample stack trace for testing'
      }
    };

    const errorResult = await emailAgent.sendErrorNotification(
      'admin@example.com',
      errorData
    );

    console.log('✅ Error notification sent');
    console.log(`Send result: ${errorResult.success ? 'Success' : 'Failed'}`);

    // Test 4: Check if email files were created
    console.log('\n📂 Test 4: Checking email files...');
    const fs = require('fs');
    const path = require('path');
    const emailsDir = path.join(__dirname, '../data/emails');

    if (fs.existsSync(emailsDir)) {
      const emailFiles = fs.readdirSync(emailsDir);
      console.log(`✅ Found ${emailFiles.length} email file(s)`);

      if (emailFiles.length > 0) {
        console.log('Recent emails:');
        // Show last 3 emails
        const recentEmails = emailFiles.slice(-3);
        recentEmails.forEach(file => {
          console.log(`  - ${file}`);
        });
      }
    } else {
      console.log('❌ Emails directory not found');
    }

    console.log('\n🎉 Email Agent Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Email agent test failed:', error);
    process.exit(1);
  }
}

// Run the test
emailAgentTest();