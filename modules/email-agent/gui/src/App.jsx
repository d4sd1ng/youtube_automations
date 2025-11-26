import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = '/api';

function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Zustand für die InhaltsGenerierung
  const [contentParams, setContentParams] = useState({
    topic: '',
    recipientType: 'Kunde',
    tone: 'professional',
    language: 'de',
    customInstructions: '',
    useTemplate: false,
    templateId: ''
  });

  // Zustand für den E-Mail-Versand
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    body: '',
    from: ''
  });

  // Zustand für Massen-E-Mail
  const [bulkEmailData, setBulkEmailData] = useState({
    recipients: '',
    subject: '',
    body: ''
  });

  // Zustand für Vorlagen
  const [templateData, setTemplateData] = useState({
    name: '',
    subject: '',
    body: ''
  });

  // Funktion zum Generieren von E-Mail-Inhalten
  const generateContent = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = {
        topic: contentParams.topic,
        recipientType: contentParams.recipientType,
        tone: contentParams.tone,
        language: contentParams.language,
        customInstructions: contentParams.customInstructions
      };

      // Wenn eine Vorlage verwendet werden soll
      if (contentParams.useTemplate && contentParams.templateId) {
        const templateResponse = await axios.get(`${API_BASE_URL}/templates/${contentParams.templateId}`);
        if (templateResponse.data.success) {
          params.template = templateResponse.data.template;
        }
      }

      const response = await axios.post(`${API_BASE_URL}/generate-content`, params);
      if (response.data.success) {
        setResult({
          type: 'content',
          data: response.data
        });
        // Automatisch die E-Mail-Daten aktualisieren
        setEmailData(prev => ({
          ...prev,
          subject: response.data.subject,
          body: response.data.body
        }));
      } else {
        setError(response.data.error || 'Fehler bei der Inhaltsgenerierung');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Netzwerkfehler');
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion zum Senden einer E-Mail
  const sendEmail = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/send`, emailData);
      if (response.data.success) {
        setResult({
          type: 'send',
          data: response.data
        });
      } else {
        setError(response.data.error || 'Fehler beim Senden der E-Mail');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Netzwerkfehler');
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion zum Senden von Massen-E-Mails
  const sendBulkEmail = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Empfänger in ein Array umwandeln
      const recipients = bulkEmailData.recipients
        .split('\n')
        .map(email => email.trim())
        .filter(email => email.length > 0)
        .map(email => ({ email }));

      const template = {
        subject: bulkEmailData.subject,
        body: bulkEmailData.body,
        from: emailData.from
      };

      const response = await axios.post(`${API_BASE_URL}/send-bulk`, {
        recipients,
        template
      });

      if (response.data.success) {
        setResult({
          type: 'bulk',
          data: response.data
        });
      } else {
        setError(response.data.error || 'Fehler beim Senden der Massen-E-Mail');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Netzwerkfehler');
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion zum Speichern einer Vorlage
  const saveTemplate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const template = {
        name: templateData.name,
        subject: templateData.subject,
        body: templateData.body
      };

      const response = await axios.post(`${API_BASE_URL}/templates`, template);
      if (response.data.success) {
        setResult({
          type: 'template',
          data: response.data
        });
      } else {
        setError(response.data.error || 'Fehler beim Speichern der Vorlage');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Netzwerkfehler');
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion zum Testen der SMTP-Verbindung
  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/test-connection`);
      setResult({
        type: 'connection',
        data: response.data
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Netzwerkfehler');
    } finally {
      setIsLoading(false);
    }
  };

  // Funktion für automatisierten E-Mail-Versand
  const autoSendEmail = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const trigger = {
        type: 'welcome',
        description: 'Willkommens-E-Mail für neue Benutzer'
      };

      const context = {
        user: {
          name: 'Max Mustermann',
          email: 'max@example.com'
        }
      };

      const response = await axios.post(`${API_BASE_URL}/auto-send`, {
        trigger,
        context
      });

      if (response.data.success) {
        setResult({
          type: 'auto-send',
          data: response.data
        });
      } else {
        setError(response.data.error || 'Fehler beim automatisierten E-Mail-Versand');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Netzwerkfehler');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Email Agent</h1>
        <p>KI-gestützte E-Mail-Generierung und Versand (selbständig und nach Vorgabe)</p>
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === 'generate' ? 'active' : ''}
          onClick={() => setActiveTab('generate')}
        >
          Inhalte generieren
        </button>
        <button
          className={activeTab === 'send' ? 'active' : ''}
          onClick={() => setActiveTab('send')}
        >
          E-Mail senden
        </button>
        <button
          className={activeTab === 'bulk' ? 'active' : ''}
          onClick={() => setActiveTab('bulk')}
        >
          Massenversand
        </button>
        <button
          className={activeTab === 'templates' ? 'active' : ''}
          onClick={() => setActiveTab('templates')}
        >
          Vorlagen
        </button>
        <button
          className={activeTab === 'automation' ? 'active' : ''}
          onClick={() => setActiveTab('automation')}
        >
          Automatisierung
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Einstellungen
        </button>
      </nav>

      <main className="app-main">
        {error && (
          <div className="error-message">
            Fehler: {error}
          </div>
        )}

        {result && (
          <div className="result-message">
            {result.type === 'content' && (
              <div>
                <h3>Inhalt erfolgreich generiert</h3>
                <p><strong>Betreff:</strong> {result.data.subject}</p>
                <div>
                  <strong>Nachricht:</strong>
                  <pre className="email-body-preview">{result.data.body}</pre>
                </div>
              </div>
            )}
            {result.type === 'send' && (
              <div>
                <h3>E-Mail erfolgreich gesendet</h3>
                <p>Message ID: {result.data.messageId}</p>
              </div>
            )}
            {result.type === 'bulk' && (
              <div>
                <h3>Massenversand abgeschlossen</h3>
                <p>Erfolgreich gesendet: {result.data.results.filter(r => r.success).length} von {result.data.results.length}</p>
                <details>
                  <summary>Details anzeigen</summary>
                  <ul>
                    {result.data.results.map((r, index) => (
                      <li key={index} className={r.success ? 'success' : 'error'}>
                        {r.recipient}: {r.success ? 'Erfolgreich' : r.error}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
            {result.type === 'template' && (
              <div>
                <h3>Vorlage gespeichert</h3>
                <p>Vorlagen-ID: {result.data.templateId}</p>
              </div>
            )}
            {result.type === 'connection' && (
              <div>
                <h3>Verbindungsstatus</h3>
                <p className={result.data.success ? 'success' : 'error'}>
                  {result.data.message || result.data.error}
                </p>
              </div>
            )}
            {result.type === 'auto-send' && (
              <div>
                <h3>Automatisierter Versand</h3>
                <p className={result.data.success ? 'success' : 'error'}>
                  {result.data.success ? 'E-Mail erfolgreich versendet' : result.data.error}
                </p>
                {result.data.messageId && <p>Message ID: {result.data.messageId}</p>}
              </div>
            )}
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="tab-content">
            <h2>Inhalt generieren (selbständig und nach Vorgabe)</h2>
            <div className="form-group">
              <label>Thema:</label>
              <input
                type="text"
                value={contentParams.topic}
                onChange={(e) => setContentParams({...contentParams, topic: e.target.value})}
                placeholder="z.B. Neues Produktangebot"
              />
            </div>

            <div className="form-group">
              <label>Empfänger-Typ:</label>
              <select
                value={contentParams.recipientType}
                onChange={(e) => setContentParams({...contentParams, recipientType: e.target.value})}
              >
                <option value="Kunde">Kunde</option>
                <option value="Partner">Partner</option>
                <option value="Interessent">Interessent</option>
                <option value="Mitarbeiter">Mitarbeiter</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tonfall:</label>
              <select
                value={contentParams.tone}
                onChange={(e) => setContentParams({...contentParams, tone: e.target.value})}
              >
                <option value="professional">Professionell</option>
                <option value="friendly">Freundlich</option>
                <option value="formal">Formell</option>
                <option value="casual">Leger</option>
              </select>
            </div>

            <div className="form-group">
              <label>Sprache:</label>
              <select
                value={contentParams.language}
                onChange={(e) => setContentParams({...contentParams, language: e.target.value})}
              >
                <option value="de">Deutsch</option>
                <option value="en">Englisch</option>
              </select>
            </div>

            <div className="form-group">
              <label>Vorlage verwenden:</label>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="useTemplate"
                  checked={contentParams.useTemplate}
                  onChange={(e) => setContentParams({...contentParams, useTemplate: e.target.checked})}
                />
                <label htmlFor="useTemplate">Vorlage verwenden</label>
              </div>
            </div>

            {contentParams.useTemplate && (
              <div className="form-group">
                <label>Vorlagen-ID:</label>
                <input
                  type="text"
                  value={contentParams.templateId}
                  onChange={(e) => setContentParams({...contentParams, templateId: e.target.value})}
                  placeholder="z.B. template_123456789"
                />
              </div>
            )}

            <div className="form-group">
              <label>Zusätzliche Anweisungen:</label>
              <textarea
                value={contentParams.customInstructions}
                onChange={(e) => setContentParams({...contentParams, customInstructions: e.target.value})}
                placeholder="z.B. Betonung auf Preisvorteile, Erwähnung spezifischer Funktionen, etc."
                rows="4"
              />
            </div>

            <button
              onClick={generateContent}
              disabled={isLoading || !contentParams.topic}
              className="primary-button"
            >
              {isLoading ? 'Generiere...' : 'Inhalt generieren'}
            </button>
          </div>
        )}

        {activeTab === 'send' && (
          <div className="tab-content">
            <h2>E-Mail senden</h2>
            <div className="form-group">
              <label>An:</label>
              <input
                type="email"
                value={emailData.to}
                onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                placeholder="empfaenger@example.com"
              />
            </div>

            <div className="form-group">
              <label>Von:</label>
              <input
                type="email"
                value={emailData.from}
                onChange={(e) => setEmailData({...emailData, from: e.target.value})}
                placeholder="absender@example.com"
              />
            </div>

            <div className="form-group">
              <label>Betreff:</label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                placeholder="E-Mail Betreff"
              />
            </div>

            <div className="form-group">
              <label>Nachricht:</label>
              <textarea
                value={emailData.body}
                onChange={(e) => setEmailData({...emailData, body: e.target.value})}
                placeholder="E-Mail Inhalt"
                rows="10"
              />
            </div>

            <button
              onClick={sendEmail}
              disabled={isLoading || !emailData.to || !emailData.subject || !emailData.body}
              className="primary-button"
            >
              {isLoading ? 'Sende...' : 'E-Mail senden'}
            </button>

            <button
              onClick={testConnection}
              disabled={isLoading}
              className="secondary-button"
            >
              SMTP-Verbindung testen
            </button>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="tab-content">
            <h2>Massenversand</h2>
            <div className="form-group">
              <label>Empfänger (eine E-Mail pro Zeile):</label>
              <textarea
                value={bulkEmailData.recipients}
                onChange={(e) => setBulkEmailData({...bulkEmailData, recipients: e.target.value})}
                placeholder="empfaenger1@example.com&#10;empfaenger2@example.com&#10;empfaenger3@example.com"
                rows="6"
              />
            </div>

            <div className="form-group">
              <label>Betreff:</label>
              <input
                type="text"
                value={bulkEmailData.subject}
                onChange={(e) => setBulkEmailData({...bulkEmailData, subject: e.target.value})}
                placeholder="E-Mail Betreff"
              />
            </div>

            <div className="form-group">
              <label>Nachricht:</label>
              <textarea
                value={bulkEmailData.body}
                onChange={(e) => setBulkEmailData({...bulkEmailData, body: e.target.value})}
                placeholder="E-Mail Inhalt (verwenden Sie {{name}} für Personalisierung)"
                rows="8"
              />
            </div>

            <button
              onClick={sendBulkEmail}
              disabled={isLoading || !bulkEmailData.recipients || !bulkEmailData.subject || !bulkEmailData.body}
              className="primary-button"
            >
              {isLoading ? 'Sende...' : 'Massen-E-Mails senden'}
            </button>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="tab-content">
            <h2>E-Mail Vorlagen</h2>
            <div className="form-group">
              <label>Vorlagenname:</label>
              <input
                type="text"
                value={templateData.name}
                onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                placeholder="z.B. Willkommens-E-Mail"
              />
            </div>

            <div className="form-group">
              <label>Betreff:</label>
              <input
                type="text"
                value={templateData.subject}
                onChange={(e) => setTemplateData({...templateData, subject: e.target.value})}
                placeholder="E-Mail Betreff"
              />
            </div>

            <div className="form-group">
              <label>Nachricht:</label>
              <textarea
                value={templateData.body}
                onChange={(e) => setTemplateData({...templateData, body: e.target.value})}
                placeholder="E-Mail Inhalt (verwenden Sie Platzhalter wie {{name}}, {{company}}, etc.)"
                rows="10"
              />
            </div>

            <button
              onClick={saveTemplate}
              disabled={isLoading || !templateData.name || !templateData.subject || !templateData.body}
              className="primary-button"
            >
              {isLoading ? 'Speichere...' : 'Vorlage speichern'}
            </button>
          </div>
        )}

        {activeTab === 'automation' && (
          <div className="tab-content">
            <h2>Automatisierung</h2>
            <div className="automation-info">
              <p>Der E-Mail-Agent kann automatisiert E-Mails versenden basierend auf verschiedenen Triggern:</p>
              <ul>
                <li>Willkommens-E-Mails für neue Registrierungen</li>
                <li>Bestätigungs-E-Mails für Bestellungen</li>
                <li>Erinnerungs-E-Mails für abgelaufene Abonnements</li>
                <li>Newsletter basierend auf Benutzerpräferenzen</li>
              </ul>
            </div>

            <div className="form-group">
              <label>Beispiel: Willkommens-E-Mail senden</label>
              <button
                onClick={autoSendEmail}
                disabled={isLoading}
                className="primary-button"
              >
                {isLoading ? 'Sende...' : 'Willkommens-E-Mail senden'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-content">
            <h2>Einstellungen</h2>
            <div className="settings-info">
              <p>Die SMTP-Einstellungen werden über Umgebungsvariablen konfiguriert:</p>
              <ul>
                <li>SMTP_HOST - SMTP-Server-Host</li>
                <li>SMTP_PORT - SMTP-Server-Port</li>
                <li>SMTP_SECURE - Sichere Verbindung</li>
                <li>SMTP_USER - SMTP-Benutzername</li>
                <li>SMTP_PASS - SMTP-Passwort</li>
              </ul>
              <p>Die KI-API-Einstellungen werden ebenfalls über Umgebungsvariablen konfiguriert:</p>
              <ul>
                <li>AI_API_ENDPOINT - API-Endpunkt für KI-Inhaltsgenerierung</li>
                <li>AI_API_KEY - API-Schlüssel für KI-Service</li>
              </ul>
            </div>

            <button
              onClick={testConnection}
              disabled={isLoading}
              className="secondary-button"
            >
              SMTP-Verbindung testen
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Email Agent v1.0.0 - Teil der AGENTS SaaS Plattform</p>
      </footer>
    </div>
  );
}

export default App;