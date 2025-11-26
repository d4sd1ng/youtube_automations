# @agents/document-export

Document Export Service for analysis results in Word and PDF formats.

## Installation

```bash
npm install @agents/document-export
```

## Usage

### As a Library

```javascript
const DocumentExportService = require('@agents/document-export');

const exportService = new DocumentExportService({
  exportDir: './exports'
});

// Sample analysis data
const analysisData = {
  analysis: {
    summary: 'This is a sample summary of the analysis results.',
    keyPoints: [
      {
        title: 'Key Point 1',
        description: 'Description of the first key point',
        category: 'Technical',
        importance: 'High'
      }
    ],
    categories: {
      'Technical': ['Point 1', 'Point 2'],
      'Business': ['Point 3']
    },
    actionItems: [
      {
        action: 'Implement the recommended solution',
        priority: 'High',
        timeframe: '1 month'
      }
    ]
  },
  originalText: {
    wordCount: 1250,
    estimatedReadingTime: 5
  }
};

// Export to Word
const wordResult = await exportService.exportToWord(analysisData, {
  title: 'Analysis Report',
  filename: 'analysis-report.docx'
});

console.log('Word export result:', wordResult);

// Export to PDF
const pdfResult = await exportService.exportToPDF(analysisData, {
  title: 'Analysis Report',
  filename: 'analysis-report.pdf'
});

console.log('PDF export result:', pdfResult);

// Export to both formats
const bothResult = await exportService.exportBoth(analysisData, {
  title: 'Analysis Report'
});

console.log('Both formats export result:', bothResult);

// Get exported files
const files = exportService.getExportedFiles();
console.log('Exported files:', files);

// Cleanup old files
const deletedCount = exportService.cleanupOldFiles(7);
console.log('Deleted files:', deletedCount);
```

### As a Standalone Service

```bash
npm start
```

The service will start on port 3011.

## API Endpoints

- `GET /health` - Health check
- `POST /api/export/word` - Export to Word
- `POST /api/export/pdf` - Export to PDF
- `POST /api/export/both` - Export to both formats
- `GET /api/export/files` - Get exported files
- `POST /api/export/cleanup` - Cleanup old files
- `GET /exports/*` - Serve exported files

## Configuration

The service can be configured with the following options:

- `exportDir` - Directory for storing exported files (default: 'exports')

## License

ISC