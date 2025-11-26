const fs = require('fs');
const path = require('path');

/**
 * Email Agent Service
 * Handles email notifications and communications
 */
class EmailAgentService {
  constructor() {
    this.emailsDir = path.join(__dirname, '../../../../data/emails');
    this.templatesDir = path.join(__dirname, 'templates');
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.emailsDir, this.templatesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(emailData) {
    try {
      console.log(`📧 Sending email notification to: ${emailData.to}`);

      // Validate email data
      if (!this.validateEmailData(emailData)) {
        throw new Error('Invalid email data provided');
      }

      // Render email template
      const renderedEmail = this.renderEmailTemplate(emailData);

      // In a real implementation, this would send the actual email
      // For now, we'll just save it to a file
      this.saveEmail(emailData, renderedEmail);

      console.log(`✅ Email notification sent to: ${emailData.to}`);

      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        sentAt: new Date().toISOString(),
        recipient: emailData.to
      };
    } catch (error) {
      console.error('❌ Failed to send email notification:', error);
      return {
        success: false,
        error: error.message,
        recipient: emailData.to
      };
    }
  }

  /**
   * Validate email data
   */
  validateEmailData(emailData) {
    if (!emailData.to) {
      console.error('❌ Missing recipient email address');
      return false;
    }

    if (!emailData.subject) {
      console.error('❌ Missing email subject');
      return false;
    }

    if (!emailData.body && !emailData.template) {
      console.error('❌ Missing email body or template');
      return false;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.to)) {
      console.error('❌ Invalid recipient email address');
      return false;
    }

    return true;
  }

  /**
   * Render email template
   */
  renderEmailTemplate(emailData) {
    const { template, variables = {} } = emailData;

    // If a specific template is provided, use it
    if (template) {
      return this.renderTemplate(template, variables);
    }

    // Otherwise, create a simple email from the provided data
    return this.createSimpleEmail(emailData);
  }

  /**
   * Render a specific template
   */
  renderTemplate(templateName, variables) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.html`);

      // Check if template exists
      if (!fs.existsSync(templatePath)) {
        console.warn(`⚠️ Template ${templateName} not found, using simple email`);
        return this.createSimpleEmail({ subject: variables.subject, body: variables.body });
      }

      // Read template
      let templateContent = fs.readFileSync(templatePath, 'utf8');

      // Replace variables in template
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        templateContent = templateContent.replace(regex, variables[key] || '');
      });

      return templateContent;
    } catch (error) {
      console.error('❌ Failed to render template:', error);
      return this.createSimpleEmail({ subject: variables.subject, body: variables.body });
    }
  }

  /**
   * Create a simple email from data
   */
  createSimpleEmail(emailData) {
    const { subject, body } = emailData;

    return `
To: ${emailData.to}
Subject: ${subject}
Date: ${new Date().toUTCString()}

${body}

---
This is an automated message from your content generation system.
`;
  }

  /**
   * Save email to file
   */
  saveEmail(emailData, renderedEmail) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `email_${timestamp}_${emailData.to.replace(/[@.]/g, '_')}.txt`;
      const filePath = path.join(this.emailsDir, filename);

      fs.writeFileSync(filePath, renderedEmail);
      console.log(`✅ Email saved to: ${filePath}`);
    } catch (error) {
      console.error('❌ Failed to save email:', error);
    }
  }

  /**
   * Send pipeline completion notification
   */
  async sendPipelineCompletionNotification(recipient, pipelineData) {
    try {
      const emailData = {
        to: recipient,
        subject: `Pipeline Completed: ${pipelineData.topic}`,
        template: 'pipeline_completion',
        variables: {
          topic: pipelineData.topic,
          completedAt: new Date().toLocaleString(),
          steps: Object.keys(pipelineData.steps || {}).length,
          success: pipelineData.status === 'completed'
        }
      };

      return await this.sendEmailNotification(emailData);
    } catch (error) {
      console.error('❌ Failed to send pipeline completion notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send error notification
   */
  async sendErrorNotification(recipient, errorData) {
    try {
      const emailData = {
        to: recipient,
        subject: `Pipeline Error: ${errorData.pipelineId}`,
        template: 'error_notification',
        variables: {
          pipelineId: errorData.pipelineId,
          error: errorData.error.message || errorData.error,
          timestamp: new Date().toLocaleString(),
          stack: errorData.error.stack || 'No stack trace available'
        }
      };

      return await this.sendEmailNotification(emailData);
    } catch (error) {
      console.error('❌ Failed to send error notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send daily summary
   */
  async sendDailySummary(recipient, summaryData) {
    try {
      const emailData = {
        to: recipient,
        subject: 'Daily Content Generation Summary',
        template: 'daily_summary',
        variables: {
          date: new Date().toLocaleDateString(),
          totalPipelines: summaryData.totalPipelines || 0,
          successfulPipelines: summaryData.successfulPipelines || 0,
          failedPipelines: summaryData.failedPipelines || 0,
          totalRevenue: summaryData.totalRevenue ? `$${summaryData.totalRevenue.toFixed(2)}` : '$0.00'
        }
      };

      return await this.sendEmailNotification(emailData);
    } catch (error) {
      console.error('❌ Failed to send daily summary:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load email template
   */
  loadEmailTemplate(templateName) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.html`);
      if (!fs.existsSync(templatePath)) {
        return null;
      }

      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      console.error('❌ Failed to load email template:', error);
      return null;
    }
  }

  /**
   * Save email template
   */
  saveEmailTemplate(templateName, templateContent) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.html`);
      fs.writeFileSync(templatePath, templateContent);
      console.log(`✅ Email template saved: ${templateName}`);
    } catch (error) {
      console.error('❌ Failed to save email template:', error);
    }
  }
}

module.exports = EmailAgentService;