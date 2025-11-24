const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Content Approval Agent
 * Handles manual content approval workflow for generated scripts and media
 */
class ContentApprovalAgent {
  constructor(options = {}) {
    this.agentName = 'ContentApprovalAgent';
    this.version = '1.0.0';
    this.isAvailable = true;
    this.lastExecution = null;

    // Approval storage paths
    this.approvalDir = path.join(__dirname, '../../../data/approvals');
    this.pendingDir = path.join(this.approvalDir, 'pending');
    this.approvedDir = path.join(this.approvalDir, 'approved');
    this.rejectedDir = path.join(this.approvalDir, 'rejected');

    // Ensure directories exist
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.approvalDir, this.pendingDir, this.approvedDir, this.rejectedDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Execute content approval task
   * @param {Object} taskData - The content approval task data
   * @returns {Object} Result of the content approval
   */
  async execute(taskData) {
    try {
      this.lastExecution = new Date().toISOString();

      if (!taskData || !taskData.type) {
        throw new Error('Task data with type is required');
      }

      let result;

      switch (taskData.type) {
        case 'submit-for-approval':
          result = await this.submitForApproval(taskData.content);
          break;
        case 'approve-content':
          result = await this.approveContent(taskData.approvalId, taskData.reviewNotes);
          break;
        case 'reject-content':
          result = await this.rejectContent(taskData.approvalId, taskData.reviewNotes);
          break;
        case 'get-approval-status':
          result = await this.getApprovalStatus(taskData.approvalId);
          break;
        case 'list-pending-approvals':
          result = await this.listPendingApprovals();
          break;
        case 'list-approved-content':
          result = await this.listApprovedContent();
          break;
        case 'list-rejected-content':
          result = await this.listRejectedContent();
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
      console.error('ContentApprovalAgent execution error:', error);
      return {
        success: false,
        agent: this.agentName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Submit content for approval
   * @param {Object} content - The content to be approved
   * @returns {Object} Approval submission result
   */
  async submitForApproval(content) {
    try {
      const approvalId = uuidv4();
      const submissionTime = new Date().toISOString();

      // Create approval record
      const approvalRecord = {
        approvalId: approvalId,
        status: 'pending',
        content: content,
        submittedAt: submissionTime,
        submittedBy: content.submittedBy || 'system',
        reviewNotes: null,
        reviewedAt: null,
        reviewedBy: null
      };

      // Save to pending approvals
      const pendingPath = path.join(this.pendingDir, `${approvalId}.json`);
      fs.writeFileSync(pendingPath, JSON.stringify(approvalRecord, null, 2));

      console.log(`📥 Content submitted for approval: ${approvalId}`);

      return {
        approvalId: approvalId,
        status: 'pending',
        submittedAt: submissionTime
      };
    } catch (error) {
      console.error('Failed to submit content for approval:', error);
      throw error;
    }
  }

  /**
   * Approve content
   * @param {string} approvalId - The ID of the approval to approve
   * @param {string} reviewNotes - Review notes from the approver
   * @returns {Object} Approval result
   */
  async approveContent(approvalId, reviewNotes = null) {
    try {
      // Check if approval exists in pending
      const pendingPath = path.join(this.pendingDir, `${approvalId}.json`);
      if (!fs.existsSync(pendingPath)) {
        throw new Error(`Approval ${approvalId} not found in pending approvals`);
      }

      // Read approval record
      const approvalRecord = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));

      // Update approval record
      approvalRecord.status = 'approved';
      approvalRecord.reviewNotes = reviewNotes;
      approvalRecord.reviewedAt = new Date().toISOString();
      approvalRecord.reviewedBy = 'approver'; // In a real system, this would be the actual user

      // Move from pending to approved
      fs.unlinkSync(pendingPath);
      const approvedPath = path.join(this.approvedDir, `${approvalId}.json`);
      fs.writeFileSync(approvedPath, JSON.stringify(approvalRecord, null, 2));

      console.log(`✅ Content approved: ${approvalId}`);

      return {
        approvalId: approvalId,
        status: 'approved',
        reviewedAt: approvalRecord.reviewedAt,
        reviewNotes: reviewNotes
      };
    } catch (error) {
      console.error('Failed to approve content:', error);
      throw error;
    }
  }

  /**
   * Reject content
   * @param {string} approvalId - The ID of the approval to reject
   * @param {string} reviewNotes - Review notes explaining the rejection
   * @returns {Object} Rejection result
   */
  async rejectContent(approvalId, reviewNotes = null) {
    try {
      // Check if approval exists in pending
      const pendingPath = path.join(this.pendingDir, `${approvalId}.json`);
      if (!fs.existsSync(pendingPath)) {
        throw new Error(`Approval ${approvalId} not found in pending approvals`);
      }

      // Read approval record
      const approvalRecord = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));

      // Update approval record
      approvalRecord.status = 'rejected';
      approvalRecord.reviewNotes = reviewNotes;
      approvalRecord.reviewedAt = new Date().toISOString();
      approvalRecord.reviewedBy = 'approver'; // In a real system, this would be the actual user

      // Move from pending to rejected
      fs.unlinkSync(pendingPath);
      const rejectedPath = path.join(this.rejectedDir, `${approvalId}.json`);
      fs.writeFileSync(rejectedPath, JSON.stringify(approvalRecord, null, 2));

      console.log(`❌ Content rejected: ${approvalId}`);

      return {
        approvalId: approvalId,
        status: 'rejected',
        reviewedAt: approvalRecord.reviewedAt,
        reviewNotes: reviewNotes
      };
    } catch (error) {
      console.error('Failed to reject content:', error);
      throw error;
    }
  }

  /**
   * Get approval status
   * @param {string} approvalId - The ID of the approval to check
   * @returns {Object} Approval status
   */
  async getApprovalStatus(approvalId) {
    try {
      // Check in pending
      let approvalPath = path.join(this.pendingDir, `${approvalId}.json`);
      if (fs.existsSync(approvalPath)) {
        const approvalRecord = JSON.parse(fs.readFileSync(approvalPath, 'utf8'));
        return {
          approvalId: approvalId,
          status: approvalRecord.status,
          content: approvalRecord.content,
          submittedAt: approvalRecord.submittedAt
        };
      }

      // Check in approved
      approvalPath = path.join(this.approvedDir, `${approvalId}.json`);
      if (fs.existsSync(approvalPath)) {
        const approvalRecord = JSON.parse(fs.readFileSync(approvalPath, 'utf8'));
        return {
          approvalId: approvalId,
          status: approvalRecord.status,
          content: approvalRecord.content,
          submittedAt: approvalRecord.submittedAt,
          reviewedAt: approvalRecord.reviewedAt,
          reviewNotes: approvalRecord.reviewNotes
        };
      }

      // Check in rejected
      approvalPath = path.join(this.rejectedDir, `${approvalId}.json`);
      if (fs.existsSync(approvalPath)) {
        const approvalRecord = JSON.parse(fs.readFileSync(approvalPath, 'utf8'));
        return {
          approvalId: approvalId,
          status: approvalRecord.status,
          content: approvalRecord.content,
          submittedAt: approvalRecord.submittedAt,
          reviewedAt: approvalRecord.reviewedAt,
          reviewNotes: approvalRecord.reviewNotes
        };
      }

      throw new Error(`Approval ${approvalId} not found`);
    } catch (error) {
      console.error('Failed to get approval status:', error);
      throw error;
    }
  }

  /**
   * List pending approvals
   * @returns {Array} List of pending approvals
   */
  async listPendingApprovals() {
    try {
      const pendingApprovals = [];

      if (fs.existsSync(this.pendingDir)) {
        const files = fs.readdirSync(this.pendingDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const approvalData = JSON.parse(fs.readFileSync(path.join(this.pendingDir, file), 'utf8'));
            pendingApprovals.push({
              approvalId: approvalData.approvalId,
              status: approvalData.status,
              submittedAt: approvalData.submittedAt,
              contentPreview: approvalData.content ?
                (approvalData.content.title || approvalData.content.topic || 'Untitled') :
                'No content'
            });
          }
        }
      }

      return pendingApprovals;
    } catch (error) {
      console.error('Failed to list pending approvals:', error);
      return [];
    }
  }

