#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Fact-Checking Pipeline - Verlässliche, automatisierte Prüfung aller inhaltlichen Claims
"""

import json
import logging
import uuid
import re
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import sqlite3
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ClaimType(Enum):
    """Enumeration für Claim-Typen"""
    FACT = "fact"
    STATISTIC = "statistic"
    QUOTE = "quote"
    PREDICTION = "prediction"
    LEGAL = "legal"

class ClaimStatus(Enum):
    """Enumeration für Claim-Status"""
    PENDING = "pending"
    AUTO_APPROVED = "auto-approved"
    HUMAN_REVIEW = "human-review"
    APPROVED = "approved"
    REJECTED = "rejected"
    CORRECTED = "corrected"

@dataclass
class Claim:
    """Claim-Struktur"""
    id: str
    script_id: str
    claim_text: str
    claim_type: ClaimType
    extracted_at: str
    nlp_confidence: float
    status: ClaimStatus
    verdict_at: Optional[str] = None

@dataclass
class Evidence:
    """Evidence-Struktur"""
    id: str
    claim_id: str
    source_url: str
    source_type: str
    fetch_timestamp: str
    snapshot_path: Optional[str] = None
    evidence_score: float = 0.0

@dataclass
class Review:
    """Review-Struktur"""
    id: str
    claim_id: str
    reviewer_id: Optional[str] = None
    action: Optional[str] = None
    action_notes: Optional[str] = None
    created_at: str = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

@dataclass
class Correction:
    """Correction-Struktur"""
    id: str
    video_id: str
    original_claim_id: str
    correction_text: str
    correction_posted_at: str = None

    def __post_init__(self):
        if self.correction_posted_at is None:
            self.correction_posted_at = datetime.now().isoformat()

class FactCheckingPipeline:
    """Hauptklasse für die Fact-Checking Pipeline"""
    
    def __init__(self, db_path: str = "fact_checking.db"):
        """Initialisiert die Fact-Checking Pipeline"""
        self.db_path = db_path
        self.init_database()
        
        # Risk keywords that trigger human review
        self.risk_keywords = [
            "wahl", "wahlkampf", "abstimmung", "stimme", "partei",
            "medizin", "krankheit", "diagnose", "therapie",
            "gewalt", "terror", "waffe", "angriff",
            "leak", "undicht", "enthüllung"
        ]
        
        # Government and authoritative sources
        self.authoritative_sources = [
            "bundestag.de", "bundesrat.de", "bmwi.de", "bmel.de",
            "auswaertiges-amt.de", "bmvg.de", "bmjv.de", "bmbf.de",
            "bmas.de", "bmf.de", "bundesfinanzministerium.de",
            "reuters.com", "apnews.com", "bbc.com", "tagesschau.de",
            "spiegel.de", "faz.net", "sueddeutsche.de", "welt.de",
            "arxiv.org", "nature.com", "science.org", "ieee.org",
            "factcheck.org", "correctiv.org", "fullfact.org"
        ]
    
    def init_database(self):
        """Initialisiert die Datenbank mit den benötigten Tabellen"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create claims table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS claims (
                id TEXT PRIMARY KEY,
                script_id TEXT,
                claim_text TEXT NOT NULL,
                claim_type TEXT CHECK(claim_type IN ('fact', 'statistic', 'quote', 'prediction', 'legal')),
                extracted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                nlp_confidence REAL CHECK(nlp_confidence >= 0 AND nlp_confidence <= 1),
                status TEXT CHECK(status IN ('pending', 'auto-approved', 'human-review', 'approved', 'rejected', 'corrected')) DEFAULT 'pending',
                verdict_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create evidence table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS evidence (
                id TEXT PRIMARY KEY,
                claim_id TEXT,
                source_url TEXT NOT NULL,
                source_type TEXT CHECK(source_type IN ('government', 'news', 'academic', 'fact-check', 'official_document', 'peer_reviewed')),
                fetch_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                snapshot_path TEXT,
                evidence_score REAL CHECK(evidence_score >= 0 AND evidence_score <= 100),
                FOREIGN KEY (claim_id) REFERENCES claims (id) ON DELETE CASCADE
            )
        """)
        
        # Create reviews table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id TEXT PRIMARY KEY,
                claim_id TEXT,
                reviewer_id TEXT,
                action TEXT CHECK(action IN ('approve', 'edit', 'reject')),
                action_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (claim_id) REFERENCES claims (id) ON DELETE CASCADE
            )
        """)
        
        # Create corrections table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS corrections (
                id TEXT PRIMARY KEY,
                video_id TEXT,
                original_claim_id TEXT,
                correction_text TEXT,
                correction_posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (original_claim_id) REFERENCES claims (id)
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("Datenbank erfolgreich initialisiert")
    
    def extract_claims(self, script_text: str, script_id: str) -> List[Claim]:
        """
        Extrahiert Claims aus einem Script-Text
        
        Args:
            script_text: Der Text des Scripts
            script_id: Die ID des Scripts
            
        Returns:
            Liste von Claim-Objekten
        """
        logger.info(f"Extrahiere Claims aus Script {script_id}")
        
        # Simple claim extraction based on sentence boundaries and keywords
        sentences = re.split(r'[.!?\n]+', script_text)
        claims = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) < 10:  # Skip very short sentences
                continue
                
            # Determine claim type based on content
            claim_type = self._determine_claim_type(sentence)
            
            # Only create claims for factual statements
            if claim_type in [ClaimType.FACT, ClaimType.STATISTIC, ClaimType.LEGAL]:
                claim = Claim(
                    id=str(uuid.uuid4()),
                    script_id=script_id,
                    claim_text=sentence,
                    claim_type=claim_type,
                    extracted_at=datetime.now().isoformat(),
                    nlp_confidence=0.8,  # Placeholder confidence
                    status=ClaimStatus.PENDING
                )
                claims.append(claim)
        
        # Save claims to database
        self._save_claims(claims)
        logger.info(f"{len(claims)} Claims extrahiert und gespeichert")
        return claims
    
    def _determine_claim_type(self, text: str) -> ClaimType:
        """Bestimmt den Typ eines Claims basierend auf dem Text"""
        text_lower = text.lower()
        
        # Check for statistics (numbers, percentages, etc.)
        if re.search(r'\d+(?:\.\d+)?\s*(?:prozent|%|millionen|mio|milliarden|mrds|euro|€|\$)', text_lower):
            return ClaimType.STATISTIC
        
        # Check for legal terms
        legal_terms = ["gesetz", "verordnung", "richtlinie", "verfassung", "recht", "paragraph"]
        if any(term in text_lower for term in legal_terms):
            return ClaimType.LEGAL
        
        # Check for quotes (quotation marks)
        if re.search(r'["„“»«]', text):
            return ClaimType.QUOTE
        
        # Check for predictions (future tense, modal verbs)
        prediction_terms = ["wird", "werden", "könnte", "könnten", "dürfte", "dürften"]
        if any(term in text_lower for term in prediction_terms):
            return ClaimType.PREDICTION
        
        # Default to fact
        return ClaimType.FACT
    
    def run_auto_checks(self, claims: List[Claim]) -> List[Claim]:
        """
        Führt automatische Checks für alle Claims durch
        
        Args:
            claims: Liste von Claims
            
        Returns:
            Aktualisierte Liste von Claims
        """
        logger.info("Führe automatische Checks durch")
        
        updated_claims = []
        for claim in claims:
            # Run all auto-checks in parallel
            source_match_score = self._check_source_matching(claim)
            claim_type_heuristics_score = self._apply_claim_type_heuristics(claim)
            consistency_score = self._check_cross_source_consistency(claim)
            temporal_score = self._check_temporal_plausibility(claim)
            hedging_score = self._check_language_for_hedging(claim)
            toxicity_score = self._check_for_toxicity_or_defamation(claim)
            
            # Calculate overall evidence score
            evidence_score = (
                source_match_score * 0.4 +
                claim_type_heuristics_score * 0.25 +
                consistency_score * 0.15 +
                temporal_score * 0.1 +
                hedging_score * 0.05 +
                toxicity_score * 0.05
            )
            
            # Determine if human review is needed
            if evidence_score >= 80:
                claim.status = ClaimStatus.AUTO_APPROVED
            elif evidence_score >= 50:
                claim.status = ClaimStatus.HUMAN_REVIEW
            else:
                claim.status = ClaimStatus.HUMAN_REVIEW
            
            # If toxicity is detected, always require human review
            if toxicity_score > 0.5:
                claim.status = ClaimStatus.HUMAN_REVIEW
            
            # If risk keywords are found, always require human review
            if any(keyword in claim.claim_text.lower() for keyword in self.risk_keywords):
                claim.status = ClaimStatus.HUMAN_REVIEW
            
            updated_claims.append(claim)
        
        # Update claims in database
        self._update_claims(updated_claims)
        logger.info("Automatische Checks abgeschlossen")
        return updated_claims
    
    def _check_source_matching(self, claim: Claim) -> float:
        """Prüft, ob der Claim mit autoritativen Quellen übereinstimmt"""
        # In a real implementation, this would search indexed internal sources
        # For now, we'll simulate based on claim content
        claim_text_lower = claim.claim_text.lower()
        
        # Check if claim contains references to authoritative sources
        for source in self.authoritative_sources:
            if source in claim_text_lower:
                return 90.0  # High score for authoritative source reference
        
        return 30.0  # Low score if no authoritative source found
    
    def _apply_claim_type_heuristics(self, claim: Claim) -> float:
        """Wendet Heuristiken basierend auf dem Claim-Typ an"""
        if claim.claim_type == ClaimType.STATISTIC:
            # Check if statistical claim contains numbers
            if re.search(r'\d+', claim.claim_text):
                return 85.0
        elif claim.claim_type == ClaimType.LEGAL:
            # Check if legal claim contains legal terms
            legal_terms = ["gesetz", "verordnung", "richtlinie", "paragraph"]
            if any(term in claim.claim_text.lower() for term in legal_terms):
                return 80.0
        elif claim.claim_type == ClaimType.QUOTE:
            # Check if quote claim contains quotation marks
            if re.search(r'["„“»«]', claim.claim_text):
                return 75.0
        
        return 50.0  # Neutral score
    
    def _check_cross_source_consistency(self, claim: Claim) -> float:
        """Prüft die Konsistenz des Claims über verschiedene Quellen"""
        # In a real implementation, this would compare the claim across top N sources
        # For now, we'll simulate a consistency check
        return 70.0  # Simulated consistency score
    
    def _check_temporal_plausibility(self, claim: Claim) -> float:
        """Prüft die zeitliche Plausibilität des Claims"""
        # In a real implementation, this would check if the claim asserts events
        # in the future or contradicts timestamps
        return 80.0  # Simulated temporal plausibility score
    
    def _check_language_for_hedging(self, claim: Claim) -> float:
        """Prüft die Sprache auf Abschwächung (hedging)"""
        hedging_terms = ["könnte", "könnten", "dürfte", "dürften", "vielleicht", "möglicherweise"]
        if any(term in claim.claim_text.lower() for term in hedging_terms):
            return 60.0  # Lower score for hedged claims
        return 90.0  # Higher score for definitive claims
    
    def _check_for_toxicity_or_defamation(self, claim: Claim) -> float:
        """Prüft auf Toxizität oder Verleumdung"""
        # In a real implementation, this would use a lightweight classifier
        # For now, we'll check for potentially problematic terms
        toxic_terms = ["lügen", "betrug", "korruption", "skandal", "skandalös"]
        if any(term in claim.claim_text.lower() for term in toxic_terms):
            return 95.0  # High score indicates potential toxicity
        return 10.0  # Low score indicates no toxicity detected
    
    def fetch_evidence(self, claims: List[Claim]) -> List[Evidence]:
        """
        Ruft Beweise für Claims ab
        
        Args:
            claims: Liste von Claims, für die Beweise gesammelt werden sollen
            
        Returns:
            Liste von Evidence-Objekten
        """
        logger.info("Sammle Beweise für Claims")
        
        evidences = []
        for claim in claims:
            # In a real implementation, this would query news APIs, official sites, etc.
            # For now, we'll create simulated evidence
            
            # Create evidence for each claim
            evidence = Evidence(
                id=str(uuid.uuid4()),
                claim_id=claim.id,
                source_url=f"https://example.com/evidence/{uuid.uuid4()}",
                source_type="news",
                fetch_timestamp=datetime.now().isoformat(),
                evidence_score=75.0  # Simulated evidence score
            )
            evidences.append(evidence)
        
        # Save evidence to database
        self._save_evidence(evidences)
        logger.info(f"{len(evidences)} Beweise gesammelt und gespeichert")
        return evidences
    
    def rank_evidence(self, evidences: List[Evidence]) -> List[Evidence]:
        """
        Bewertet Beweise nach Autorität
        
        Args:
            evidences: Liste von Evidence-Objekten
            
        Returns:
            Sortierte Liste von Evidence-Objekten
        """
        logger.info("Bewerte Beweise nach Autorität")
        
        # In a real implementation, this would rank evidence based on:
        # 1. Source authority (gov, major outlet, peer-reviewed) - 40%
        # 2. Directness (primary vs secondary) - 25%
        # 3. Recency relevant to claim - 15%
        # 4. Consensus among sources - 10%
        # 5. Extracted quote match quality - 10%
        
        # For now, we'll sort by evidence score
        ranked_evidences = sorted(evidences, key=lambda e: e.evidence_score, reverse=True)
        logger.info("Beweise bewertet")
        return ranked_evidences
    
    def run_verdict_engine(self, claims: List[Claim], evidences: List[Evidence]) -> List[Claim]:
        """
        Führt die Verdict Engine aus
        
        Args:
            claims: Liste von Claims
            evidences: Liste von Evidence-Objekten
            
        Returns:
            Aktualisierte Liste von Claims mit Verdicts
        """
        logger.info("Führe Verdict Engine aus")
        
        # Create evidence mapping for easier lookup
        evidence_map = {}
        for evidence in evidences:
            if evidence.claim_id not in evidence_map:
                evidence_map[evidence.claim_id] = []
            evidence_map[evidence.claim_id].append(evidence)
        
        updated_claims = []
        for claim in claims:
            # Get evidence for this claim
            claim_evidences = evidence_map.get(claim.id, [])
            
            # Calculate average evidence score
            if claim_evidences:
                avg_evidence_score = sum(e.evidence_score for e in claim_evidences) / len(claim_evidences)
            else:
                avg_evidence_score = 0.0
            
            # Apply rules-based verdict logic
            if avg_evidence_score >= 80:
                claim.status = ClaimStatus.AUTO_APPROVED
            elif 50 <= avg_evidence_score < 80:
                claim.status = ClaimStatus.HUMAN_REVIEW
            else:
                claim.status = ClaimStatus.HUMAN_REVIEW
            
            # Update verdict timestamp
            claim.verdict_at = datetime.now().isoformat()
            updated_claims.append(claim)
        
        # Update claims in database
        self._update_claims(updated_claims)
        logger.info("Verdict Engine abgeschlossen")
        return updated_claims
    
    def get_pending_human_reviews(self) -> List[Claim]:
        """
        Ruft Claims ab, die menschliche Überprüfung benötigen
        
        Returns:
            Liste von Claims, die menschliche Überprüfung benötigen
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, script_id, claim_text, claim_type, extracted_at, 
                   nlp_confidence, status, verdict_at
            FROM claims 
            WHERE status = 'human-review'
        """)
        
        rows = cursor.fetchall()
        conn.close()
        
        claims = []
        for row in rows:
            claim = Claim(
                id=row[0],
                script_id=row[1],
                claim_text=row[2],
                claim_type=ClaimType(row[3]),
                extracted_at=row[4],
                nlp_confidence=row[5],
                status=ClaimStatus(row[6]),
                verdict_at=row[7]
            )
            claims.append(claim)
        
        return claims
    
    def submit_human_review(self, claim_id: str, reviewer_id: str, action: str, action_notes: str = None) -> bool:
        """
        Speichert das Ergebnis einer menschlichen Überprüfung
        
        Args:
            claim_id: ID des Claims
            reviewer_id: ID des Reviewers
            action: Aktion ('approve', 'edit', 'reject')
            action_notes: Optionale Notizen
            
        Returns:
            True, wenn erfolgreich, sonst False
        """
        # Create review record
        review = Review(
            id=str(uuid.uuid4()),
            claim_id=claim_id,
            reviewer_id=reviewer_id,
            action=action,
            action_notes=action_notes
        )
        
        # Save review to database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO reviews (id, claim_id, reviewer_id, action, action_notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (review.id, review.claim_id, review.reviewer_id, review.action, review.action_notes, review.created_at))
        
        # Update claim status
        new_status = None
        if action == 'approve':
            new_status = 'approved'
        elif action == 'edit':
            new_status = 'corrected'
        elif action == 'reject':
            new_status = 'rejected'
        
        if new_status:
            cursor.execute("""
                UPDATE claims 
                SET status = ?, verdict_at = ?
                WHERE id = ?
            """, (new_status, datetime.now().isoformat(), claim_id))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Human review für Claim {claim_id} gespeichert: {action}")
        return True
    
    def generate_quick_fixes(self, claim: Claim) -> Dict[str, Any]:
        """
        Generiert automatisierte Vorschläge zur Korrektur
        
        Args:
            claim: Der Claim, für den Korrekturvorschläge generiert werden sollen
            
        Returns:
            Dictionary mit Korrekturvorschlägen
        """
        fixes = {}
        
        # If claim is speculative, suggest hedged rewording
        if claim.claim_type == ClaimType.PREDICTION:
            fixes['rewording'] = f"Laut Experten {claim.claim_text}"
        
        # If claim contains numbers, suggest adding source attribution
        if re.search(r'\d+', claim.claim_text):
            fixes['attribution'] = f"Laut Angaben {claim.claim_text}"
        
        # If claim is absolute, suggest conditional phrasing
        absolute_terms = ["immer", "nie", "alle", "jeder"]
        if any(term in claim.claim_text.lower() for term in absolute_terms):
            fixes['conditional'] = f"In vielen Fällen {claim.claim_text.replace('immer', 'oft')}"
        
        return fixes
    
    def _save_claims(self, claims: List[Claim]):
        """Speichert Claims in der Datenbank"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for claim in claims:
            cursor.execute("""
                INSERT OR REPLACE INTO claims 
                (id, script_id, claim_text, claim_type, extracted_at, nlp_confidence, status, verdict_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                claim.id, claim.script_id, claim.claim_text, claim.claim_type.value,
                claim.extracted_at, claim.nlp_confidence, claim.status.value, claim.verdict_at,
                datetime.now().isoformat(), datetime.now().isoformat()
            ))
        
        conn.commit()
        conn.close()
    
    def _update_claims(self, claims: List[Claim]):
        """Aktualisiert Claims in der Datenbank"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for claim in claims:
            cursor.execute("""
                UPDATE claims 
                SET claim_text = ?, claim_type = ?, nlp_confidence = ?, status = ?, verdict_at = ?, updated_at = ?
                WHERE id = ?
            """, (
                claim.claim_text, claim.claim_type.value, claim.nlp_confidence,
                claim.status.value, claim.verdict_at, datetime.now().isoformat(), claim.id
            ))
        
        conn.commit()
        conn.close()
    
    def _save_evidence(self, evidences: List[Evidence]):
        """Speichert Evidence in der Datenbank"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for evidence in evidences:
            cursor.execute("""
                INSERT OR REPLACE INTO evidence 
                (id, claim_id, source_url, source_type, fetch_timestamp, snapshot_path, evidence_score)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                evidence.id, evidence.claim_id, evidence.source_url, evidence.source_type,
                evidence.fetch_timestamp, evidence.snapshot_path, evidence.evidence_score
            ))
        
        conn.commit()
        conn.close()
    
    def get_claim_evidence(self, claim_id: str) -> List[Evidence]:
        """
        Ruft alle Evidence für einen Claim ab
        
        Args:
            claim_id: ID des Claims
            
        Returns:
            Liste von Evidence-Objekten
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, claim_id, source_url, source_type, fetch_timestamp, snapshot_path, evidence_score
            FROM evidence 
            WHERE claim_id = ?
        """, (claim_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        evidences = []
        for row in rows:
            evidence = Evidence(
                id=row[0],
                claim_id=row[1],
                source_url=row[2],
                source_type=row[3],
                fetch_timestamp=row[4],
                snapshot_path=row[5],
                evidence_score=row[6]
            )
            evidences.append(evidence)
        
        return evidences

def main():
    """Hauptfunktion zum Testen der Fact-Checking Pipeline"""
    print("🔍 Fact-Checking Pipeline - Automatisierte Prüfung von Claims")
    print("=" * 60)
    
    # Initialisiere Pipeline
    pipeline = FactCheckingPipeline()
    
    # Beispiel-Script-Text für Tests
    sample_script = """
    Die Ampelregierung plant umfassende Reformen im Gesundheitssystem mit Fokus auf Pflegekräfte, Digitalisierung und Wettbewerb.
    Laut einer Studie des Instituts für Gesundheitsforschung werden 40% der Pflegekräfte in Deutschland überlastet.
    Die Grünen setzen auf den Ausbau der Telemedizin und die Digitalisierung der Versorgung.
    Experten prognostizieren, dass bis 2030 200.000 neue Pflegekräfte benötigt werden.
    Die SPD will mehr Pflegekräfte durch bessere Arbeitsbedingungen und höhere Gehälter gewinnen.
    """
    
    # 1. Extrahiere Claims
    print("\n📝 Schritt 1: Extrahiere Claims aus dem Script...")
    claims = pipeline.extract_claims(sample_script, "test_script_001")
    
    print(f"✅ {len(claims)} Claims extrahiert:")
    for i, claim in enumerate(claims, 1):
        print(f"   {i}. [{claim.claim_type.value}] {claim.claim_text[:100]}...")
    
    # 2. Führe automatische Checks durch
    print("\n⚡ Schritt 2: Führe automatische Checks durch...")
    checked_claims = pipeline.run_auto_checks(claims)
    
    auto_approved = [c for c in checked_claims if c.status == ClaimStatus.AUTO_APPROVED]
    human_review = [c for c in checked_claims if c.status == ClaimStatus.HUMAN_REVIEW]
    
    print(f"✅ {len(auto_approved)} Claims automatisch genehmigt")
    print(f"⚠️  {len(human_review)} Claims benötigen menschliche Überprüfung")
    
    # 3. Sammle Beweise
    print("\n📚 Schritt 3: Sammle Beweise für Claims...")
    evidences = pipeline.fetch_evidence(checked_claims)
    print(f"✅ {len(evidences)} Beweise gesammelt")
    
    # 4. Bewerte Beweise
    print("\n⚖️  Schritt 4: Bewerte Beweise nach Autorität...")
    ranked_evidences = pipeline.rank_evidence(evidences)
    print("✅ Beweise bewertet")
    
    # 5. Führe Verdict Engine aus
    print("\n🧠 Schritt 5: Führe Verdict Engine aus...")
    final_claims = pipeline.run_verdict_engine(checked_claims, ranked_evidences)
    print("✅ Verdict Engine abgeschlossen")
    
    # 6. Zeige Ergebnisse
    approved = [c for c in final_claims if c.status == ClaimStatus.APPROVED or c.status == ClaimStatus.AUTO_APPROVED]
    review = [c for c in final_claims if c.status == ClaimStatus.HUMAN_REVIEW]
    rejected = [c for c in final_claims if c.status == ClaimStatus.REJECTED]
    
    print("\n📊 Ergebnisübersicht:")
    print(f"   Genehmigt: {len(approved)}")
    print(f"   Überprüfung erforderlich: {len(review)}")
    print(f"   Abgelehnt: {len(rejected)}")
    
    if review:
        print("\n📋 Claims, die menschliche Überprüfung benötigen:")
        for claim in review:
            print(f"   - [{claim.claim_type.value}] {claim.claim_text[:80]}...")
    
    print("\n✅ Fact-Checking Pipeline erfolgreich ausgeführt!")

if __name__ == "__main__":
    main()