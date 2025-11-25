import React, { useState } from 'react';
import axios from 'axios';

interface BookSpecs {
  topic: string;
  format: string;
  writingStyle: string;
  chapterCount: number;
  wordCount: number;
  hasPreface: boolean;
  hasIntroduction: boolean;
  hasConclusion: boolean;
  hasBibliography: boolean;
  hasIndex: boolean;
  targetAudience: string;
  language: string;
  keywords?: string[];
}

interface Publisher {
  name: string;
  contact: string;
  suitable: boolean;
}

interface BookCreationResult {
  success: boolean;
  bookPath?: string;
  bookSpecs?: BookSpecs;
  publisherResults?: {
    publishers: Publisher[];
    recommended: Publisher[];
  };
  error?: string;
  message: string;
}

const BookWriter: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState('novel');
  const [useScraper, setUseScraper] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BookCreationResult | null>(null);
  const [error, setError] = useState('');

  const formats = [
    { value: 'paperback', label: 'Taschenbuch' },
    { value: 'novel', label: 'Roman' },
    { value: 'biography', label: 'Biographie' },
    { value: 'non-fiction', label: 'Fachbuch' },
    { value: 'ebook', label: 'E-Book' },
    { value: 'audiobook', label: 'Hörbuch' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://localhost:3007/api/book/create', {
        topic,
        format,
        useScraper
      });

      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler bei der Bucherstellung');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="book-writer-container">
      <h1>📚 Book Writer Agent</h1>
      <p>Erstellen Sie Bücher in verschiedenen Formaten mit KI-gestütztem Workflow</p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="topic">Thema des Buches:</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Geben Sie das Thema Ihres Buches ein..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="format">Buchformat:</label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              {formats.map((fmt) => (
                <option key={fmt.value} value={fmt.value}>
                  {fmt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={useScraper}
                onChange={(e) => setUseScraper(e.target.checked)}
              />
              Web-Scraping für Recherche verwenden
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !topic}
            className="btn btn-primary"
          >
            {isLoading ? 'Erstelle Buch...' : 'Buch erstellen'}
          </button>
        </form>
      </div>

      {error && (
        <div className="alert alert-error">
          <h3>Fehler:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="result-container">
          <div className={`alert alert-${result.success ? 'success' : 'error'}`}>
            <h3>Ergebnis:</h3>
            <p>{result.message}</p>

            {result.success && result.bookSpecs && (
              <div className="book-specs">
                <h4>Buchspezifikationen:</h4>
                <ul>
                  <li><strong>Thema:</strong> {result.bookSpecs.topic}</li>
                  <li><strong>Format:</strong> {formats.find(f => f.value === result.bookSpecs?.format)?.label}</li>
                  <li><strong>Kapitel:</strong> {result.bookSpecs.chapterCount}</li>
                  <li><strong>Wörter:</strong> {result.bookSpecs.wordCount}</li>
                  <li><strong>Schreibstil:</strong> {result.bookSpecs.writingStyle}</li>
                </ul>

                {result.bookPath && (
                  <p><strong>Gespeichert unter:</strong> {result.bookPath}</p>
                )}
              </div>
            )}

            {result.success && result.publisherResults && (
              <div className="publisher-results">
                <h4>Verlegergebnisse:</h4>
                <p>Gefundene Verleger: {result.publisherResults.publishers.length}</p>
                <p>Empfohlene Verleger: {result.publisherResults.recommended.length}</p>

                {result.publisherResults.recommended.length > 0 && (
                  <div className="recommended-publishers">
                    <h5>Empfohlene Verleger:</h5>
                    <ul>
                      {result.publisherResults.recommended.map((publisher, index) => (
                        <li key={index}>
                          <strong>{publisher.name}</strong> - {publisher.contact}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="workflow-info">
        <h3>Workflow des Book Writer Agents:</h3>
        <ol>
          <li><strong>Recherche:</strong> Sammeln von Informationen zum Thema</li>
          <li><strong>Interview:</strong> Festlegung der Buchspezifikationen</li>
          <li><strong>Schreiben:</strong> Kapitelweises Erstellen des Buches</li>
          <li><strong>Überprüfung:</strong> Qualitätssicherung und Überarbeitung</li>
          <li><strong>Verleger-Suche:</strong> Finden geeigneter Verlage</li>
          <li><strong>Vermarktung:</strong> Vorbereitung für Veröffentlichung</li>
        </ol>
      </div>
    </div>
  );
};

export default BookWriter;