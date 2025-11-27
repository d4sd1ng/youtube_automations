const PipelineOrchestrator = require('./pipelineOrchestrator');

async function testWorkflow() {
  console.log('🚀 Starting workflow test...');
<<<<<<< HEAD

  // Create orchestrator instance
  const orchestrator = new PipelineOrchestrator();

=======
  
  // Create orchestrator instance
  const orchestrator = new PipelineOrchestrator();
  
>>>>>>> 5bcc564a5cb39b2febedb7a1d53ec6d0a800b3d3
  // Define workflow data
  const workflowData = {
    topic: 'Künstliche Intelligenz in der Medizin',
    keywords: ['KI', 'Medizin', 'Technologie', 'Innovation'],
    platform: 'youtube',
    tone: 'informative',
    scriptLength: 'medium',
    videoStyle: 'standard',
    videoDuration: '5min',
    thumbnailStyle: 'bold'
  };
<<<<<<< HEAD

  try {
    // Execute workflow
    const result = await orchestrator.executeContentCreationWorkflow(workflowData);

=======
  
  try {
    // Execute workflow
    const result = await orchestrator.executeContentCreationWorkflow(workflowData);
    
>>>>>>> 5bcc564a5cb39b2febedb7a1d53ec6d0a800b3d3
    if (result.status === 'completed') {
      console.log('✅ Workflow completed successfully!');
      console.log('📄 Content Plan:', JSON.stringify(result.result.contentPlan, null, 2));
      console.log('📝 Script:', JSON.stringify(result.result.script, null, 2));
      console.log('🎥 Video:', JSON.stringify(result.result.video, null, 2));
      console.log('🖼️ Thumbnail:', JSON.stringify(result.result.thumbnail, null, 2));
      console.log('🔍 SEO:', JSON.stringify(result.result.seo, null, 2));
      console.log('🏷️ Hashtags:', JSON.stringify(result.result.hashtags, null, 2));
      console.log('📄 Caption:', JSON.stringify(result.result.caption, null, 2));
    } else {
      console.log('❌ Workflow failed:', result.error);
    }
  } catch (error) {
    console.error('💥 Unexpected error during workflow execution:', error);
  }
}

// Run the test
testWorkflow();