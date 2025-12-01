-- Fact Checking Pipeline Database Migration
-- Version 1.0.0

-- Tabelle für Claims
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY,
    script_id UUID REFERENCES scripts(id),
    claim_text TEXT NOT NULL,
    claim_type TEXT CHECK (claim_type IN ('fact', 'statistic', 'quote', 'prediction', 'legal')),
    extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nlp_confidence FLOAT CHECK (nlp_confidence >= 0 AND nlp_confidence <= 1),
    status TEXT CHECK (status IN ('pending', 'auto-approved', 'human-review', 'approved', 'rejected', 'corrected')) DEFAULT 'pending',
    verdict_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für Evidence
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY,
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    source_type TEXT CHECK (source_type IN ('government', 'news', 'academic', 'fact-check', 'official_document', 'peer_reviewed')),
    fetch_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    snapshot_path TEXT,
    evidence_score FLOAT CHECK (evidence_score >= 0 AND evidence_score <= 100)
);

-- Tabelle für Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY,
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    reviewer_id UUID,
    action TEXT CHECK (action IN ('approve', 'edit', 'reject')),
    action_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für Corrections
CREATE TABLE IF NOT EXISTS corrections (
    id UUID PRIMARY KEY,
    video_id UUID REFERENCES videos(id),
    original_claim_id UUID REFERENCES claims(id),
    correction_text TEXT,
    correction_posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);