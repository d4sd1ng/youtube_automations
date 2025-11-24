const PipelineOrchestrator = require('../services/agent-controller/pipelineOrchestrator');
const AgentPool = require('../services/agent-controller/agentPool');
const ContentApprovalAgent = require('../services/agent-controller/modules/content-approval/contentApprovalAgent');

async function runContentApprovalTest() {
  console.log('🚀 Starting Content Approval Test...');

  try {
    // Initialize agent pool
    const agentPool = new AgentPool();

    // Register Content Approval Agent
    const contentApprovalAgent = new ContentApprovalAgent();
    agentPool.registerAgent(contentApprovalAgent);

    // Test content approval workflow
    console.log('📋 Testing content approval submission...');

    // Submit content for approval
    const approvalSubmission = await contentApprovalAgent.execute({
      type: 'submit-for-approval',
      content: {
        type: 'test-script',
        topic: 'Test Content Approval',
        contentType: 'news',
        content: 'This is a test script for content approval workflow',
        metadata: {
          qualityScore: 95,
          wordCount: 100
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
      reviewNotes: 'Test approval - content looks good'
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

    console.log('✅ Content Approval Test completed successfully!');

  } catch (error) {
    console.error('❌ Content Approval Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  runContentApprovalTest();
}

module.exports = { runContentApprovalTest };