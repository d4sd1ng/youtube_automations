/**
 * Agent Pool Management
 * Manages registration and availability of agents
 */
class AgentPool {
  constructor() {
    this.agents = new Map();
    this.workQueue = [];
    this.predictiveProcessor = null;
  }

  /**
   * Register an agent in the pool
   * @param {Object} agent - The agent instance to register
   */
  registerAgent(agent) {
    if (!agent || !agent.agentName) {
      throw new Error('Invalid agent: must have agentName property');
    }

    // Check if agent already registered
    if (this.agents.has(agent.agentName)) {
      console.warn(`⚠️  Agent ${agent.agentName} already registered, replacing...`);
    }

    // Register agent
    this.agents.set(agent.agentName, agent);
    console.log(`✅ Registered agent: ${agent.agentName} (${agent.constructor.name})`);

    // Set agent as available
    if (typeof agent.setAvailability === 'function') {
      agent.setAvailability(true);
    }
  }

  /**
   * Get agent by name
   * @param {string} agentName - The name of the agent to retrieve
   * @returns {Object|null} The agent instance or null if not found
   */
  getAgent(agentName) {
    return this.agents.get(agentName) || null;
  }

  /**
   * List all registered agents
   * @returns {Array} List of agent information
   */
  listAgents() {
    const agentList = [];
    for (const [name, agent] of this.agents) {
      agentList.push({
        name: name,
        version: agent.version || 'unknown',
        available: agent.isAvailable || false,
        lastExecution: agent.lastExecution || null,
        type: agent.constructor.name
      });
    }
    return agentList;
  }

  /**
   * Submit work to the agent pool
   * @param {string} agentName - The name of the agent to handle the work
   * @param {Object} taskData - The task data to process
   * @returns {Promise<Object>} The result of the agent execution
   */
  async submitWork(agentName, taskData) {
    const agent = this.getAgent(agentName);

    if (!agent) {
      throw new Error(`Agent ${agentName} not found in pool`);
    }

    if (!agent.isAvailable) {
      throw new Error(`Agent ${agentName} is not available`);
    }

    // Execute agent task
    return await agent.execute(taskData);
  }

  /**
   * Add work to queue for processing
   * @param {string} agentName - The name of the agent to handle the work
   * @param {Object} taskData - The task data to process
   * @param {number} priority - Priority level (1-10, higher is more urgent)
   */
  queueWork(agentName, taskData, priority = 5) {
    const workItem = {
      id: Date.now() + Math.random(),
      agentName,
      taskData,
      priority,
      submittedAt: new Date().toISOString()
    };

    // Add to queue
    this.workQueue.push(workItem);

    // Sort by priority (higher first)
    this.workQueue.sort((a, b) => b.priority - a.priority);

    console.log(`📥 Work queued for ${agentName} (priority: ${priority})`);

    // Process queue if predictive processor is not already running
    if (!this.predictiveProcessor) {
      this.processQueue();
    }
  }

  /**
   * Process work queue
   */
  async processQueue() {
    if (this.workQueue.length === 0) {
      this.predictiveProcessor = null;
      return;
    }

    // Get highest priority item
    const workItem = this.workQueue.shift();

    try {
      console.log(`⚡ Processing queued work for ${workItem.agentName}`);

      // Process work
      const result = await this.submitWork(workItem.agentName, workItem.taskData);

      console.log(`✅ Queued work completed for ${workItem.agentName}`);
    } catch (error) {
      console.error(`❌ Queued work failed for ${workItem.agentName}:`, error.message);
    }

    // Continue processing remaining queue
    this.predictiveProcessor = setTimeout(() => {
      this.processQueue();
    }, 100); // Small delay to prevent blocking
  }

  /**
   * Get agent pool status
   * @returns {Object} Status information about the agent pool
   */
  getStatus() {
    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(agent => agent.isAvailable).length,
      queuedWork: this.workQueue.length,
      agents: this.listAgents()
    };
  }
}

module.exports = AgentPool;