const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Contract Manager for Book Writer Agent
 * Manages publishing contracts and legal agreements
 */
class ContractManager {
  constructor(config = {}) {
    this.config = {
      dataDir: path.join(__dirname, '../../../data/publishing/contracts'),
      templateDir: path.join(__dirname, '../../../data/templates/contract-templates'),
      defaultContractTemplate: 'standard-publishing-agreement',
      ...config
    };

    this.ensureDirectories();
    this.loadContractTemplates();
  }

  ensureDirectories() {
    const dirs = [this.config.dataDir, this.config.templateDir];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Load contract templates
   */
  loadContractTemplates() {
    console.log('📜 Loading contract templates');

    try {
      // Check if default template exists, create if not
      const defaultTemplatePath = path.join(this.config.templateDir, `${this.config.defaultContractTemplate}.json`);

      if (!fs.existsSync(defaultTemplatePath)) {
        // Create default template
        const defaultTemplate = this.createDefaultContractTemplate();
        fs.writeFileSync(defaultTemplatePath, JSON.stringify(defaultTemplate, null, 2));
        console.log(`✅ Default contract template created: ${defaultTemplatePath}`);
      }

      console.log('✅ Contract templates loaded');
    } catch (error) {
      console.error('❌ Failed to load contract templates:', error.message);
    }
  }

  /**
   * Create default contract template
   */
  createDefaultContractTemplate() {
    return {
      id: this.config.defaultContractTemplate,
      name: 'Standard Publishing Agreement',
      version: '1.0',
      clauses: {
        parties: {
          title: 'Parties',
          content: 'This Agreement is made between {author_name} (the "Author") and {publisher_name} (the "Publisher").'
        },
        grantOfRights: {
          title: 'Grant of Rights',
          content: 'The Author grants to the Publisher the exclusive right to publish, reproduce, distribute, and sell the Work in all formats and media throughout the world for the full term of copyright and any renewals or extensions.'
        },
        royalties: {
          title: 'Royalties',
          content: 'The Publisher shall pay the Author a royalty of {royalty_rate}% of the net receipts received by the Publisher from the sale of the Work.'
        },
        advance: {
          title: 'Advance',
          content: 'The Publisher shall pay the Author an advance of {advance_amount} against future royalties, payable as follows: {advance_payment_schedule}.'
        },
        publication: {
          title: 'Publication',
          content: 'The Publisher shall use its best efforts to publish and distribute the Work within {publication_timeline} of the date of this Agreement.'
        },
        warranties: {
          title: 'Warranties',
          content: 'The Author warrants that the Work is original, does not infringe upon any copyright or violate any right of privacy, and is not defamatory.'
        },
        termination: {
          title: 'Termination',
          content: 'This Agreement may be terminated by either party upon {termination_notice_period} days written notice if the other party is in material breach of any provision of this Agreement.'
        }
      },
      metadata: {
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        jurisdiction: 'Germany'
      }
    };
  }

  /**
   * Generate contract for deal
   * @param {Object} dealData - Deal data
   * @param {string} templateId - Template ID to use
   * @returns {Promise<Object>} Generated contract
   */
  async generateContract(dealData, templateId = this.config.defaultContractTemplate) {
    // Handle case where publisher might not be defined
    const publisherName = dealData.publisher?.name || dealData.publisher || 'Unknown Publisher';
    console.log(`📄 Generating contract for deal with ${publisherName}`);

    try {
      // Load template
      const template = await this.loadContractTemplate(templateId);

      if (!template) {
        throw new Error(`Contract template not found: ${templateId}`);
      }

      // Generate contract from template
      const contract = this.populateContractTemplate(template, dealData);

      // Save contract
      await this.saveContract(contract);

      console.log(`✅ Contract generated for deal with ${publisherName}`);
      return contract;
    } catch (error) {
      console.error('❌ Failed to generate contract:', error.message);
      throw error;
    }
  }

  /**
   * Load contract template
   */
  async loadContractTemplate(templateId) {
    try {
      const templatePath = path.join(this.config.templateDir, `${templateId}.json`);

      if (fs.existsSync(templatePath)) {
        const content = fs.readFileSync(templatePath, 'utf8');
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to load contract template ${templateId}:`, error.message);
      return null;
    }
  }

  /**
   * Populate contract template with deal data
   */
  populateContractTemplate(template, dealData) {
    const contract = {
      id: uuidv4(),
      templateId: template.id,
      dealId: dealData.id || null,
      parties: {
        author: {
          name: dealData.book?.author || 'Author Name',
          email: dealData.book?.authorEmail || 'author@example.com',
          address: dealData.book?.authorAddress || 'Author Address'
        },
        publisher: {
          name: dealData.publisher?.name || dealData.publisher || 'Publisher Name',
          email: dealData.publisher?.contact?.email || 'publisher@example.com',
          address: dealData.publisher?.contact?.address || 'Publisher Address'
        }
      },
      terms: {},
      metadata: {
        createdAt: new Date().toISOString(),
        generatedFromDeal: dealData.timestamp || new Date().toISOString(),
        status: 'draft'
      }
    };

    // Populate clauses with deal data
    for (const [clauseId, clauseTemplate] of Object.entries(template.clauses)) {
      let content = clauseTemplate.content;

      // Replace placeholders with deal data
      content = content.replace(/{author_name}/g, contract.parties.author.name);
      content = content.replace(/{publisher_name}/g, contract.parties.publisher.name);
      content = content.replace(/{royalty_rate}/g, dealData.finalOffer?.royaltyRate || dealData.royaltyRate || '12');
      content = content.replace(/{advance_amount}/g, this.formatCurrency(dealData.finalOffer?.advance || dealData.advance || 10000));
      content = content.replace(/{publication_timeline}/g, dealData.finalOffer?.publicationTimeline || dealData.publicationTimeline || '12-18 months');
      content = content.replace(/{termination_notice_period}/g, '30');

      // Add payment schedule for advance
      const advance = dealData.finalOffer?.advance || dealData.advance || 10000;
      const paymentSchedule = advance >= 5000
        ? '50% upon signing, 50% upon manuscript delivery'
        : '100% upon signing';
      content = content.replace(/{advance_payment_schedule}/g, paymentSchedule);

      contract.terms[clauseId] = {
        title: clauseTemplate.title,
        content: content
      };
    }

    return contract;
  }

  /**
   * Format currency value
   */
  formatCurrency(amount) {
    // Simple formatting - in a real implementation, this would be more sophisticated
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  /**
   * Review contract
   * @param {Object} contract - Contract to review
   * @returns {Promise<Object>} Review result
   */
  async reviewContract(contract) {
    console.log(`🔍 Reviewing contract ${contract.id}`);

    try {
      // Simulate contract review
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simple review - in a real implementation, this would involve legal expertise
      const reviewResult = {
        contractId: contract.id,
        reviewedAt: new Date().toISOString(),
        status: 'approved', // or 'requires_changes' or 'rejected'
        comments: [],
        recommendations: []
      };

      // Check for essential elements
      if (!contract.terms.parties) {
        reviewResult.comments.push('Missing parties clause');
        reviewResult.status = 'requires_changes';
      }

      if (!contract.terms.grantOfRights) {
        reviewResult.comments.push('Missing grant of rights clause');
        reviewResult.status = 'requires_changes';
      }

      if (!contract.terms.royalties) {
        reviewResult.comments.push('Missing royalties clause');
        reviewResult.status = 'requires_changes';
      }

      if (reviewResult.status === 'approved') {
        reviewResult.recommendations.push('Consider adding subsidiary rights clause');
        reviewResult.recommendations.push('Consider adding reversion clause');
      }

      console.log(`✅ Contract review completed: ${reviewResult.status}`);
      return reviewResult;
    } catch (error) {
      console.error(`❌ Failed to review contract ${contract.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Sign contract
   * @param {Object} contract - Contract to sign
   * @param {string} party - Party signing ('author' or 'publisher')
   * @returns {Promise<Object>} Signed contract
   */
  async signContract(contract, party) {
    console.log(`✍️ Signing contract ${contract.id} by ${party}`);

    try {
      // Add signature to contract
      if (!contract.signatures) {
        contract.signatures = {};
      }

      contract.signatures[party] = {
        signedAt: new Date().toISOString(),
        signature: `Digital signature of ${party}`,
        ipAddress: '127.0.0.1' // In a real implementation, this would be the actual IP
      };

      // Set status to draft when first party signs
      if (!contract.metadata.status || contract.metadata.status === 'draft') {
        contract.metadata.status = 'draft';
      }

      // Update status to executed if both parties have signed
      if (contract.signatures.author && contract.signatures.publisher) {
        contract.metadata.status = 'executed';
        contract.metadata.executedAt = new Date().toISOString();
      }

      // Save updated contract
      await this.saveContract(contract);

      console.log(`✅ Contract signed by ${party}`);
      return contract;
    } catch (error) {
      console.error(`❌ Failed to sign contract ${contract.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Save contract
   */
  async saveContract(contract) {
    try {
      const filename = `contract-${contract.id}.json`;
      const filepath = path.join(this.config.dataDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(contract, null, 2));
      console.log(`💾 Contract saved: ${filepath}`);
    } catch (error) {
      console.error('❌ Failed to save contract:', error.message);
    }
  }

  /**
   * Load contract
   */
  async loadContract(contractId) {
    try {
      const filename = `contract-${contractId}.json`;
      const filepath = path.join(this.config.dataDir, filename);

      if (fs.existsSync(filepath)) {
        const content = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(content);
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to load contract ${contractId}:`, error.message);
      return null;
    }
  }

  /**
   * Get all contracts for a party
   */
  async getContractsForParty(partyName) {
    try {
      const files = fs.readdirSync(this.config.dataDir)
        .filter(f => f.startsWith('contract-') && f.endsWith('.json'));

      const contracts = [];
      for (const file of files) {
        try {
          const filepath = path.join(this.config.dataDir, file);
          const content = fs.readFileSync(filepath, 'utf8');
          const contract = JSON.parse(content);

          // Check if party is involved in contract
          if (contract.parties.author.name.includes(partyName) ||
              contract.parties.publisher.name.includes(partyName)) {
            contracts.push(contract);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to parse contract file: ${file}`);
        }
      }

      return contracts;
    } catch (error) {
      console.error('❌ Failed to get contracts for party:', error.message);
      return [];
    }
  }

  /**
   * Create custom contract template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} Created template
   */
  async createContractTemplate(templateData) {
    console.log(`➕ Creating contract template: ${templateData.name}`);

    try {
      // Add metadata
      const template = {
        ...templateData,
        id: templateData.id || this.generateTemplateId(templateData.name),
        metadata: {
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          version: templateData.version || '1.0'
        }
      };

      // Save template
      const filename = `${template.id}.json`;
      const filepath = path.join(this.config.templateDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(template, null, 2));
      console.log(`✅ Contract template created: ${filepath}`);

      return template;
    } catch (error) {
      console.error('❌ Failed to create contract template:', error.message);
      throw error;
    }
  }

  /**
   * Generate template ID from name
   */
  generateTemplateId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  /**
   * Get contract management statistics
   */
  getStats() {
    try {
      const contractFiles = fs.readdirSync(this.config.dataDir)
        .filter(f => f.startsWith('contract-') && f.endsWith('.json'));

      const templateFiles = fs.readdirSync(this.config.templateDir)
        .filter(f => f.endsWith('.json'));

      let executedContracts = 0;
      let draftContracts = 0;

      for (const file of contractFiles) {
        try {
          const filepath = path.join(this.config.dataDir, file);
          const content = fs.readFileSync(filepath, 'utf8');
          const contract = JSON.parse(content);

          if (contract.metadata.status === 'executed') {
            executedContracts++;
          } else {
            draftContracts++;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to parse contract file for stats: ${file}`);
        }
      }

      return {
        totalContracts: contractFiles.length,
        executedContracts: executedContracts,
        draftContracts: draftContracts,
        totalTemplates: templateFiles.length,
        dataDir: this.config.dataDir,
        templateDir: this.config.templateDir
      };
    } catch (error) {
      console.error('❌ Failed to get contract management stats:', error.message);
      return { error: error.message };
    }
  }
}

module.exports = ContractManager;