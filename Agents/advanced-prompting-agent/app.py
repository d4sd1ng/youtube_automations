#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Advanced Prompting Agent
Specialized LLM prompt engineering for optimal YouTube script generation
"""

import os
import json
import uuid
import asyncio
import re
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

class AdvancedPromptingAgent:
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent.parent / "data"
        self.prompts_dir = self.base_dir / "prompt-templates"
        self.cache_dir = self.base_dir / "prompt-cache"
        self.results_dir = self.base_dir / "prompt-results"

        # Prompt template configurations
        self.prompt_templates = {
            # Content-Type specific templates
            "contentTypes": {
                "news": {
                    "systemPrompt": """Du bist ein erfahrener YouTube-News-Creator. Erstelle Scripts, die:
- Aktuelle Ereignisse präzise und fesselnd präsentieren
- Mit einem starken Hook beginnen, der die Dringlichkeit vermittelt
- Fakten strukturiert und verständlich aufbereiten
- Den Kontext und die Auswirkungen für die Zielgruppe erklären
- Mit einem klaren Call-to-Action enden""",

                    "sectionPrompts": {
                        "hook": """Erstelle einen kraftvollen 10-15 Sekunden Hook für ein News-Video über "{topic}".
Nutze diese Elemente: Dringlichkeit, Überraschung, direkte Ansprache der Zielgruppe.
Verwende emotionale Trigger und konkrete Zahlen/Fakten wenn verfügbar.
Trending Keywords: {keywords}""",

                        "main_points": """Strukturiere die Hauptpunkte zu "{topic}" für ein {length}-Video:
- 3-5 Kernpunkte in logischer Reihenfolge
- Jeder Punkt mit konkreten Fakten/Zahlen
- Verbindungen zwischen den Punkten
- Bezug zu aktuellen Trends: {keywords}
Zielgruppe: {audience}, Ton: {tone}""",

                        "context": """Erkläre den Kontext und die Bedeutung von "{topic}":
- Warum ist das jetzt wichtig?
- Welche Auswirkungen hat das auf {audience}?
- Historischer oder vergleichender Kontext
- Zukünftige Entwicklungen/Prognosen
Länge: {length}, Ton: {tone}"""
                    }
                },

                "tutorial": {
                    "systemPrompt": """Du bist ein Experte für Tutorial-Content. Erstelle Scripts, die:
- Komplexe Prozesse in einfache Schritte unterteilen
- Mit dem Problem/Bedürfnis der Zielgruppe beginnen
- Schritt-für-Schritt-Anleitungen mit klaren Erklärungen
- Häufige Fehler und deren Vermeidung ansprechen
- Praktische Beispiele und Anwendungen zeigen""",

                    "sectionPrompts": {
                        "hook": """Erstelle einen Problem-fokusierten Hook für ein Tutorial zu "{topic}":
- Identifiziere das Haupt-Problem/Bedürfnis
- Verspreche eine konkrete Lösung
- Erwähne den Zeitrahmen oder Schwierigkeitsgrad
- Nutze "Du wirst lernen..." oder "Nach diesem Video kannst du..."
Keywords: {keywords}""",

                        "solution_steps": """Entwickle eine klare Schritt-für-Schritt-Anleitung für "{topic}":
- 3-7 Hauptschritte je nach Videolänge ({length})
- Jeder Schritt mit konkreten Aktionen
- Erwähne benötigte Tools/Materialien
- Weise auf häufige Fehler hin
- Baue Erfolgskontrolle ein
Zielgruppe: {audience}, Stil: {tone}"""
                    }
                },

                "review": {
                    "systemPrompt": """Du bist ein objektiver Reviewer mit Expertise. Erstelle Scripts, die:
- Ausgewogene und faire Bewertungen liefern
- Kriterien und Bewertungsmaßstäbe transparent machen
- Vor- und Nachteile ehrlich darstellen
- Vergleiche mit Alternativen ziehen
- Klare Empfehlungen für verschiedene Nutzertypen geben""",

                    "sectionPrompts": {
                        "overview": """Erstelle eine objektive Übersicht zu "{topic}":
