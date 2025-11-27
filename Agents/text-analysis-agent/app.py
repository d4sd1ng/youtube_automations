#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Text Analysis Service
Analyzes text and extracts key points with AI
"""

import os
import json
import asyncio
import re
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

class TextAnalysisService:
    def __init__(self):
        # For now, we'll use a mock LLM service
        # In a real implementation, this would connect to actual LLM APIs
        self.llm_service = None

        # Notification systems
        self.notification_channels = {
            "discord": os.environ.get("DISCORD_WEBHOOK", ""),
            "telegram": os.environ.get("TELEGRAM_BOT_TOKEN", ""),
            "webhook": os.environ.get("WEBHOOK_URL", ""),
            "slack": os.environ.get("SLACK_WEBHOOK", "")
        }

        self.initialize_notification_systems()

    def initialize_notification_systems(self) -> None:
        """Initialize notification systems"""
        print("🔔 Initializing notification systems...")
        self.notification_systems = {
            "discord": bool(self.notification_channels["discord"]),
            "telegram": bool(self.notification_channels["telegram"]),
            "webhook": bool(self.notification_channels["webhook"]),
            "slack": bool(self.notification_channels["slack"])
        }
        print("✅ Notification systems initialized")

    async def send_notification(self, message: str, level: str = "info") -> None:
        """Send notification"""
        # In a real implementation, this would send notifications through various channels
        print(f"[{level.upper()}] {message}")

        # Discord notification
        if self.notification_systems["discord"] and self.notification_channels["discord"]:
            print(f"📤 Discord notification: {message}")

        # Telegram notification
        if self.notification_systems["telegram"] and self.notification_channels["telegram"]:
            print(f"📤 Telegram notification: {message}")

        # Webhook notification
        if self.notification_systems["webhook"] and self.notification_channels["webhook"]:
            print(f"📤 Webhook notification: {message}")

        # Slack notification
        if self.notification_systems["slack"] and self.notification_channels["slack"]:
            print(f"📤 Slack notification: {message}")

    async def analyze_text(self, text: str, options: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Analyze text and extract key points with AI
        """
        try:
            print("🔍 Starting text analysis...")

            # Send notification about analysis start
            await self.send_notification(f"Starting text analysis ({len(text)} characters)", "info")

            # Validate input
            if not text or len(text.strip()) < 10:
                raise Exception("Text too short for meaningful analysis")

            # Prepare analysis parameters
            analysis_type = options.get("type", "comprehensive")
            language = options.get("language", "de")
            max_key_points = options.get("maxKeyPoints", 8)

            # Generate analysis prompt
            prompt = self.build_analysis_prompt(text, {
                "type": analysis_type,
                "language": language,
                "maxKeyPoints": max_key_points,
                "includeStructure": options.get("includeStructure", True),
                "includeSummary": options.get("includeSummary", True),
                "includeActionItems": options.get("includeActionItems", False),
                "includeSentiment": options.get("includeSentiment", False),
                "includeEntities": options.get("includeEntities", False)
            })

            # Get AI analysis (mock implementation)
            ai_response = await self.mock_llm_generate_content(
                "Text Analysis",
                "analysis",
                {"prompt": prompt}
            )

            # Parse and structure the response
            analysis = self.parse_analysis_response(ai_response["content"])

            # Send notification about successful completion
            await self.send_notification(f"Text analysis completed - {len(analysis['keyPoints'])} key points extracted", "success")

            return {
                "success": True,
                "originalText": {
                    "length": len(text),
                    "wordCount": self.count_words(text),
                    "estimatedReadingTime": self.calculate_reading_time(text)
                },
                "analysis": {
                    **analysis,
                    "confidence": ai_response.get("confidence", 0.85),
                    "provider": ai_response.get("provider", "mock"),
                    "model": ai_response.get("model", "development")
                },
                "metadata": {
                    "analysisType": analysis_type,
                    "language": language,
                    "timestamp": datetime.now().isoformat(),
                    "processingTime": datetime.now().timestamp()
                }
            }

        except Exception as error:
            print(f"❌ Text analysis failed: {error}")
            await self.send_notification(f"Text analysis failed - {str(error)}", "error")
            raise Exception(f"Analysis failed: {str(error)}")

    def build_analysis_prompt(self, text: str, options: Dict[str, Any]) -> str:
        """Build AI prompt for text analysis"""
        analysis_type = options["type"]
        language = options["language"]
        max_key_points = options["maxKeyPoints"]
        include_structure = options["includeStructure"]
        include_summary = options["includeSummary"]
        include_action_items = options["includeActionItems"]
        include_sentiment = options["includeSentiment"]
        include_entities = options["includeEntities"]

        prompt = f"""Analysiere folgenden Text und extrahiere die wichtigsten Informationen:

TEXT:
\"\"\"
{text}
\"\"\"

AUFGABEN:
1. **Hauptpunkte** (max. {max_key_points}): Identifiziere die wichtigsten Kernaussagen, Themen oder Argumente
2. **Kategorisierung**: Ordne die Hauptpunkte thematischen Kategorien zu"""

        if include_summary:
            prompt += """
3. **Zusammenfassung**: Erstelle eine prägnante Zusammenfassung (2-3 Sätze)"""

        if include_structure:
            prompt += """
4. **Struktur**: Analysiere die logische Struktur und den Aufbau des Textes"""

        if include_action_items:
            prompt += """
5. **Handlungsempfehlungen**: Leite konkrete Handlungsschritte oder Empfehlungen ab"""

        if include_sentiment:
            prompt += """
6. **Stimmungsanalyse**: Analysiere die emotionale Stimmung des Textes (positiv, negativ, neutral)"""

        if include_entities:
            prompt += """
7. **Entitäten-Erkennung**: Identifiziere wichtige Personen, Orte, Organisationen und Konzepte"""

        prompt += """

ANTWORT-FORMAT (JSON):
{
  "keyPoints": [
    {
      "title": "Hauptpunkt 1",
      "description": "Detaillierte Beschreibung",
      "category": "Kategorie",
      "importance": "hoch/mittel/niedrig",
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "summary": "Kurze Zusammenfassung des gesamten Inhalts",
  "categories": {
    "kategorie1": ["punkt1", "punkt2"],
    "kategorie2": ["punkt3", "punkt4"]
  },
  "structure": {
    "type": "argumentativ/informativ/erzählend",
    "flow": "Beschreibung der logischen Struktur"
  }"""

        if include_action_items:
            prompt += """,
  "actionItems": [
    {
      "action": "Handlungsempfehlung",
      "priority": "hoch/mittel/niedrig",
      "timeframe": "sofort/kurz-/mittelfristig"
    }
  ]"""

        if include_sentiment:
            prompt += """,
  "sentiment": {
    "overall": "positiv/negativ/neutral",
    "score": 0.7,
    "explanation": "Begründung für die Stimmungseinschätzung"
  }"""

        if include_entities:
            prompt += """,
  "entities": [
    {
      "name": "Entität",
      "type": "person/location/organization/concept",
      "relevance": "hoch/mittel/niedrig"
    }
  ]"""

        prompt += """
}

Antworte nur mit gültigem JSON, ohne zusätzliche Erklärungen."""

        return prompt

    def parse_analysis_response(self, response: str) -> Dict[str, Any]:
        """Parse AI analysis response"""
        try:
            # Clean response (remove markdown formatting if present)
            clean_response = response.strip()
            if clean_response.startswith("```json"):
                clean_response = re.sub(r"```json\n?", "", clean_response)
                clean_response = re.sub(r"\n?```$", "", clean_response)

            parsed = json.loads(clean_response)

            # Validate and enhance the parsed response
            return {
                "keyPoints": self.validate_key_points(parsed.get("keyPoints", [])),
                "summary": parsed.get("summary", "Zusammenfassung nicht verfügbar"),
                "categories": parsed.get("categories", {}),
                "structure": parsed.get("structure", {"type": "unbekannt", "flow": "Struktur nicht erkannt"}),
                "actionItems": parsed.get("actionItems", []),
                "sentiment": parsed.get("sentiment", {"overall": "neutral", "score": 0.0, "explanation": "Nicht analysiert"}),
                "entities": parsed.get("entities", []),
                "insights": self.generate_insights(parsed)
            }

        except Exception as error:
            print(f"❌ Failed to parse analysis response: {error}")

            # Fallback: Extract key information manually
            return self.fallback_analysis(response)

    def validate_key_points(self, key_points: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate and enhance key points"""
        validated_points = []
        for index, point in enumerate(key_points):
            validated_points.append({
                "id": f"point_{index + 1}",
                "title": point.get("title", f"Hauptpunkt {index + 1}"),
                "description": point.get("description", ""),
                "category": point.get("category", "Allgemein"),
                "importance": point.get("importance", "mittel") if point.get("importance") in ["hoch", "mittel", "niedrig"] else "mittel",
                "keywords": point.get("keywords", []) if isinstance(point.get("keywords"), list) else [],
                "position": index + 1
            })
        return validated_points

    def generate_insights(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate additional insights from analysis"""
        key_points = analysis.get("keyPoints", [])
        categories = list(analysis.get("categories", {}).keys())
        entities = analysis.get("entities", [])
        sentiment = analysis.get("sentiment", {"overall": "neutral", "score": 0.0})

        return {
            "complexity": "hoch" if len(key_points) > 6 else "mittel" if len(key_points) > 3 else "niedrig",
            "mainCategory": categories[0] if categories else "Allgemein",
            "topicDiversity": len(categories),
            "entityCount": len(entities),
            "sentiment": sentiment["overall"],
            "sentimentScore": sentiment["score"],
            "priorityDistribution": {
                "high": len([p for p in key_points if p.get("importance") == "hoch"]),
                "medium": len([p for p in key_points if p.get("importance") == "mittel"]),
                "low": len([p for p in key_points if p.get("importance") == "niedrig"])
            }
        }

    def fallback_analysis(self, response: str) -> Dict[str, Any]:
        """Fallback analysis when JSON parsing fails"""
        # Extract key points using text patterns
        lines = [line for line in response.split("\n") if line.strip()]
        key_points = []

        for line in lines:
            if "•" in line or "-" in line or re.match(r"^\d+\.", line):
                key_points.append({
                    "id": f"point_{len(key_points) + 1}",
                    "title": f"Punkt {len(key_points) + 1}",
                    "description": re.sub(r"^[•\-\d\.]\s*", "", line).strip(),
                    "category": "Allgemein",
                    "importance": "mittel",
                    "keywords": [],
                    "position": len(key_points) + 1
                })

        return {
            "keyPoints": key_points[:8],  # Limit to 8 points
            "summary": " ".join(response.split("\n")[:3])[:200] + "...",
            "categories": {"Allgemein": [p["title"] for p in key_points]},
            "structure": {"type": "unbekannt", "flow": "Automatische Extraktion"},
            "actionItems": [],
            "sentiment": {"overall": "neutral", "score": 0.0, "explanation": "Automatische Extraktion"},
            "entities": [],
            "insights": {
                "complexity": "unbekannt",
                "mainCategory": "Allgemein",
                "topicDiversity": 1,
                "entityCount": 0,
                "sentiment": "neutral",
                "sentimentScore": 0.0,
                "priorityDistribution": {"high": 0, "medium": len(key_points), "low": 0}
            }
        }

    def count_words(self, text: str) -> int:
        """Count words in text"""
        return len([word for word in text.strip().split() if word])

    def calculate_reading_time(self, text: str) -> int:
        """Calculate estimated reading time"""
        words_per_minute = 200  # Average reading speed
        word_count = self.count_words(text)
        return max(1, round(word_count / words_per_minute))

    async def extract_keywords(self, text: str, max_keywords: int = 10) -> List[str]:
        """Extract keywords from text"""
        prompt = f"""Extrahiere die {max_keywords} wichtigsten Schlagworte aus folgendem Text:

TEXT: "{text}"

Antworte nur mit einer kommagetrennten Liste von Schlagworten, ohne Erklärungen."""

        try:
            response = await self.mock_llm_generate_content("Keywords", "analysis", {"prompt": prompt})
            keywords = [
                keyword.strip().lower()
                for keyword in response["content"].split(",")
                if len(keyword.strip()) > 2
            ][:max_keywords]

            return keywords
        except Exception as error:
            print(f"❌ Keyword extraction failed: {error}")
            return []

    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Perform sentiment analysis on text"""
        prompt = f"""Analysiere die emotionale Stimmung des folgenden Textes:

TEXT: "{text}"

ANTWORT-FORMAT (JSON):
{{
  "overall": "positiv/negativ/neutral",
  "score": 0.7,
  "explanation": "Begründung für die Stimmungseinschätzung",
  "keyEmotions": ["freude", "wut", "trauer", "angst", "überraschung", "ekel"]
}}

Antworte nur mit gültigem JSON, ohne zusätzliche Erklärungen."""

        try:
            response = await self.mock_llm_generate_content("Sentiment Analysis", "analysis", {"prompt": prompt})

            try:
                clean_response = response["content"].strip()
                if clean_response.startswith("```json"):
                    clean_response = re.sub(r"```json\n?", "", clean_response)
                    clean_response = re.sub(r"\n?```$", "", clean_response)

                return json.loads(clean_response)
            except Exception as parse_error:
                print(f"❌ Failed to parse sentiment response: {parse_error}")
                return {
                    "overall": "neutral",
                    "score": 0.0,
                    "explanation": "Analyse fehlgeschlagen",
                    "keyEmotions": []
                }
        except Exception as error:
            print(f"❌ Sentiment analysis failed: {error}")
            return {
                "overall": "neutral",
                "score": 0.0,
                "explanation": f"Analyse fehlgeschlagen: {str(error)}",
                "keyEmotions": []
            }

    async def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract entities from text"""
        prompt = f"""Identifiziere wichtige Personen, Orte, Organisationen und Konzepte im folgenden Text:

TEXT: "{text}"

ANTWORT-FORMAT (JSON):
[
  {{
    "name": "Entität",
    "type": "person/location/organization/concept",
    "relevance": "hoch/mittel/niedrig"
  }}
]

Antworte nur mit gültigem JSON, ohne zusätzliche Erklärungen."""

        try:
            response = await self.mock_llm_generate_content("Entity Recognition", "analysis", {"prompt": prompt})

            try:
                clean_response = response["content"].strip()
                if clean_response.startswith("```json"):
                    clean_response = re.sub(r"```json\n?", "", clean_response)
                    clean_response = re.sub(r"\n?```$", "", clean_response)

                return json.loads(clean_response)
            except Exception as parse_error:
                print(f"❌ Failed to parse entities response: {parse_error}")
                return []
        except Exception as error:
            print(f"❌ Entity extraction failed: {error}")
            return []

    async def mock_llm_generate_content(self, topic: str, content_type: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Mock LLM service for development"""
        # This is a mock implementation that returns sample data
        # In a real implementation, this would call actual LLM APIs

        if content_type == "analysis":
            if "Hauptpunkte" in parameters["prompt"] and "Kategorisierung" in parameters["prompt"]:
                # Text analysis response
                return {
                    "content": json.dumps({
                        "keyPoints": [
                            {
                                "title": "Zentrales Thema identifiziert",
                                "description": "Das Dokument behandelt die Hauptthemen und Konzepte des analysierten Inhalts",
                                "category": "Inhaltsanalyse",
                                "importance": "hoch",
                                "keywords": ["thema", "inhalt", "analyse"]
                            },
                            {
                                "title": "Strukturelle Elemente erkannt",
                                "description": "Die logische Struktur und der Aufbau des Textes wurden analysiert",
                                "category": "Textstruktur",
                                "importance": "mittel",
                                "keywords": ["struktur", "aufbau", "logik"]
                            }
                        ],
                        "summary": "Der Text behandelt verschiedene Aspekte der Inhaltsanalyse mit Fokus auf Schlüsselthemen und Struktur.",
                        "categories": {
                            "Inhaltsanalyse": ["Zentrales Thema identifiziert"],
                            "Textstruktur": ["Strukturelle Elemente erkannt"]
                        },
                        "structure": {
                            "type": "informativ",
                            "flow": "Logischer Aufbau von allgemein zu spezifisch"
                        }
                    }, ensure_ascii=False),
                    "provider": "mock",
                    "model": "development",
                    "confidence": 0.85,
                    "tokens": 150
                }
            elif "Schlagworte" in parameters["prompt"]:
                # Keyword extraction response
                return {
                    "content": "thema, inhalt, analyse, struktur, aufbau, logik, schlüsselthemen",
                    "provider": "mock",
                    "model": "development",
                    "confidence": 0.8,
                    "tokens": 50
                }
            elif "Stimmung" in parameters["prompt"]:
                # Sentiment analysis response
                return {
                    "content": json.dumps({
                        "overall": "neutral",
                        "score": 0.1,
                        "explanation": "Der Text ist informativ und neutral formuliert",
                        "keyEmotions": ["neugier", "konzentration"]
                    }, ensure_ascii=False),
                    "provider": "mock",
                    "model": "development",
                    "confidence": 0.75,
                    "tokens": 75
                }
            elif "Entitäten" in parameters["prompt"]:
                # Entity extraction response
                return {
                    "content": json.dumps([
                        {
                            "name": "Beispielorganisation",
                            "type": "organization",
                            "relevance": "mittel"
                        }
                    ], ensure_ascii=False),
                    "provider": "mock",
                    "model": "development",
                    "confidence": 0.7,
                    "tokens": 60
                }

        # Default mock response
        return {
            "content": "Mock response for development purposes",
            "provider": "mock",
            "model": "development",
            "confidence": 0.5,
            "tokens": 10
        }

    def get_stats(self) -> Dict[str, Any]:
        """Get analysis statistics"""
        return {
            "service": "TextAnalysisService",
            "supportedLanguages": ["de", "en"],
            "maxTextLength": 50000,
            "defaultKeyPoints": 8,
            "notificationSystems": self.notification_systems,
            "timestamp": datetime.now().isoformat()
        }


# Main execution
if __name__ == "__main__":
    service = TextAnalysisService()
    print("🎬 Text Analysis Service initialized")

    # Example usage
    example_text = "Dies ist ein Beispieltext für die Textanalyse. Der Text enthält verschiedene Themen und Konzepte, die analysiert werden sollen. Es ist wichtig, die Hauptpunkte zu identifizieren und zu kategorisieren."

    # Show stats
    stats = service.get_stats()
    print(f"📊 Supported languages: {stats['supportedLanguages']}")
    print(f"📏 Max text length: {stats['maxTextLength']} characters")