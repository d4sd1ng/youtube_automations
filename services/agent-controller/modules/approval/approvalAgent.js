const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Approval Agent
 * Handles content approval workflows for YouTube automations
 * Supports manual and automatic approval processes
 */
class ApprovalAgent {
  constructor(options = {}) {
    this.agentName = 'ApprovalAgent';
    this.version = '1.0.0';
    this.isAvailable = true;
    this.lastExecution = null;

    // Approval storage paths
    this.approvalsDir = path.join(__dirname, '../../../data/approvals');
    this.templatesDir = path.join(__dirname, '../../../data/approval-templates');
    this.jobsDir = path.join(__dirname, '../../../data/approval-jobs');

    // Ensure directories exist
    this.ensureDirectories();

    // Approval statuses
    this.approvalStatuses = {
      'pending': 'Ausstehend',
      'approved': 'Genehmigt',
      'rejected': 'Abgelehnt',
      'needs_revision': 'Benötigt Überarbeitung',
      'auto_approved': 'Automatisch genehmigt'
    };

    // Approval types
    this.approvalTypes = {
      'video': 'Video',
      'script': 'Skript',
      'thumbnail': 'Thumbnail',
      'title': 'Titel',
      'description': 'Beschreibung',
      'playlist': 'Playlist'
    };

    // Auto-approval rules (simplified for demo)
    this.autoApprovalRules = {
      'trusted_creators': true,
      'low_risk_content': true,
      'standard_templates': true
    };
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.approvalsDir, this.templatesDir, this.jobsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Execute approval task
   * @param {Object} taskData - The approval task data
   * @returns {Object} Result of the approval
   */
  async execute(taskData) {
    try {
      this.lastExecution = new Date().toISOString();

      if (!taskData || !taskData.type) {
        throw new Error('Task data with type is required');
      }

      let result;

      switch (taskData.type) {
        case 'request-approval':
          result = await this.requestApproval(taskData.content, taskData.options);
          break;
        case 'approve-content':
          result = await this.approveContent(taskData.approvalId, taskData.decision, taskData.comments);
          break;
        case 'reject-content':
          result = await this.rejectContent(taskData.approvalId, taskData.reason, taskData.comments);
          break;
        case 'get-approval-status':
          result = await this.getApprovalStatus(taskData.approvalId);
          break;
        case 'list-pending-approvals':
          result = await this.listPendingApprovals();
          break;
        case 'auto-approve-content':
          result = await this.autoApproveContent(taskData.content, taskData.options);
          break;
        case 'get-job-status':
          result = await this.getJobStatus(taskData.jobId);
          break;
        default:
          throw new Error(`Unsupported task type: ${taskData.type}`);
      }

      return {
        success: true,
        agent: this.agentName,
        result: result,
        timestamp: this.lastExecution
      };
    } catch (error) {
      console.error('ApprovalAgent execution error:', error);
      return {
        success: false,
        agent: this.agentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Request approval for content
   * @param {Object} content - The content to approve
   * @param {Object} options - Approval options
   * @returns {Object} Approval request
   */
  async requestApproval(content, options = {}) {
    const jobId = uuidv4();
    const approvalId = uuidv4();

    // Create job record
    const job = {
      id: jobId,
      type: 'approval-request',
      status: 'processing',
      content: content,
      options: options,
      progress: {
        currentStage: 'requesting',
        stageProgress: 0,
        overallProgress: 0,
        completedStages: []
      },
      metadata: {
        startedAt: new Date().toISOString(),
        estimatedDuration: 5000 // 5 seconds
      },
      logs: [{ timestamp: new Date().toISOString(), level: 'info', message: `Requesting approval for content: ${content.title || content.id}` }]
    };

    // Save job
    this.saveJob(job);

    try {
      // Update job progress
      job.progress.stageProgress = 50;
      job.progress.overallProgress = 50;
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Creating approval request...' });
      this.saveJob(job);

      await this.sleep(1000);

      // Create approval request
      const approvalRequest = {
        id: approvalId,
        content: content,
        contentType: options.contentType || 'video',
        requester: options.requester || 'system',
        status: 'pending',
        priority: options.priority || 'normal',
        deadline: options.deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: options.initialComments || [],
        approvers: options.approvers || ['admin'],
        autoApproveEligible: this.isAutoApproveEligible(content, options)
      };

      // Save approval request
      this.saveApproval(approvalRequest);

      // Update job progress
      job.progress.stageProgress = 100;
      job.progress.overallProgress = 100;
      job.result = approvalRequest;
      job.metadata.completedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'info', message: 'Approval request created successfully' });
      this.saveJob(job);

      return approvalRequest;
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      job.metadata.failedAt = new Date().toISOString();
      job.logs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Approval request failed: ${error.message}` });
      this.saveJob(job);

      throw error;
    }
  }

  /**
   * Approve content
   * @param {string} approvalId - The approval ID
   * @param {string} decision - The approval decision
   * @param {string} comments - Approval comments
   * @returns {Object} Updated approval
   */
  async approveContent(approvalId, decision = 'approved', comments = '') {
    try {
      // Get existing approval
      const approval = this.getApproval(approvalId);
      if (!approval) {
        throw new Error(`Approval with ID ${approvalId} not found`);
      }

      // Update approval
      approval.status = decision;
      approval.approvedAt = new Date().toISOString();
      approval.updatedAt = new Date().toISOString();

      if (comments) {
        approval.comments = approval.comments || [];
        approval.comments.push({
          author: 'approver',
          text: comments,
          timestamp: new Date().toISOString()
        });
      }

      // Save updated approval
      this.saveApproval(approval);

      return approval;
    } catch (error) {
      console.error('Error approving content:', error);
      throw error;
    }
  }

  /**
   * Reject content
   * @param {string} approvalId - The approval ID
   * @param {string} reason - Rejection reason
   * @param {string} comments - Additional comments
   * @returns {Object} Updated approval
   */
  async rejectContent(approvalId, reason, comments = '') {
    try {
      // Get existing approval
      const approval = this.getApproval(approvalId);
      if (!approval) {
        throw new Error(`Approval with ID ${approvalId} not found`);
      }

      // Update approval
      approval.status = 'rejected';
      approval.rejectedAt = new Date().toISOString();
      approval.rejectionReason = reason;
      approval.updatedAt = new Date().toISOString();

      if (comments) {
        approval.comments = approval.comments || [];
        approval.comments.push({
          author: 'approver',
          text: comments,
          timestamp: new Date().toISOString()
        });
      }

      // Save updated approval
      this.saveApproval(approval);

      return approval;
    } catch (error) {
      console.error('Error rejecting content:', error);
      throw error;
    }
  }

  /**
   * Automatically approve content based on rules
   * @param {Object} content - The content to approve
   * @param {Object} options - Approval options
   * @returns {Object} Auto-approval result
   */
  async autoApproveContent(content, options = {}) {
    try {
      // Check if content is eligible for auto-approval
      const isEligible = this.isAutoApproveEligible(content, options);

      if (isEligible) {
        // Create approval request
        const approvalRequest = await this.requestApproval(content, {
          ...options,
          autoApproved: true
        });

        // Automatically approve
        const approved = await this.approveContent(approvalRequest.id, 'auto_approved', 'Automatisch genehmigt basierend auf Regeln');

        return {
          autoApproved: true,
          approval: approved,
          reason: 'Content meets auto-approval criteria'
        };
      } else {
        // Create regular approval request
        const approvalRequest = await this.requestApproval(content, options);

        return {
          autoApproved: false,
          approval: approvalRequest,
          reason: 'Content requires manual approval'
        };
      }
    } catch (error) {
      console.error('Error auto-approving content:', error);
      throw error;
    }
  }

  /**
   * Check if content is eligible for auto-approval
   * @param {Object} content - The content to check
   * @param {Object} options - Approval options
   * @returns {boolean} Eligibility status
   */
  isAutoApproveEligible(content, options = {}) {
    // Simplified auto-approval logic for demo
    // In a real implementation, this would check against more complex rules

    // Check if auto-approval is enabled
    if (!options.allowAutoApproval) {
      return false;
    }

    // Check content risk level
    if (content.riskLevel && content.riskLevel !== 'low') {
      return false;
    }

    // Check creator trust level
    if (content.creatorTrustLevel && content.creatorTrustLevel !== 'trusted') {
      return false;
    }

    // Check if using standard templates
    if (content.templateType && content.templateType !== 'standard') {
      return false;
    }

    // If all checks pass, content is eligible for auto-approval
    return true;
  }

  /**
   * Get approval status
   * @param {string} approvalId - The approval ID
   * @returns {Object} Approval status
   */
  async getApprovalStatus(approvalId) {
    try {
      const approval = this.getApproval(approvalId);
      if (!approval) {
        return null;
      }

      return {
        id: approval.id,
        status: approval.status,
        contentType: approval.contentType,
        createdAt: approval.createdAt,
        updatedAt: approval.updatedAt
      };
    } catch (error) {
      console.error('Error getting approval status:', error);
      return null;
    }
  }

  /**
   * List pending approvals
   * @returns {Array} Pending approvals
   */
  async listPendingApprovals() {
    try {
      const files = fs.readdirSync(this.approvalsDir);
      const approvals = files.filter(file => file.endsWith('_approval.json'))
        .map(file => {
          const filePath = path.join(this.approvalsDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          return JSON.parse(data);
        })
        .filter(approval => approval.status === 'pending');

      return approvals;
    } catch (error) {
      console.error('Error listing pending approvals:', error);
      return [];
    }
  }

  /**
   * Save approval to file system
   * @param {Object} approval - The approval data
   */
  saveApproval(approval) {
    try {
      const filePath = path.join(this.approvalsDir, `${approval.id}_approval.json`);
      fs.writeFileSync(filePath, JSON.stringify(approval, null, 2));
    } catch (error) {
      console.error('Error saving approval:', error);
    }
  }

  /**
   * Get approval by ID
   * @param {string} approvalId - The approval ID
   * @returns {Object} Approval data
   */
  getApproval(approvalId) {
    try {
      const filePath = path.join(this.approvalsDir, `${approvalId}_approval.json`);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Error getting approval:', error);
      return null;
    }
  }

  /**
   * Save job to file system
   * @param {Object} job - The job data
   */
  saveJob(job) {
    try {
      const filePath = path.join(this.jobsDir, `${job.id}_job.json`);
      fs.writeFileSync(filePath, JSON.stringify(job, null, 2));
    } catch (error) {
      console.error('Error saving job:', error);
    }
  }

  /**
   * Get job status
   * @param {string} jobId - The job ID
   * @returns {Object} Job status
   */
  async getJobStatus(jobId) {
    try {
      const filePath = path.join(this.jobsDir, `${jobId}_job.json`);
      if (fs.existsSync(filePath)) {
        const jobData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jobData);
      }
      return null;
    } catch (error) {
      console.error('Error getting job status:', error);
      return null;
    }
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after specified time
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = ApprovalAgent;