const CommunicationManager = require('../../utils/CommunicationManager');

describe('CommunicationManager', () => {
  let communicationManager;

  beforeEach(() => {
    communicationManager = new CommunicationManager({
      smtp: {
        host: 'test.smtp.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'testpassword'
        }
      }
    });
  });

  describe('sendEmail', () => {
    it('should send email with required fields', async () => {
      const messageData = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test email body'
      };

      // Mock the transporter sendMail method
      communicationManager.transporter.sendMail = jest.fn().mockResolvedValue({
        messageId: 'test-message-id'
      });

      const result = await communicationManager.sendEmail(messageData);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.messageId).toBe('test-message-id');
      expect(communicationManager.transporter.sendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test email body'
      });
    });

    it('should handle email sending failure', async () => {
      const messageData = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test email body'
      };

      // Mock the transporter sendMail method to throw an error
      communicationManager.transporter.sendMail = jest.fn().mockRejectedValue(
        new Error('SMTP connection failed')
      );

      const result = await communicationManager.sendEmail(messageData);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should throw error for missing required fields', async () => {
      const messageData = {
        // Missing required fields
      };

      // Mock the transporter
      communicationManager.transporter.sendMail = jest.fn();

      const result = await communicationManager.sendEmail(messageData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('sendProjectUpdate', () => {
    it('should send project update notification', async () => {
      const projectData = {
        title: 'Project Update Test Book'
      };

      const recipient = {
        email: 'author@example.com'
      };

      // Mock the sendEmail method
      communicationManager.sendEmail = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'project-update-message-id'
      });

      const result = await communicationManager.sendProjectUpdate(projectData, recipient);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(communicationManager.sendEmail).toHaveBeenCalled();
    });
  });

  describe('sendReviewRequest', () => {
    it('should send review request notification', async () => {
      const chapterData = {
        title: 'Review Chapter',
        content: 'Chapter content for review'
      };

      const projectData = {
        title: 'Review Request Test Book'
      };

      const recipient = {
        email: 'reviewer@example.com'
      };

      // Mock the sendEmail method
      communicationManager.sendEmail = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'review-request-message-id'
      });

      const result = await communicationManager.sendReviewRequest(chapterData, projectData, recipient);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(communicationManager.sendEmail).toHaveBeenCalled();
    });
  });

  describe('sendDealNegotiation', () => {
    it('should send deal negotiation notification', async () => {
      const dealData = {
        book: { title: 'Deal Negotiation Test Book' },
        finalOffer: { royaltyRate: 0.12, advance: 10000 }
      };

      const recipient = {
        email: 'author@example.com'
      };

      // Mock the sendEmail method
      communicationManager.sendEmail = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'deal-negotiation-message-id'
      });

      const result = await communicationManager.sendDealNegotiation(dealData, recipient);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(communicationManager.sendEmail).toHaveBeenCalled();
    });
  });

  describe('sendPublicationConfirmation', () => {
    it('should send publication confirmation notification', async () => {
      const publicationData = {
        book: { title: 'Publication Confirmation Test Book' },
        publicationDate: new Date().toISOString(),
        publisher: { name: 'Test Publisher' }
      };

      const recipient = {
        email: 'author@example.com'
      };

      // Mock the sendEmail method
      communicationManager.sendEmail = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'publication-confirmation-message-id'
      });

      const result = await communicationManager.sendPublicationConfirmation(publicationData, recipient);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(communicationManager.sendEmail).toHaveBeenCalled();
    });
  });

  describe('loadTemplate', () => {
    it('should load communication template by ID', async () => {
      const template = await communicationManager.loadTemplate('project-update');

      expect(template).toBeDefined();
      expect(template.id).toBe('project-update');
      expect(template.name).toBeDefined();
      expect(template.subject).toBeDefined();
      expect(template.body).toBeDefined();
      expect(template.variables).toBeDefined();
    });

    it('should return null for non-existent template', async () => {
      const template = await communicationManager.loadTemplate('non-existent-template');

      expect(template).toBeNull();
    });
  });

  describe('populateTemplate', () => {
    it('should populate template with variables', () => {
      const template = {
        subject: 'Book "{book_title}" Update',
        body: 'Dear Author,\n\n{update_content}\n\nBest regards'
      };

      const variables = {
        book_title: 'Test Book',
        update_content: 'The book is progressing well.'
      };

      const populated = communicationManager.populateTemplate(template, variables);

      expect(populated).toBeDefined();
      expect(populated.subject).toBe('Book "Test Book" Update');
      expect(populated.body).toBe('Dear Author,\n\nThe book is progressing well.\n\nBest regards');
    });
  });

  describe('getCommunicationHistory', () => {
    it('should get communication history for recipient', async () => {
      const recipientEmail = 'test@example.com';

      // Create a test communication log
      await communicationManager.logCommunication({
        type: 'email',
        direction: 'outgoing',
        recipient: recipientEmail,
        subject: 'Test Communication',
        messageId: 'test-message-id',
        sentAt: new Date().toISOString()
      });

      const history = await communicationManager.getCommunicationHistory(recipientEmail);

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      // Should find at least one communication
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].recipient).toBe(recipientEmail);
    });
  });

  describe('getStats', () => {
    it('should return communication statistics', () => {
      const stats = communicationManager.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalCommunications).toBeDefined();
      expect(stats.sentEmails).toBeDefined();
      expect(stats.failedEmails).toBeDefined();
      expect(stats.totalTemplates).toBeDefined();
      expect(stats.logDir).toBeDefined();
      expect(stats.templatesDir).toBeDefined();
    });
  });
});