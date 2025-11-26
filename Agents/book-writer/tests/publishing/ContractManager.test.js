const ContractManager = require('../../publishing/ContractManager');

describe('ContractManager', () => {
  let contractManager;

  beforeEach(() => {
    contractManager = new ContractManager();
  });

  describe('generateContract', () => {
    it('should generate contract for deal using default template', async () => {
      const dealData = {
        publisher: {
          name: 'Test Publisher',
          contact: {
            email: 'info@test-publisher.com',
            address: 'Test Address'
          }
        },
        book: {
          title: 'Test Book',
          author: 'Test Author',
          authorEmail: 'author@test.com',
          authorAddress: 'Author Address'
        },
        finalOffer: {
          royaltyRate: 0.12,
          advance: 10000,
          publicationTimeline: '12-18 months'
        }
      };

      const contract = await contractManager.generateContract(dealData);

      expect(contract).toBeDefined();
      expect(contract.id).toBeDefined();
      expect(contract.templateId).toBe('standard-publishing-agreement');
      expect(contract.parties).toBeDefined();
      expect(contract.parties.author).toBeDefined();
      expect(contract.parties.publisher).toBeDefined();
      expect(contract.terms).toBeDefined();
      expect(contract.metadata).toBeDefined();
      expect(contract.metadata.createdAt).toBeDefined();
    });

    it('should throw error for non-existent template', async () => {
      const dealData = { book: { title: 'Test Book' } };

      await expect(contractManager.generateContract(dealData, 'non-existent-template'))
        .rejects
        .toThrow('Contract template not found: non-existent-template');
    });
  });

  describe('reviewContract', () => {
    it('should review contract and return review result', async () => {
      const contract = {
        id: 'test-contract',
        terms: {
          parties: { content: 'Parties clause' },
          grantOfRights: { content: 'Rights clause' },
          royalties: { content: 'Royalties clause' }
        }
      };

      const reviewResult = await contractManager.reviewContract(contract);

      expect(reviewResult).toBeDefined();
      expect(reviewResult.contractId).toBe('test-contract');
      expect(reviewResult.reviewedAt).toBeDefined();
      expect(reviewResult.status).toBeDefined();
      expect(reviewResult.comments).toBeDefined();
      expect(reviewResult.recommendations).toBeDefined();
    });

    it('should identify missing essential clauses', async () => {
      const contract = {
        id: 'incomplete-contract',
        terms: {
          // Missing essential clauses
        }
      };

      const reviewResult = await contractManager.reviewContract(contract);

      expect(reviewResult.status).toBe('requires_changes');
      expect(reviewResult.comments.length).toBeGreaterThan(0);
      // Should identify missing clauses
      expect(reviewResult.comments.some(c => c.includes('parties'))).toBe(true);
      expect(reviewResult.comments.some(c => c.includes('rights'))).toBe(true);
      expect(reviewResult.comments.some(c => c.includes('royalties'))).toBe(true);
    });
  });

  describe('signContract', () => {
    it('should sign contract by party', async () => {
      const contract = {
        id: 'sign-test-contract',
        terms: {
          parties: {},
          grantOfRights: {},
          royalties: {}
        },
        metadata: {}
      };

      // Sign by author
      const signedByAuthor = await contractManager.signContract(contract, 'author');

      expect(signedByAuthor.signatures).toBeDefined();
      expect(signedByAuthor.signatures.author).toBeDefined();
      expect(signedByAuthor.signatures.author.signedAt).toBeDefined();
      expect(signedByAuthor.metadata.status).toBe('draft'); // Not executed yet

      // Sign by publisher
      const signedByPublisher = await contractManager.signContract(signedByAuthor, 'publisher');

      expect(signedByPublisher.signatures.publisher).toBeDefined();
      expect(signedByPublisher.signatures.publisher.signedAt).toBeDefined();
      expect(signedByPublisher.metadata.status).toBe('executed'); // Now executed
      expect(signedByPublisher.metadata.executedAt).toBeDefined();
    });
  });

  describe('getContractsForParty', () => {
    it('should get contracts for specific party', async () => {
      // Create a test contract
      const dealData = {
        publisher: { name: 'Party Test Publisher' },
        book: { title: 'Party Test Book', author: 'Test Author' }
      };

      await contractManager.generateContract(dealData);

      // Get contracts for the author
      const contracts = await contractManager.getContractsForParty('Test Author');

      expect(contracts).toBeDefined();
      expect(Array.isArray(contracts)).toBe(true);
      // Should find at least one contract
      expect(contracts.length).toBeGreaterThan(0);
    });
  });

  describe('createContractTemplate', () => {
    it('should create custom contract template', async () => {
      const templateData = {
        name: 'Custom Template',
        clauses: {
          testClause: {
            title: 'Test Clause',
            content: 'This is a test clause.'
          }
        }
      };

      const template = await contractManager.createContractTemplate(templateData);

      expect(template).toBeDefined();
      expect(template.id).toBeDefined();
      expect(template.name).toBe(templateData.name);
      expect(template.clauses).toBe(templateData.clauses);
      expect(template.metadata).toBeDefined();
      expect(template.metadata.createdAt).toBeDefined();
    });
  });

  describe('getStats', () => {
    it('should return contract management statistics', () => {
      const stats = contractManager.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalContracts).toBeDefined();
      expect(stats.executedContracts).toBeDefined();
      expect(stats.draftContracts).toBeDefined();
      expect(stats.totalTemplates).toBeDefined();
      expect(stats.dataDir).toBeDefined();
      expect(stats.templateDir).toBeDefined();
    });
  });
});