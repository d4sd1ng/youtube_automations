const LLMService = require('./llmService');

class WorkflowEngine {
  constructor() {
    this.llmService = new LLMService();
    this.workflows = new Map(); // In-memory storage - in production use database
  }

  async createWorkflow(workflowId, topic, type, parameters = {}) {
    const workflow = {
      id: workflowId,
      topic,
      type,
      parameters,
      status: 'pending',
      currentStep: 0,
      steps: this.defineSteps(type),
      results: {},
      created: new Date().toISOString(),
      logs: []
    };

    this.workflows.set(workflowId, workflow);
    this.log(workflow, 'info', `Workflow erstellt: ${type} für "${topic}"`);
    
    // Start processing asynchronously
    this.processNextStep(workflowId);
    
    return workflow;
  }

  defineSteps(type) {
    const stepTemplates = {
      ai_content: [
        { name: 'Themen-Analyse', aiRequired: true, estimatedTime: 30 },
        { name: 'Struktur-Planung', aiRequired: true, estimatedTime: 45 },
        { name: 'Script-Generierung', aiRequired: true, estimatedTime: 120 },
        { name: 'SEO-Optimierung', aiRequired: true, estimatedTime: 30 },
        { name: 'Thumbnail-Konzept', aiRequired: true, estimatedTime: 60 }
      ],
      
      political_content: [
        { name: 'Fakten-Research', aiRequired: false, estimatedTime: 180 },
        { name: 'Quellen-Verification', aiRequired: false, estimatedTime: 120 },
        { name: 'Balanced-Script', aiRequired: true, estimatedTime: 150 },
        { name: 'Fact-Check', aiRequired: true, estimatedTime: 90 },
        { name: 'Disclaimer-Generation', aiRequired: true, estimatedTime: 30 }
      ],
      
      viral_shorts: [
        { name: 'Trend-Analysis', aiRequired: true, estimatedTime: 60 },
        { name: 'Hook-Generation', aiRequired: true, estimatedTime: 45 },
        { name: 'Short-Script', aiRequired: true, estimatedTime: 30 },
        { name: 'Viral-Elements', aiRequired: true, estimatedTime: 30 }
      ],
      
      educational: [
        { name: 'Learning-Objectives', aiRequired: true, estimatedTime: 60 },
        { name: 'Content-Structure', aiRequired: true, estimatedTime: 90 },
        { name: 'Explanation-Script', aiRequired: true, estimatedTime: 180 },
        { name: 'Quiz-Generation', aiRequired: true, estimatedTime: 60 },
        { name: 'Resource-Links', aiRequired: false, estimatedTime: 30 }
      ]
    };

    return stepTemplates[type] || stepTemplates.ai_content;
  }

  async processNextStep(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.status === 'completed' || workflow.status === 'failed') {
      return;
    }

    const currentStep = workflow.steps[workflow.currentStep];
    if (!currentStep) {
      // All steps completed
      workflow.status = 'completed';
      workflow.completedAt = new Date().toISOString();
      this.log(workflow, 'success', 'Workflow erfolgreich abgeschlossen!');
      return;
    }

    try {
      workflow.status = 'processing';
      this.log(workflow, 'info', `Starte Schritt: ${currentStep.name}`);

      if (currentStep.aiRequired) {
        // Use AI only when necessary
        this.log(workflow, 'info', `🤖 AI-Verarbeitung erforderlich für: ${currentStep.name}`);
        const result = await this.processAIStep(workflow, currentStep);
        workflow.results[currentStep.name] = result;
      } else {
        // Non-AI processing (database queries, file operations, etc.)
        this.log(workflow, 'info', `⚡ Lokale Verarbeitung für: ${currentStep.name}`);
        const result = await this.processLocalStep(workflow, currentStep);
        workflow.results[currentStep.name] = result;
      }

      this.log(workflow, 'success', `✅ Schritt abgeschlossen: ${currentStep.name}`);
      
      // Move to next step
      workflow.currentStep++;
      
      // Process next step after a short delay
      setTimeout(() => this.processNextStep(workflowId), 2000);

    } catch (error) {
      workflow.status = 'failed';
      workflow.error = error.message;
      workflow.failedAt = new Date().toISOString();
      this.log(workflow, 'error', `❌ Fehler in Schritt ${currentStep.name}: ${error.message}`);
    }
  }

  async processAIStep(workflow, step) {
    const { topic, type } = workflow;
    
    switch (step.name) {
      case 'Themen-Analyse':
        return await this.llmService.generateContent(
          `Analysiere das Thema "${topic}" für YouTube-Content`, 
          'analysis'
        );
        
      case 'Struktur-Planung':
        const analysis = workflow.results['Themen-Analyse'];
        return await this.llmService.generateContent(
          `Erstelle eine Videostruktur basierend auf: ${analysis?.content}`, 
          'structure'
        );
        
      case 'Script-Generierung':
        return await this.llmService.generateContent(topic, type, workflow.parameters);
        
      case 'Hook-Generation':
        return await this.llmService.generateContent(
          `Erstelle einen viralen Hook für: "${topic}"`, 
          'hook'
        );
        
      case 'Trend-Analysis':
        return await this.llmService.generateContent(
          `Analysiere Trends für: "${topic}"`, 
          'trends'
        );
        
      default:
        return await this.llmService.generateContent(topic, type);
    }
  }

  async processLocalStep(workflow, step) {
    const { topic } = workflow;
    
    switch (step.name) {
      case 'Fakten-Research':
        // Simulate database/API research
        await this.delay(step.estimatedTime * 10); // Simulate processing time
        return {
          content: `Recherche-Ergebnisse für "${topic}" - Fakten gesammelt`,
          sources: ['source1.com', 'source2.org'],
          factCount: 15
        };
        
      case 'Quellen-Verification':
        await this.delay(step.estimatedTime * 10);
        return {
          content: 'Quellen verifiziert und validiert',
          verifiedSources: 12,
          reliability: 'high'
        };
        
      case 'Resource-Links':
        await this.delay(step.estimatedTime * 10);
        return {
          content: 'Zusätzliche Ressourcen und Links gesammelt',
          links: ['resource1.com', 'resource2.edu'],
          linkCount: 8
        };
        
      default:
        return { content: `Lokale Verarbeitung für ${step.name} abgeschlossen` };
    }
  }

  getWorkflowStatus(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return null;

    const progress = workflow.currentStep / workflow.steps.length * 100;
    const currentStep = workflow.steps[workflow.currentStep];
    
    return {
      workflowId,
      status: workflow.status,
      progress: Math.round(progress),
      currentStep: currentStep?.name || 'Abgeschlossen',
      steps: workflow.steps.map((step, index) => ({
        name: step.name,
        status: index < workflow.currentStep ? 'completed' : 
                index === workflow.currentStep ? 'in_progress' : 'pending',
        progress: index < workflow.currentStep ? 100 : 
                 index === workflow.currentStep ? 50 : 0,
        aiRequired: step.aiRequired,
        estimatedTime: step.estimatedTime
      })),
      results: workflow.results,
      logs: workflow.logs,
      created: workflow.created,
      completedAt: workflow.completedAt,
      error: workflow.error
    };
  }

  log(workflow, level, message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };
    workflow.logs.push(logEntry);
    console.log(`[${workflow.id}] ${level.toUpperCase()}: ${message}`);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = WorkflowEngine;