const fs = require('fs');
const path = require('path');
const officegen = require('officegen');
const puppeteer = require('puppeteer');

class DocumentExportService {
  constructor(options = {}) {
    // Allow customization of export directory
    this.exportDir = options.exportDir || path.join(__dirname, 'exports');
    this.ensureExportDir();
  }

  ensureExportDir() {
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  /**
   * Export analysis results to Word document
   * @param {object} analysisData - Analysis results
   * @param {object} options - Export options
   * @returns {Promise<object>} - Export result
   */
  async exportToWord(analysisData, options = {}) {
    try {
      console.log('📄 Generating Word document...');

      const filename = options.filename || `analyse_${Date.now()}.docx`;
      const filePath = path.join(this.exportDir, filename);

      // Create Word document
      const docx = officegen('docx');

      // Document properties
      docx.setDocTitle(options.title || 'Text-Analyse Ergebnis');
      docx.setDocSubject('Automatische Text-Analyse');
      docx.setDocKeywords('Text-Analyse, KI, Hauptpunkte');

      // Add content to document
      this.addWordContent(docx, analysisData, options);

      // Save document
      await this.saveWordDocument(docx, filePath);

      return {
        success: true,
        filename,
        path: filePath,
        size: fs.statSync(filePath).size,
        format: 'docx',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Word export failed:', error);
      throw new Error(`Word export failed: ${error.message}`);
    }
  }

  /**
   * Add content to Word document
   * @param {object} docx - Officegen document object
   * @param {object} data - Analysis data
   * @param {object} options - Export options
   */
  addWordContent(docx, data, options) {
    const { analysis, originalText } = data;

    // Title
    const title = docx.createP();
    title.addText(options.title || 'Text-Analyse Ergebnis', {
      font_face: 'Arial',
      font_size: 18,
      bold: true,
      color: '1f4e79'
    });

    // Metadata section
    const metaP = docx.createP();
    metaP.addText('Analyse-Details', { font_size: 14, bold: true });
    metaP.addLineBreak();
    metaP.addText(`Erstellt am: ${new Date().toLocaleString('de-DE')}`);
    metaP.addLineBreak();
    metaP.addText(`Wortanzahl: ${originalText?.wordCount || 'Unbekannt'}`);
    metaP.addLineBreak();
    metaP.addText(`Lesezeit: ${originalText?.estimatedReadingTime || 'Unbekannt'} Minuten`);

    docx.createP().addText(''); // Empty line

    // Summary section
    if (analysis.summary) {
      const summaryTitle = docx.createP();
      summaryTitle.addText('Zusammenfassung', {
        font_size: 14,
        bold: true,
        color: '1f4e79'
      });

      const summaryP = docx.createP();
      summaryP.addText(analysis.summary, { font_size: 11 });

      docx.createP().addText(''); // Empty line
    }

    // Key points section
    if (analysis.keyPoints && analysis.keyPoints.length > 0) {
      const keyPointsTitle = docx.createP();
      keyPointsTitle.addText('Hauptpunkte', {
        font_size: 14,
        bold: true,
        color: '1f4e79'
      });

      analysis.keyPoints.forEach((point, index) => {
        const pointP = docx.createP();
        pointP.addText(`${index + 1}. ${point.title}`, {
          font_size: 12,
          bold: true
        });

        if (point.description) {
          pointP.addLineBreak();
          pointP.addText(point.description, { font_size: 11 });
        }

        if (point.category) {
          pointP.addLineBreak();
          pointP.addText(`Kategorie: ${point.category}`, {
            font_size: 10,
            italic: true,
            color: '666666'
          });
        }

        if (point.importance) {
          pointP.addText(` | Wichtigkeit: ${point.importance}`, {
            font_size: 10,
            italic: true,
            color: '666666'
          });
        }

        docx.createP().addText(''); // Empty line between points
      });
    }

    // Categories section
    if (analysis.categories && Object.keys(analysis.categories).length > 0) {
      const categoriesTitle = docx.createP();
      categoriesTitle.addText('Thematische Kategorien', {
        font_size: 14,
        bold: true,
        color: '1f4e79'
      });

      Object.entries(analysis.categories).forEach(([category, points]) => {
        const catP = docx.createP();
        catP.addText(`${category}:`, { font_size: 12, bold: true });
        catP.addLineBreak();
        catP.addText(points.join(', '), { font_size: 11 });
        docx.createP().addText(''); // Empty line
      });
    }

    // Action items section
    if (analysis.actionItems && analysis.actionItems.length > 0) {
      const actionsTitle = docx.createP();
      actionsTitle.addText('Handlungsempfehlungen', {
        font_size: 14,
        bold: true,
        color: '1f4e79'
      });

      analysis.actionItems.forEach((action, index) => {
        const actionP = docx.createP();
        actionP.addText(`${index + 1}. ${action.action}`, {
          font_size: 11,
          bold: true
        });

        if (action.priority) {
          actionP.addLineBreak();
          actionP.addText(`Priorität: ${action.priority}`, {
            font_size: 10,
            italic: true
          });
        }

        if (action.timeframe) {
          actionP.addText(` | Zeitrahmen: ${action.timeframe}`, {
            font_size: 10,
            italic: true
          });
        }
      });
    }
  }

  /**
   * Save Word document to file
   * @param {object} docx - Officegen document
   * @param {string} filePath - Output file path
   * @returns {Promise<void>}
   */
  saveWordDocument(docx, filePath) {
    return new Promise((resolve, reject) => {
      const out = fs.createWriteStream(filePath);

      out.on('error', reject);
      out.on('close', () => {
        console.log('✅ Word document saved:', path.basename(filePath));
        resolve();
      });

      docx.generate(out);
    });
  }

  /**
   * Export analysis results to PDF
   * @param {object} analysisData - Analysis results
   * @param {object} options - Export options
   * @returns {Promise<object>} - Export result
   */
  async exportToPDF(analysisData, options = {}) {
    try {
      console.log('📄 Generating PDF document...');

      const filename = options.filename || `analyse_${Date.now()}.pdf`;
      const filePath = path.join(this.exportDir, filename);

      // Generate HTML content
      const htmlContent = this.generateHTMLContent(analysisData, options);

      // Create PDF with Puppeteer
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      await page.pdf({
        path: filePath,
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        printBackground: true
      });

      await browser.close();

      return {
        success: true,
        filename,
        path: filePath,
        size: fs.statSync(filePath).size,
        format: 'pdf',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ PDF export failed:', error);
      throw new Error(`PDF export failed: ${error.message}`);
    }
  }

  /**
   * Generate HTML content for PDF export
   * @param {object} data - Analysis data
   * @param {object} options - Export options
   * @returns {string} - HTML content
   */
  generateHTMLContent(data, options) {
    const { analysis, originalText } = data;
    const title = options.title || 'Text-Analyse Ergebnis';

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 20px;
            }
            h1 {
                color: #1f4e79;
                border-bottom: 2px solid #1f4e79;
                padding-bottom: 10px;
            }
            h2 {
                color: #1f4e79;
                margin-top: 30px;
                margin-bottom: 15px;
            }
            .metadata {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .key-point {
                margin-bottom: 20px;
                padding: 15px;
                border-left: 4px solid #1f4e79;
                background-color: #f8f9fa;
            }
            .key-point h3 {
                margin: 0 0 10px 0;
                color: #1f4e79;
            }
            .point-meta {
                font-size: 0.9em;
                color: #666;
                font-style: italic;
            }
            .category-section {
                margin: 20px 0;
            }
            .action-item {
                padding: 10px;
                margin: 5px 0;
                background-color: #e8f4f8;
                border-radius: 3px;
            }
            .summary {
                background-color: #fff9e6;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                border-left: 4px solid #ffc107;
            }
        </style>
    </head>
    <body>
        <h1>${title}</h1>

        <div class="metadata">
            <strong>Analyse-Details</strong><br>
            Erstellt am: ${new Date().toLocaleString('de-DE')}<br>
            Wortanzahl: ${originalText?.wordCount || 'Unbekannt'}<br>
            Lesezeit: ${originalText?.estimatedReadingTime || 'Unbekannt'} Minuten
        </div>`;

    // Summary
    if (analysis.summary) {
      html += `
        <h2>Zusammenfassung</h2>
        <div class="summary">${analysis.summary}</div>`;
    }

    // Key points
    if (analysis.keyPoints && analysis.keyPoints.length > 0) {
      html += `<h2>Hauptpunkte</h2>`;

      analysis.keyPoints.forEach((point, index) => {
        html += `
        <div class="key-point">
            <h3>${index + 1}. ${point.title}</h3>
            ${point.description ? `<p>${point.description}</p>` : ''}
            <div class="point-meta">
                ${point.category ? `Kategorie: ${point.category}` : ''}
                ${point.importance ? ` | Wichtigkeit: ${point.importance}` : ''}
            </div>
        </div>`;
      });
    }

    // Categories
    if (analysis.categories && Object.keys(analysis.categories).length > 0) {
      html += `<h2>Thematische Kategorien</h2>`;

      Object.entries(analysis.categories).forEach(([category, points]) => {
        html += `
        <div class="category-section">
            <strong>${category}:</strong><br>
            ${points.join(', ')}
        </div>`;
      });
    }

    // Action items
    if (analysis.actionItems && analysis.actionItems.length > 0) {
      html += `<h2>Handlungsempfehlungen</h2>`;

      analysis.actionItems.forEach((action, index) => {
        html += `
        <div class="action-item">
            <strong>${index + 1}. ${action.action}</strong><br>
            ${action.priority ? `Priorität: ${action.priority}` : ''}
            ${action.timeframe ? ` | Zeitrahmen: ${action.timeframe}` : ''}
        </div>`;
      });
    }

    html += `
    </body>
    </html>`;

    return html;
  }

  /**
   * Export in both formats
   * @param {object} analysisData - Analysis results
   * @param {object} options - Export options
   * @returns {Promise<object>} - Export results
   */
  async exportBoth(analysisData, options = {}) {
    try {
      const baseFilename = options.filename ?
        path.parse(options.filename).name :
        `analyse_${Date.now()}`;

      const [wordResult, pdfResult] = await Promise.all([
        this.exportToWord(analysisData, {
          ...options,
          filename: `${baseFilename}.docx`
        }),
        this.exportToPDF(analysisData, {
          ...options,
          filename: `${baseFilename}.pdf`
        })
      ]);

      return {
        success: true,
        word: wordResult,
        pdf: pdfResult,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Dual export failed:', error);
      throw error;
    }
  }

  /**
   * Get list of exported files
   * @returns {Array} - List of exported files
   */
  getExportedFiles() {
    try {
      const files = fs.readdirSync(this.exportDir);
      return files.map(filename => {
        const filepath = path.join(this.exportDir, filename);
        const stats = fs.statSync(filepath);

        return {
          filename,
          path: filepath,
          size: stats.size,
          created: stats.birthtime,
          format: path.extname(filename).toLowerCase()
        };
      });
    } catch (error) {
      console.error('❌ Failed to list exported files:', error);
      return [];
    }
  }

  /**
   * Clean up old export files
   * @param {number} maxAgeDays - Maximum age in days
   * @returns {number} - Number of deleted files
   */
  cleanupOldFiles(maxAgeDays = 7) {
    try {
      const files = this.getExportedFiles();
      const cutoffDate = new Date(Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000));
      let deletedCount = 0;

      files.forEach(file => {
        if (file.created < cutoffDate) {
          fs.unlinkSync(file.path);
          deletedCount++;
          console.log('🗑️ Deleted old export:', file.filename);
        }
      });

      return deletedCount;
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      return 0;
    }
  }
}

module.exports = DocumentExportService;