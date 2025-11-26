const InterviewConductor = require('../../core/InterviewConductor');

describe('InterviewConductor', () => {
  let interviewConductor;

  beforeEach(() => {
    interviewConductor = new InterviewConductor();
  });

  describe('conductProfessionalInterview', () => {
    it('should conduct a professional interview and return structured responses', async () => {
      const topic = 'Künstliche Intelligenz in der Politik';

      const result = await interviewConductor.conductProfessionalInterview(topic);

      expect(result).toBeDefined();
      expect(result.bookType).toBeDefined();
      expect(result.structure).toBeDefined();
      expect(result.market).toBeDefined();
      expect(result.marketAnalysis).toBeDefined();

      // Check that all expected categories are present
      expect(Object.keys(result)).toEqual(
        expect.arrayContaining(['bookType', 'structure', 'market', 'marketAnalysis'])
      );
    });

    it('should include market analysis in interview results', async () => {
      const topic = 'Digitale Transformation';

      const result = await interviewConductor.conductProfessionalInterview(topic);

      expect(result.marketAnalysis).toBeDefined();
      expect(result.marketAnalysis.topic).toBe(topic);
      expect(result.marketAnalysis.marketSize).toBeDefined();
      expect(result.marketAnalysis.competition).toBeDefined();
    });
  });

  describe('askQuestions', () => {
    it('should ask questions and return responses', async () => {
      const questions = [
        "Welche Art von Buch soll es werden?",
        "Wie viele Kapitel soll das Buch haben?"
      ];

      const responses = await interviewConductor.askQuestions(questions);

      expect(responses).toBeDefined();
      expect(Array.isArray(responses)).toBe(true);
      expect(responses.length).toBe(questions.length);
    });
  });

  describe('performMarketResearch', () => {
    it('should perform market research for a topic', async () => {
      const topic = 'Blockchain Technology';

      const result = await interviewConductor.performMarketResearch(topic);

      expect(result).toBeDefined();
      expect(result.topic).toBe(topic);
      expect(result.marketSize).toBeDefined();
      expect(result.competition).toBeDefined();
      expect(result.targetAudience).toBeDefined();
      expect(result.pricing).toBeDefined();
      expect(result.platforms).toBeDefined();
      expect(result.analyzedAt).toBeDefined();
    });
  });

  describe('getDefaultResponses', () => {
    it('should return default responses for all question categories', () => {
      const responses = interviewConductor.getDefaultResponses();

      expect(responses).toBeDefined();
      expect(responses.bookType).toBeDefined();
      expect(responses.structure).toBeDefined();
      expect(responses.market).toBeDefined();

      // Check that we have reasonable default responses
      expect(Array.isArray(responses.bookType.suggestedFormats)).toBe(true);
      expect(responses.structure.targetLength).toBeDefined();
      expect(responses.market.targetPrice).toBeDefined();
    });
  });
});