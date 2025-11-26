const ImageGenerator = require('../../media/ImageGenerator');

describe('ImageGenerator', () => {
  let imageGenerator;

  beforeEach(() => {
    imageGenerator = new ImageGenerator();
  });

  describe('generateImage', () => {
    it('should generate image with default provider', async () => {
      const requirements = {
        description: 'Test image for book cover',
        style: 'professional'
      };

      const result = await imageGenerator.generateImage(requirements);

      expect(result).toBeDefined();
      expect(result.provider).toBe('midjourney');
      expect(result.url).toBeDefined();
      expect(result.prompt).toBe(requirements.description);
      expect(result.generatedAt).toBeDefined();
    });

    it('should generate image with specific provider', async () => {
      const requirements = {
        description: 'Test image for chapter illustration',
        style: 'illustrative'
      };

      const result = await imageGenerator.generateImage(requirements, 'dalle3');

      expect(result).toBeDefined();
      expect(result.provider).toBe('dalle3');
      expect(result.url).toBeDefined();
    });

    it('should throw error for unsupported provider', async () => {
      const requirements = {
        description: 'Test image',
        style: 'test'
      };

      await expect(imageGenerator.generateImage(requirements, 'unsupported'))
        .rejects
        .toThrow('Unsupported image provider: unsupported');
    });
  });

  describe('selectOptimalProvider', () => {
    it('should select optimal provider based on requirements', () => {
      // Premium quality requirement should select Midjourney
      const premiumReq = { quality: 'premium' };
      expect(imageGenerator.selectOptimalProvider(premiumReq)).toBe('midjourney');

      // Fast speed requirement should select Stable Diffusion
      const fastReq = { speed: 'fast' };
      expect(imageGenerator.selectOptimalProvider(fastReq)).toBe('stablediffusion');

      // Default should use configured default provider
      expect(imageGenerator.selectOptimalProvider({})).toBe('midjourney');
    });
  });

  describe('batchGenerate', () => {
    it('should batch generate multiple images', async () => {
      const requirements = [
        { description: 'Image 1', style: 'professional' },
        { description: 'Image 2', style: 'illustrative' },
        { description: 'Image 3', style: 'technical' }
      ];

      const results = await imageGenerator.batchGenerate(requirements);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(3);

      // Check that all results have the expected structure
      results.forEach(result => {
        expect(result).toHaveProperty('requirement');
        expect(result).toHaveProperty('success');
        if (result.success) {
          expect(result).toHaveProperty('result');
        }
      });
    });

    it('should handle failures in batch generation', async () => {
      // Mock one provider to fail
      jest.spyOn(imageGenerator, 'generateImage').mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const requirements = [
        { description: 'Good image', style: 'professional' },
        { description: 'Problematic image', style: 'test' }
      ];

      const results = await imageGenerator.batchGenerate(requirements);

      expect(results).toBeDefined();
      expect(results.length).toBe(2);
      // One should succeed, one should fail
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      expect(successCount).toBe(1);
      expect(failureCount).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return image generation statistics', () => {
      const stats = imageGenerator.getStats();

      expect(stats).toBeDefined();
      expect(stats.totalImages).toBeDefined();
      expect(stats.providerStats).toBeDefined();
      expect(stats.outputDir).toBeDefined();
    });
  });
});