- Was wird genau bewertet?
- Welche Kriterien sind wichtig?
- Kurze Einordnung in den Markt/Kontext
- Erwartungen der Zielgruppe: {audience}
Länge: {length}, Keywords: {keywords}""",

                        "pros_cons": """Analysiere Pro und Contra von "{topic}":
- 3-5 klare Vorteile mit Begründung
- 3-5 ehrliche Nachteile/Schwächen
- Gewichtung nach Relevanz für {audience}
- Konkrete Beispiele und Situationen
Ton: {tone}, Trending: {keywords}"""
                    }
                },

                "entertainment": {
                    "systemPrompt": """Du bist ein charismatischer Entertainment-Creator. Erstelle Scripts, die:
- Von der ersten Sekunde an fesseln und unterhalten
- Persönlichkeit und Authentizität ausstrahlen
- Geschichten und emotionale Momente einbauen
- Interaktion mit der Community fördern
- Überraschungsmomente und Wendungen enthalten""",

                    "sectionPrompts": {
                        "story": """Entwickle eine fesselnde Story zu "{topic}":
- Persönlicher Bezug oder interessante Anekdote
- Dramatische Struktur mit Höhepunkten
- Emotionale Verbindung zur Zielgruppe: {audience}
- Überraschende Wendungen oder Erkenntnisse
Länge: {length}, Stil: {tone}, Keywords: {keywords}""",

                        "personal_touch": """Füge persönliche Elemente zu "{topic}" hinzu:
- Eigene Erfahrungen oder Meinungen
- Verbindung zur Community
- Authentische Reaktionen/Emotionen
- "Behind the scenes" Einblicke
Zielgruppe: {audience}, Trending: {keywords}"""
                    }
                },

                "explanation": {
                    "systemPrompt": """Du bist ein Bildungsexperte für komplexe Themen. Erstelle Scripts, die:
- Schwierige Konzepte verständlich erklären
- Vom Bekannten zum Unbekannten führen
- Analogien und Beispiele nutzen
- Schritt für Schritt aufbauen
- Verständnis durch Wiederholung festigen""",

                    "sectionPrompts": {
                        "concept": """Erkläre das Grundkonzept von "{topic}" verständlich:
- Beginne mit einer einfachen Definition
- Nutze Analogien aus dem Alltag
- Erkläre "Warum ist das wichtig?"
- Baue von einfach zu komplex auf
Zielgruppe: {audience}, Länge: {length}""",

                        "breakdown": """Zerlege "{topic}" in verstehbare Teile:
- 3-5 Hauptkomponenten identifizieren
- Jede Komponente einzeln erklären
- Verbindungen zwischen den Teilen zeigen
- Konkrete Beispiele für jede Komponente
Stil: {tone}, Keywords: {keywords}"""
                    }
                }
            },

            # Length-specific optimization strategies
            "lengthStrategies": {
                "30s": {
                    "approach": "ultra_compressed",
                    "maxConcepts": 1,
                    "promptModifier": """ULTRA-KURZ (30 Sekunden):
- NUR das wichtigste Konzept
- Direkter, knackiger Stil
- Keine Umschweife
- Maximal 75 Wörter
- Jedes Wort muss zählen""",
                    "structure": ["hook", "key_message", "cta"]
                },

                "1min": {
                    "approach": "compressed",
                    "maxConcepts": 2,
                    "promptModifier": """KURZ (1 Minute):
- 1-2 Hauptpunkte maximal
- Schneller Einstieg
- Kompakte Erklärungen
- 130-150 Wörter
- Fokus auf das Wesentliche""",
                    "structure": ["hook", "main_point", "conclusion"]
                },

                "5min": {
                    "approach": "standard",
                    "maxConcepts": 4,
                    "promptModifier": """STANDARD (5 Minuten):
