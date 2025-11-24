const PipelineOrchestrator = require('../services/agent-controller/pipelineOrchestrator');
const AgentPool = require('../services/agent-controller/agentPool');
const WebScrapingAgent = require('../services/agent-controller/modules/web-scraping/webScrapingAgent');
const ContentApprovalAgent = require('../services/agent-controller/modules/content-approval/contentApprovalAgent');

async function runCompleteWorkflowTest() {
  console.log('🚀 Starting Complete Workflow Test...');

  try {
    // Initialize agent pool
    const agentPool = new AgentPool();

    // Register agents
    const scrapingAgent = new WebScrapingAgent();
    const contentApprovalAgent = new ContentApprovalAgent();
    agentPool.registerAgent(scrapingAgent);
    agentPool.registerAgent(contentApprovalAgent);

    // Create orchestrator with agent pool
    const orchestrator = new PipelineOrchestrator({ agentPool });

    // Test 1: Scraping for Politara brand
    console.log('🔍 Testing scraping for Politara brand...');
    const scrapingResult = await scrapingAgent.execute({
      type: 'scrape-political-content',
      keywords: ['Wahlen', 'Politik'],
      options: {
        sources: ['news', 'social-media']
      }
    });

    if (!scrapingResult.success) {
      throw new Error(`Failed to scrape content for Politara: ${scrapingResult.error}`);
    }

    console.log(`✅ Scraped ${scrapingResult.result.content.length} items for Politara`);

    // Test 2: Scraping for Autonova brand
    console.log('🔍 Testing scraping for Autonova brand...');
    const businessScrapingResult = await scrapingAgent.execute({
      type: 'scrape-business-content',
      keywords: ['KI', 'Technologie'],
      options: {
        sources: ['tech-news', 'ai-research']
      }
    });

    if (!businessScrapingResult.success) {
      throw new Error(`Failed to scrape content for Autonova: ${businessScrapingResult.error}`);
    }

    console.log(`✅ Scraped ${businessScrapingResult.result.content.length} items for Autonova`);

    // Test 3: Content approval workflow
    console.log('📋 Testing content approval submission...');

    // Submit content for approval
    const approvalSubmission = await contentApprovalAgent.execute({
      type: 'submit-for-approval',
      content: {
        type: 'script',
        topic: 'Test Content Approval Workflow',
        contentType: 'news',
        content: 'This is a test script generated during the complete workflow test',
        metadata: {
          qualityScore: 92,
          wordCount: 150,
          sources: ['test-source-1', 'test-source-2']
        }
      }
    });

    if (!approvalSubmission.success) {
      throw new Error(`Failed to submit content for approval: ${approvalSubmission.error}`);
    }

    console.log(`✅ Content submitted for approval with ID: ${approvalSubmission.result.approvalId}`);

    // List pending approvals
    console.log('📋 Listing pending approvals...');
    const pendingApprovals = await contentApprovalAgent.execute({
      type: 'list-pending-approvals'
    });

    console.log(`📋 Found ${pendingApprovals.result.length} pending approvals`);

    // Approve the content
    console.log('✅ Approving content...');
    const approvalResult = await contentApprovalAgent.execute({
      type: 'approve-content',
      approvalId: approvalSubmission.result.approvalId,
      reviewNotes: 'Test approval - content looks good for production'
    });

    if (!approvalResult.success || approvalResult.result.status !== 'approved') {
      throw new Error('Failed to approve content');
    }

    console.log('✅ Content approved successfully');

    // List approved content
    console.log('📋 Listing approved content...');
    const approvedContent = await contentApprovalAgent.execute({
      type: 'list-approved-content'
    });

    console.log(`📋 Found ${approvedContent.result.length} approved items`);

    console.log('✅ Complete Workflow Test completed successfully!');

  } catch (error) {
    console.error('❌ Complete Workflow Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  runCompleteWorkflowTest();
}

module.exports = { runCompleteWorkflowTest };