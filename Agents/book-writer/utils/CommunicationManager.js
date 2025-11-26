const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

/**
 * Communication Manager for Book Writer Agent
 * Manages all external communications for the book writing process
 */
class CommunicationManager {
  constructor(config = {}) {
    this.config = {
      dataDir: path.join(__dirname, '../../../data/communications'),
      logDir: path.join(__dirname, '../../../data/communications/logs'),
      templatesDir: path.join(__dirname, '../../../data/templates/communication-templates'),
      smtp: {
        host: process.env.SMTP_HOST || 'smtp.example.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true' || false,
        auth: {
          user: process.env.SMTP_USER || 'user@example.com',
          pass: process.env.SMTP_PASS || 'password'
        }
      },
      ...config
    };

    this.ensureDirectories();
    this.initializeMailer();
    this.loadTemplates();
  }

  ensureDirectories() {
    const dirs = [this.config.dataDir, this.config.logDir, this.config.templatesDir];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Initialize mailer
   */
  initializeMailer() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: this.config.smtp.host,
        port: this.config.smtp.port,
        secure: this.config.smtp.secure,
        auth: this.config.smtp.auth.user ? this.config.smtp.auth : undefined
      });

      console.log('📧 Mailer initialized');
    } catch (error) {
      console.error('❌ Failed to initialize mailer:', error.message);
    }
  }

  /**
   * Load communication templates
   */
  loadTemplates() {
    console.log('📋 Loading communication templates');

    try {
      // Check if default templates exist, create if not
      const defaultTemplates = this.getDefaultTemplates();

      for (const [templateName, templateData] of Object.entries(defaultTemplates)) {
        const templatePath = path.join(this.config.templatesDir, `${templateName}.json`);

        if (!fs.existsSync(templatePath)) {
          fs.writeFileSync(templatePath, JSON.stringify(templateData, null, 2));
          console.log(`✅ Default template created: ${templateName}`);
        }
      }

      console.log('✅ Communication templates loaded');
    } catch (error) {
      console.error('❌ Failed to load communication templates:', error.message);
    }
  }

  /**
   * Get default communication templates
   */
  getDefaultTemplates() {
    return {
      'project-update': {
        id: 'project-update',
        name: 'Project Update',
        subject: 'Buchprojekt Fortschritt: {book_title}',
        body: `Sehr geehrte Damen und Herren,

wir möchten Sie über den aktuellen Fortschritt Ihres Buchprojekts "{book_title}" informieren.

{update_content}

Falls Sie Fragen haben oder Änderungen wünschen, zögern Sie bitte nicht, uns zu kontaktieren.

Mit freundlichen Grüßen,
Ihr Book Writer Agent`,
        variables: ['book_title', 'update_content']
      },
      'review-request': {
        id: 'review-request',
        name: 'Review Request',
        subject: 'Bitte überprüfen Sie Ihr Kapitel: {chapter_title}',
        body: `Sehr geehrte Damen und Herren,

das Kapitel "{chapter_title}" Ihres Buches "{book_title}" ist nun fertiggestellt und steht zur Überprüfung bereit.

{chapter_preview}

Bitte überprüfen Sie den Inhalt und teilen Sie uns Ihre Änderungswünsche mit.

Vielen Dank für Ihre Zusammenarbeit.

Mit freundlichen Grüßen,
Ihr Book Writer Agent`,
        variables: ['book_title', 'chapter_title', 'chapter_preview']
      },
      'deal-negotiation': {
        id: 'deal-negotiation',
        name: 'Deal Negotiation',
        subject: 'Verlagsangebot für "{book_title}"',
        body: `Sehr geehrte Damen und Herren,

wir freuen uns, Ihnen mitteilen zu können, dass wir ein Verlagsangebot für Ihr Buch "{book_title}" erhalten haben.

{offer_details}

Bitte überprüfen Sie die Konditionen und teilen Sie uns mit, ob Sie das Angebot annehmen möchten.

Mit freundlichen Grüßen,
Ihr Book Writer Agent`,
        variables: ['book_title', 'offer_details']
      },
      'publication-confirmation': {
        id: 'publication-confirmation',
        name: 'Publication Confirmation',
        subject: 'Ihr Buch "{book_title}" wurde veröffentlicht!',
        body: `Sehr geehrte Damen und Herren,

wir freuen uns, Ihnen mitteilen zu können, dass Ihr Buch "{book_title}" erfolgreich veröffentlicht wurde.

{publication_details}

Das Buch ist nun in den folgenden Formaten erhältlich:
{available_formats}

Vielen Dank für Ihr Vertrauen in unseren Service.

Mit freundlichen Grüßen,
Ihr Book Writer Agent`,
        variables: ['book_title', 'publication_details', 'available_formats']
      }
    };
  }

  /**
   * Send email notification
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(messageData) {
    console.log(`📧 Sending email to ${messageData.to}`);

    try {
      // Validate message data
      if (!messageData.to || !messageData.subject || !messageData.body) {
        throw new Error('Missing required email fields: to, subject, body');
      }

      // Prepare email options
      const mailOptions = {
        from: messageData.from || this.config.smtp.auth.user,
        to: messageData.to,
        subject: messageData.subject,
        text: messageData.body,
        html: messageData.html || undefined
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);

      // Log communication
      await this.logCommunication({
        type: 'email',
        direction: 'outgoing',
        recipient: messageData.to,
        subject: messageData.subject,
        messageId: result.messageId,
        sentAt: new Date().toISOString()
      });

      console.log(`✅ Email sent successfully to ${messageData.to}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error(`❌ Failed to send email to ${messageData.to}:`, error.message);

      // Log failed communication
      await this.logCommunication({
        type: 'email',
        direction: 'outgoing',
        recipient: messageData.to,
        subject: messageData.subject,
        error: error.message,
        failedAt: new Date().toISOString()
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * Send project update notification
   * @param {Object} projectData - Project data
   * @param {Object} recipient - Recipient information
   * @returns {Promise<Object>} Send result
   */
  async sendProjectUpdate(projectData, recipient) {
    console.log(`📧 Sending project update for "${projectData.title}"`);

    try {
      // Load template
      const template = await this.loadTemplate('project-update');

      if (!template) {
        throw new Error('Project update template not found');
      }

      // Populate template
      const messageData = this.populateTemplate(template, {
        book_title: projectData.title,
        update_content: this.generateUpdateContent(projectData)
      });

      // Send email
      const result = await this.sendEmail({
        to: recipient.email,
        subject: messageData.subject,
        body: messageData.body
      });

      console.log(`✅ Project update sent for "${projectData.title}"`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send project update:', error.message);
      throw error;
    }
  }

  /**
   * Send review request
   * @param {Object} chapterData - Chapter data
   * @param {Object} projectData - Project data
   * @param {Object} recipient - Recipient information
   * @returns {Promise<Object>} Send result
   */
  async sendReviewRequest(chapterData, projectData, recipient) {
    console.log(`📧 Sending review request for "${chapterData.title}"`);

    try {
      // Load template
      const template = await this.loadTemplate('review-request');

      if (!template) {
        throw new Error('Review request template not found');
      }

      // Generate chapter preview
      const chapterPreview = chapterData.content
        ? chapterData.content.substring(0, 500) + '...'
        : 'Kein Inhalt verfügbar';

      // Populate template
      const messageData = this.populateTemplate(template, {
        book_title: projectData.title,
        chapter_title: chapterData.title,
        chapter_preview: chapterPreview
      });

      // Send email
      const result = await this.sendEmail({
        to: recipient.email,
        subject: messageData.subject,
        body: messageData.body
      });

      console.log(`✅ Review request sent for "${chapterData.title}"`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send review request:', error.message);
      throw error;
    }
  }

  /**
   * Send deal negotiation notification
   * @param {Object} dealData - Deal data
   * @param {Object} recipient - Recipient information
   * @returns {Promise<Object>} Send result
   */
  async sendDealNegotiation(dealData, recipient) {
    console.log(`📧 Sending deal negotiation for "${dealData.book.title}"`);

    try {
      // Load template
      const template = await this.loadTemplate('deal-negotiation');

      if (!template) {
        throw new Error('Deal negotiation template not found');
      }

      // Generate offer details
      const offerDetails = this.generateOfferDetails(dealData);

      // Populate template
      const messageData = this.populateTemplate(template, {
        book_title: dealData.book.title,
        offer_details: offerDetails
      });

      // Send email
      const result = await this.sendEmail({
        to: recipient.email,
        subject: messageData.subject,
        body: messageData.body
      });

      console.log(`✅ Deal negotiation sent for "${dealData.book.title}"`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send deal negotiation:', error.message);
      throw error;
    }
  }

  /**
   * Send publication confirmation
   * @param {Object} publicationData - Publication data
   * @param {Object} recipient - Recipient information
   * @returns {Promise<Object>} Send result
   */
  async sendPublicationConfirmation(publicationData, recipient) {
    console.log(`📧 Sending publication confirmation for "${publicationData.book.title}"`);

    try {
      // Load template
      const template = await this.loadTemplate('publication-confirmation');

      if (!template) {
        throw new Error('Publication confirmation template not found');
      }

      // Generate publication details
      const publicationDetails = this.generatePublicationDetails(publicationData);

      // Generate available formats
      const availableFormats = publicationData.formats
        ? publicationData.formats.join(', ')
        : 'Print, E-Book, Audiobook';

      // Populate template
      const messageData = this.populateTemplate(template, {
        book_title: publicationData.book.title,
        publication_details: publicationDetails,
        available_formats: availableFormats
      });

      // Send email
      const result = await this.sendEmail({
        to: recipient.email,
        subject: messageData.subject,
        body: messageData.body
      });

      console.log(`✅ Publication confirmation sent for "${publicationData.book.title}"`);
      return result;
    } catch (error) {
      console.error('❌ Failed to send publication confirmation:', error.message);
      throw error;
    }
  }

  /**
   * Generate update content for project update
   */
  generateUpdateContent(projectData) {
    const updates = [];

    if (projectData.chaptersCompleted) {
      updates.push(`Kapitel abgeschlossen: ${projectData.chaptersCompleted}/${projectData.totalChapters}`);
    }

    if (projectData.wordCount) {
      updates.push(`Aktuelle Wortzahl: ${projectData.wordCount}`);
    }

    if (projectData.nextMilestone) {
      updates.push(`Nächstes Ziel: ${projectData.nextMilestone}`);
    }

    if (updates.length === 0) {
      updates.push('Das Projekt schreitet gut voran.');
    }

    return updates.join('\n\n');
  }

  /**
   * Generate offer details for deal negotiation
   */
  generateOfferDetails(dealData) {
    const details = [];

    if (dealData.finalOffer) {
      details.push(`Royalty-Rate: ${dealData.finalOffer.royaltyRate}%`);
      details.push(`Vorschuss: ${this.formatCurrency(dealData.finalOffer.advance)}`);
      details.push(`Veröffentlichungszeitraum: ${dealData.finalOffer.publicationTimeline}`);
    }

    if (dealData.publisher) {
      details.push(`Verlag: ${dealData.publisher.name}`);
    }

    return details.join('\n');
  }

  /**
   * Generate publication details
   */
  generatePublicationDetails(publicationData) {
    const details = [];

    if (publicationData.publicationDate) {
      details.push(`Veröffentlichungsdatum: ${new Date(publicationData.publicationDate).toLocaleDateString('de-DE')}`);
    }

    if (publicationData.publisher) {
      details.push(`Verlag: ${publicationData.publisher.name}`);
    }

    if (publicationData.isbn) {
      details.push(`ISBN: ${publicationData.isbn}`);
    }

    return details.join('\n');
  }

  /**
   * Format currency value
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  /**
   * Load communication template
   */
  async loadTemplate(templateId) {
    try {
      const templatePath = path.join(this.config.templatesDir, `${templateId}.json`);

      if (fs.existsSync(templatePath)) {
        const content = fs.readFileSync(templatePath, 'utf8');
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to load template ${templateId}:`, error.message);
      return null;
    }
  }

  /**
   * Populate template with variables
   */
  populateTemplate(template, variables) {
    let subject = template.subject;
    let body = template.body;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      body = body.replace(new RegExp(placeholder, 'g'), value);
    }

    return { subject, body };
  }

  /**
   * Log communication
   */
  async logCommunication(communicationData) {
    try {
      const filename = `communication-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.json`;
      const filepath = path.join(this.config.logDir, filename);

      const logData = {
        ...communicationData,
        loggedAt: new Date().toISOString()
      };

      fs.writeFileSync(filepath, JSON.stringify(logData, null, 2));
    } catch (error) {
      console.warn('⚠️ Failed to log communication:', error.message);
    }
  }

  /**
   * Get communication history for recipient
   */
  async getCommunicationHistory(recipientEmail) {
    try {
      const files = fs.readdirSync(this.config.logDir)
        .filter(f => f.startsWith('communication-') && f.endsWith('.json'))
        .sort()
        .reverse(); // Most recent first

      const history = [];

      for (const file of files) {
        try {
          const filepath = path.join(this.config.logDir, file);
          const content = fs.readFileSync(filepath, 'utf8');
          const logEntry = JSON.parse(content);

          if (logEntry.recipient === recipientEmail) {
            history.push(logEntry);

            // Limit to 50 most recent entries
            if (history.length >= 50) {
              break;
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to parse communication log: ${file}`);
        }
      }

      return history;
    } catch (error) {
      console.error('❌ Failed to get communication history:', error.message);
      return [];
    }
  }

  /**
   * Get communication statistics
   */
  getStats() {
    try {
      const logFiles = fs.readdirSync(this.config.logDir)
        .filter(f => f.startsWith('communication-') && f.endsWith('.json'));

      const templateFiles = fs.readdirSync(this.config.templatesDir)
        .filter(f => f.endsWith('.json'));

      let sentEmails = 0;
      let failedEmails = 0;

      for (const file of logFiles) {
        try {
          const filepath = path.join(this.config.logDir, file);
          const content = fs.readFileSync(filepath, 'utf8');
          const logEntry = JSON.parse(content);

          if (logEntry.type === 'email') {
            if (logEntry.error) {
              failedEmails++;
            } else {
              sentEmails++;
            }
          }
        } catch (error) {
          console.warn(`⚠️ Failed to parse communication log for stats: ${file}`);
        }
      }

      return {
        totalCommunications: logFiles.length,
        sentEmails: sentEmails,
        failedEmails: failedEmails,
        totalTemplates: templateFiles.length,
        logDir: this.config.logDir,
        templatesDir: this.config.templatesDir
      };
    } catch (error) {
      console.error('❌ Failed to get communication stats:', error.message);
      return { error: error.message };
    }
  }
}

module.exports = CommunicationManager;