- 3-4 Hauptpunkte ausführlich
- Beispiele und Erklärungen
- Strukturierter Aufbau
- 650-750 Wörter
- Ausgewogene Tiefe""",
                    "structure": ["hook", "intro", "main_points", "examples", "conclusion"]
                },

                "10min": {
                    "approach": "comprehensive",
                    "maxConcepts": 6,
                    "promptModifier": """AUSFÜHRLICH (10 Minuten):
- 5-6 detaillierte Punkte
- Tiefgehende Analysen
- Mehrere Beispiele
- 1300-1500 Wörter
- Umfassende Behandlung""",
                    "structure": ["hook", "intro", "context", "main_points", "examples", "implications", "conclusion"]
                },

                "15min": {
                    "approach": "deep_dive",
                    "maxConcepts": 8,
                    "promptModifier": """DEEP DIVE (15 Minuten):
- 7-8 umfassende Aspekte
- Expertenebene Detail
- Kritische Analyse
- 2000-2300 Wörter
- Vollständige Exploration""",
                    "structure": ["hook", "intro", "background", "main_analysis", "case_studies", "implications", "future_outlook", "conclusion"]
                }
            },

            # Tone-specific modifiers
            "toneModifiers": {
                "informativ": {
                    "style": "professional_neutral",
                    "languageLevel": "formal_accessible",
                    "promptAddition": """Ton INFORMATIV:
- Sachlich und professionell
- Klare, präzise Sprache
- Fakten im Vordergrund
- Neutrale Perspektive
- Bildungsfokus""",
                    "vocabulary": "precise, factual, educational",
                    "emotionalLevel": "calm, authoritative"
                },

                "unterhaltsam": {
                    "style": "engaging_casual",
                    "languageLevel": "conversational",
                    "promptAddition": """Ton UNTERHALTSAM:
- Locker und zugänglich
- Humor und Persönlichkeit
- Geschichten und Anekdoten
- Direkte Ansprache
- Emotionale Verbindung""",
                    "vocabulary": "vivid, relatable, expressive",
                    "emotionalLevel": "enthusiastic, warm"
                },

                "educational": {
                    "style": "structured_teaching",
                    "languageLevel": "clear_methodical",
                    "promptAddition": """Ton EDUCATIONAL:
- Lehrreich und strukturiert
- Schritt-für-Schritt Aufbau
- Verständnis-orientiert
- Wiederholung wichtiger Punkte
- Lernziel-fokussiert""",
                    "vocabulary": "explanatory, systematic, supportive",
                    "emotionalLevel": "encouraging, patient"
                },

                "überzeugend": {
                    "style": "persuasive_confident",
                    "languageLevel": "compelling_direct",
                    "promptAddition": """Ton ÜBERZEUGEND:
- Kraftvoll und motivierend
- Klare Standpunkte
- Logische Argumente
- Emotionale Appelle
- Handlungsaufforderung""",
                    "vocabulary": "powerful, convincing, decisive",
                    "emotionalLevel": "passionate, confident"
                },

                "persönlich": {
                    "style": "authentic_intimate",
                    "languageLevel": "personal_relatable",
                    "promptAddition": """Ton PERSÖNLICH:
- Authentisch und nahbar
- Persönliche Erfahrungen
- Emotionale Offenheit
- Community-Verbindung
- Vertrauensaufbau""",
                    "vocabulary": "intimate, genuine, heartfelt",
                    "emotionalLevel": "vulnerable, connecting"
                }
            }
        }

        # Token efficiency settings
        self.token_optimization = {
            "maxPromptTokens": 1500,
            "maxResponseTokens": 2000,
            "compressionStrategies": {
                "aggressive": 0.6,
                "moderate": 0.8,
                "light": 0.9
            }
        }

        self.ensure_directories()
        self.initialize_prompt_templates()

    def ensure_directories(self) -> None:
        """Ensure required directories exist"""
        dirs = [self.prompts_dir, self.cache_dir, self.results_dir]
        for directory in dirs:
            directory.mkdir(parents=True, exist_ok=True)

    def initialize_prompt_templates(self) -> None:
        """Initialize default prompt templates"""
        default_prompts = {
            "universal": {
                "qualityChecks": [
                    "Ist der Inhalt für die Zielgruppe relevant?",
                    "Ist die Sprache angemessen und verständlich?",
                    "Sind die Informationen akkurat und aktuell?",
                    "Motiviert das Script zur gewünschten Aktion?",
                    "Ist die Länge optimal für das Format?"
                ],
                "fallbackStrategies": [
                    "Bei LLM-Ausfall: Template-basierte Generierung",
                    "Bei schlechter Qualität: Prompt-Vereinfachung",
                    "Bei Token-Überschreitung: Schrittweise Kürzung"
                ]
            }
        }

        prompt_file = self.prompts_dir / "default-prompts.json"
        if not prompt_file.exists():
            with open(prompt_file, "w", encoding="utf-8") as f:
                json.dump(default_prompts, f, ensure_ascii=False, indent=2)

    def generate_optimized_prompt(self, options: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Generate optimized prompt for script section
        """
        section = options.get("section", "")
        content_type = options.get("contentType", "")
        target_length = options.get("targetLength", "")
        tone = options.get("tone", "")
        topic = options.get("topic", "")
        trending_keywords = options.get("trendingKeywords", [])
        audience = options.get("audience", "alle")
        source_content = options.get("sourceContent", "")
        custom_instructions = options.get("customInstructions", "")

        try:
            # Get base templates
            content_template = self.prompt_templates["contentTypes"].get(content_type)
            length_strategy = self.prompt_templates["lengthStrategies"].get(target_length)
            tone_modifier = self.prompt_templates["toneModifiers"].get(tone)

            if not content_template or not length_strategy or not tone_modifier:
                raise ValueError(f"Invalid template combination: {content_type}/{target_length}/{tone}")

            # Build optimized prompt
            prompt_parts = []

            # 1. System context
            prompt_parts.append(content_template["systemPrompt"])

            # 2. Length-specific instructions
            prompt_parts.append(length_strategy["promptModifier"])

            # 3. Tone-specific instructions
            prompt_parts.append(tone_modifier["promptAddition"])

            # 4. Section-specific prompt
            if section in content_template["sectionPrompts"]:
                section_prompt = content_template["sectionPrompts"][section]

                # Replace placeholders
                section_prompt = section_prompt.replace("{topic}", topic)
                section_prompt = section_prompt.replace("{length}", target_length)
                section_prompt = section_prompt.replace("{tone}", tone)
                section_prompt = section_prompt.replace("{audience}", audience)
                section_prompt = section_prompt.replace(
                    "{keywords}",
                    ", ".join(trending_keywords) if trending_keywords else "Keine spezifischen Keywords"
                )

                prompt_parts.append(section_prompt)

            # 5. Source content context
            if source_content:
                source_excerpt = source_content[:500] + ("..." if len(source_content) > 500 else "")
                prompt_parts.append(f"QUELL-CONTENT:\n{source_excerpt}")

            # 6. Custom instructions
            if custom_instructions:
                prompt_parts.append(f"ZUSÄTZLICHE ANWEISUNGEN:\n{custom_instructions}")

            # 7. Quality requirements
            quality_requirements = f"""QUALITÄTSANFORDERUNGEN:
- Zielgruppen-gerecht für: {audience}
- Sprachstil: {tone_modifier['vocabulary']}
- Emotionale Ebene: {tone_modifier['emotionalLevel']}
- Längen-Optimierung: {length_strategy['approach']}
- Trending Keywords einbauen: {', '.join(trending_keywords[:3]) if trending_keywords else 'flexibel'}"""

            prompt_parts.append(quality_requirements)

            prompt = "\n\n".join(prompt_parts)
            optimized_prompt = self.optimize_token_usage(prompt)

            return {
                "prompt": optimized_prompt,
                "metadata": {
                    "section": section,
                    "contentType": content_type,
                    "targetLength": target_length,
                    "tone": tone,
                    "estimatedTokens": self.estimate_tokens(optimized_prompt),
                    "optimizationLevel": self.get_optimization_level(optimized_prompt),
                    "qualityScore": self.calculate_quality_score(options)
                }
            }

        except Exception as error:
            print(f"❌ Failed to generate optimized prompt: {error}")
            return self.generate_fallback_prompt(options)

    def optimize_token_usage(self, prompt: str) -> str:
        """
        Optimize prompt for token efficiency
        """
        estimated_tokens = self.estimate_tokens(prompt)

        if estimated_tokens <= self.token_optimization["maxPromptTokens"]:
            return prompt  # Already optimal

        # Apply compression strategies
        optimized = prompt

        # Remove redundant phrases
        redundant_words = ["bitte", "auch", "dabei", "jedoch", "allerdings"]
        for word in redundant_words:
            optimized = re.sub(rf"\b{word}\b", "", optimized)

        # Compress whitespace
        optimized = re.sub(r"\n{3,}", "\n\n", optimized)
        optimized = re.sub(r"\s{2,}", " ", optimized)

        # Shorten explanations if still too long
        if self.estimate_tokens(optimized) > self.token_optimization["maxPromptTokens"]:
            lines = optimized.split("\n")
            important_lines = [
                line for line in lines
                if "SYSTEM:" in line or "AUFGABE:" in line or "{topic}" in line or len(line.strip()) < 50
            ]
            optimized = "\n".join(important_lines)

        return optimized

    def estimate_tokens(self, text: str) -> int:
        """
        Estimate token count for prompt
        """
        # Rough estimation: 1 token ≈ 4 characters for German text
        return len(text) // 4

    def calculate_quality_score(self, options: Dict[str, Any]) -> int:
        """
        Calculate quality score for prompt options
        """
        score = 0

        # Topic specificity
        if options.get("topic") and len(options.get("topic", "")) > 5:
            score += 20

        # Content type match
        if options.get("contentType") in self.prompt_templates["contentTypes"]:
            score += 20

        # Length strategy match
        if options.get("targetLength") in self.prompt_templates["lengthStrategies"]:
            score += 20

        # Tone consistency
        if options.get("tone") in self.prompt_templates["toneModifiers"]:
            score += 20

        # Trending keywords
        if options.get("trendingKeywords") and len(options.get("trendingKeywords", [])) > 0:
            score += 10

        # Source content
        if options.get("sourceContent") and len(options.get("sourceContent", "")) > 50:
            score += 10

        return min(score, 100)

    def get_optimization_level(self, prompt: str) -> str:
        """
        Get optimization level based on prompt complexity
        """
        tokens = self.estimate_tokens(prompt)

        if tokens < 500:
            return "light"
        elif tokens < 1000:
            return "moderate"
        else:
            return "aggressive"

    def generate_fallback_prompt(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate fallback prompt for error cases
        """
        section = options.get("section", "")
        topic = options.get("topic", "")
        target_length = options.get("targetLength", "")
        tone = options.get("tone", "")

        fallback = f"""Erstelle einen {section} für ein {target_length} YouTube-Video über "{topic}".
Stil: {tone}
Halte es prägnant und zielgruppen-gerecht."""

        return {
            "prompt": fallback,
            "metadata": {
                "isFallback": True,
                "section": section,
                "estimatedTokens": self.estimate_tokens(fallback),
                "qualityScore": 50
            }
        }

    async def test_prompt(self, prompt_options: Dict[str, Any], test_providers: List[str] = ["ollama"]) -> Dict[str, Any]:
        """
        Test prompt with different LLM providers
        """
        prompt_data = self.generate_optimized_prompt(prompt_options)
        test_id = str(uuid.uuid4())

        results = {
            "testId": test_id,
            "prompt": prompt_data["prompt"],
            "metadata": prompt_data["metadata"],
            "providerResults": {},
            "qualityAnalysis": {},
            "recommendation": ""
        }

        print(f"🧪 Testing prompt {test_id} with providers: {test_providers}")

        for provider in test_providers:
            try:
                start_time = asyncio.get_event_loop().time()

                # Mock LLM call for now - would integrate with actual LLM services
                mock_response = await self.mock_llm_call(prompt_data["prompt"], provider)

                results["providerResults"][provider] = {
                    "response": mock_response["content"],
                    "responseTime": (asyncio.get_event_loop().time() - start_time) * 1000,  # Convert to ms
                    "tokenUsage": mock_response["tokenUsage"],
                    "quality": self.assess_response_quality(mock_response["content"], prompt_options),
                    "cost": self.estimate_cost(mock_response["tokenUsage"], provider)
                }

            except Exception as error:
                results["providerResults"][provider] = {
                    "error": str(error),
                    "success": False
                }

        # Analyze results and generate recommendation
        results["recommendation"] = self.generate_recommendation(results)

        # Save test results
        await self.save_test_results(results)

        return results

    async def mock_llm_call(self, prompt: str, provider: str) -> Dict[str, Any]:
        """
        Mock LLM call for testing
        """
        # Simulate processing time
        await asyncio.sleep(0.1 + 0.5 * (1 - 0.5))

        response_length = min(1000, len(prompt) * 0.5 + 500 * (1 - 0.5))
        mock_content = ("[Mock " + provider + " response für: " + prompt[:50] + "...] ") * int(response_length / 60)

        return {
            "content": mock_content[:int(response_length)],
            "tokenUsage": {
                "prompt": self.estimate_tokens(prompt),
                "response": self.estimate_tokens(mock_content),
                "total": self.estimate_tokens(prompt + mock_content)
            }
        }

    def assess_response_quality(self, response: str, original_options: Dict[str, Any]) -> float:
        """
        Assess response quality
        """
        score = 0.0

        # Length appropriateness
        target_words = self.get_target_words(original_options.get("targetLength", ""))
        actual_words = len(response.split())
        length_score = max(0, 100 - abs(actual_words - target_words) / target_words * 100)
        score += length_score * 0.3

        # Topic relevance (simple keyword check)
        topic_words = original_options.get("topic", "").lower().split()
        response_words = response.lower()
        relevance = len([word for word in topic_words if word in response_words]) / max(len(topic_words), 1)
        score += relevance * 100 * 0.3

        # Structure presence
        has_structure = "\n" in response or len(response.split(".")) > 2
        score += 20 if has_structure else 0

        # Trending keywords integration
        keywords = original_options.get("trendingKeywords", [])
        keyword_score = len([kw for kw in keywords if kw.lower() in response_words]) / max(len(keywords), 1) * 100
        score += keyword_score * 0.2

        return min(score, 100)

    def get_target_words(self, target_length: str) -> int:
        """
        Get target word count for length
        """
        mapping = {
            "30s": 75,
            "1min": 150,
            "5min": 750,
            "10min": 1500,
            "15min": 2250
        }
        return mapping.get(target_length, 750)

    def estimate_cost(self, token_usage: Dict[str, int], provider: str) -> Dict[str, float]:
        """
        Estimate cost for token usage
        """
        costs = {
            "openai": {"input": 0.003, "output": 0.006},  # per 1K tokens
            "anthropic": {"input": 0.008, "output": 0.024},
            "ollama": {"input": 0, "output": 0}
        }

        provider_costs = costs.get(provider, costs["ollama"])

        return {
            "input": (token_usage["prompt"] / 1000) * provider_costs["input"],
            "output": (token_usage["response"] / 1000) * provider_costs["output"],
            "total": (token_usage["prompt"] / 1000) * provider_costs["input"] +
                    (token_usage["response"] / 1000) * provider_costs["output"]
        }

    def generate_recommendation(self, results: Dict[str, Any]) -> str:
        """
        Generate recommendation based on test results
        """
        providers = list(results["providerResults"].keys())

        if len(providers) == 0:
            return "Keine erfolgreichen Tests - Überprüfe Provider-Konfiguration"

        # Find best provider by quality and cost
        best_provider = providers[0]
        best_score = 0

        for provider in providers:
            result = results["providerResults"][provider]
            if "error" in result:
                continue

            # Composite score: quality (70%) + cost efficiency (30%)
            quality_score = result.get("quality", 0)
            cost_efficiency = 100 if result["cost"]["total"] == 0 else max(0, 100 - result["cost"]["total"] * 1000)
            composite_score = quality_score * 0.7 + cost_efficiency * 0.3

            if composite_score > best_score:
                best_score = composite_score
                best_provider = provider

        best_result = results["providerResults"][best_provider]

        return f"""Empfohlener Provider: {best_provider}
(Qualität: {round(best_result.get('quality', 0))}%, Kosten: ${best_result['cost']['total']:.4f},
Antwortzeit: {best_result.get('responseTime', 0):.0f}ms)"""

    async def save_test_results(self, results: Dict[str, Any]) -> None:
        """
        Save test results
        """
        timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
        filename = f"prompt-test-{results['testId']}-{timestamp}.json"
        filepath = self.results_dir / filename

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        print(f"💾 Prompt test results saved: {filename}")

    def get_stats(self) -> Dict[str, Any]:
        """
        Get service statistics
        """
        try:
            test_files = [f for f in self.results_dir.iterdir() if f.name.startswith("prompt-test-") and f.name.endswith(".json")]

            stats = {
                "totalTests": len(test_files),
                "supportedContentTypes": list(self.prompt_templates["contentTypes"].keys()),
                "supportedLengths": list(self.prompt_templates["lengthStrategies"].keys()),
                "supportedTones": list(self.prompt_templates["toneModifiers"].keys()),
                "tokenOptimization": self.token_optimization,
                "averageQuality": 0,
                "recentTests": []
            }

            # Analyze recent tests
            recent_tests = []
            for test_file in test_files[-10:]:  # Last 10 tests
                try:
                    with open(test_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        recent_tests.append({
                            "testId": data.get("testId", ""),
                            "qualityScore": data.get("metadata", {}).get("qualityScore", 0),
                            "providers": list(data.get("providerResults", {}).keys()),
                            "recommendation": data.get("recommendation", "")
                        })
                except Exception:
                    pass

            stats["recentTests"] = recent_tests
            stats["averageQuality"] = (
                sum(test["qualityScore"] for test in recent_tests) / len(recent_tests)
                if recent_tests else 0
            )

            return stats
        except Exception as error:
            print(f"❌ Failed to get prompt stats: {error}")
            return {
                "totalTests": 0,
                "error": str(error)
            }


# Main execution
if __name__ == "__main__":
    agent = AdvancedPromptingAgent()
    print("🎬 Advanced Prompting Agent initialized")

    # Example usage
    example_options = {
        "section": "hook",
        "contentType": "news",
        "targetLength": "1min",
        "tone": "informativ",
        "topic": "Künstliche Intelligenz in der Medizin",
        "trendingKeywords": ["KI", "Medizin", "Innovation"],
        "audience": "allgemeine Öffentlichkeit"
    }

    result = agent.generate_optimized_prompt(example_options)
    print(f"✅ Generated prompt with {result['metadata']['estimatedTokens']} estimated tokens")
    print(f"📊 Quality score: {result['metadata']['qualityScore']}/100")

    # Show stats
    stats = agent.get_stats()
    print(f"📈 Total tests performed: {stats['totalTests']}")