  /**
   * List approved content
   * @returns {Array} List of approved content
   */
  async listApprovedContent() {
    try {
      const approvedContent = [];

      if (fs.existsSync(this.approvedDir)) {
        const files = fs.readdirSync(this.approvedDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const approvalData = JSON.parse(fs.readFileSync(path.join(this.approvedDir, file), 'utf8'));
            approvedContent.push({
              approvalId: approvalData.approvalId,
              status: approvalData.status,
              submittedAt: approvalData.submittedAt,
              reviewedAt: approvalData.reviewedAt,
              reviewNotes: approvalData.reviewNotes,
              contentPreview: approvalData.content ?
                (approvalData.content.title || approvalData.content.topic || 'Untitled') :
                'No content'
            });
          }
        }
      }

      return approvedContent;
    } catch (error) {
      console.error('Failed to list approved content:', error);
      return [];
    }
  }

  /**
   * List rejected content
   * @returns {Array} List of rejected content
   */
  async listRejectedContent() {
    try {
      const rejectedContent = [];

      if (fs.existsSync(this.rejectedDir)) {
        const files = fs.readdirSync(this.rejectedDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const approvalData = JSON.parse(fs.readFileSync(path.join(this.rejectedDir, file), 'utf8'));
            rejectedContent.push({
              approvalId: approvalData.approvalId,
              status: approvalData.status,
              submittedAt: approvalData.submittedAt,
              reviewedAt: approvalData.reviewedAt,
              reviewNotes: approvalData.reviewNotes,
              contentPreview: approvalData.content ?
                (approvalData.content.title || approvalData.content.topic || 'Untitled') :
                'No content'
            });
          }
        }
      }

      return rejectedContent;
    } catch (error) {
      console.error('Failed to list rejected content:', error);
      return [];
    }
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      agentName: this.agentName,
      version: this.version,
      isAvailable: this.isAvailable,
      lastExecution: this.lastExecution,
      supportedTasks: [
        'submit-for-approval',
        'approve-content',
        'reject-content',
        'get-approval-status',
        'list-pending-approvals',
        'list-approved-content',
        'list-rejected-content'
      ]
    };
  }

  /**
   * Set agent availability
   */
  setAvailability(available) {
    this.isAvailable = available;
  }
}

module.exports = ContentApprovalAgent;