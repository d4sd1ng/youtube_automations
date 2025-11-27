#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Video Repurposing Service
Spezialisiertes Modul für die automatische Erstellung von Shorts aus Long-Form-Videos
Bewertung: 9/10
"""

import os
import json
import asyncio
import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Set
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoRepurposingService:
    def __init__(self):
        # Notification systems
        self.notification_channels = {
            "discord": os.environ.get("DISCORD_WEBHOOK", ""),
            "telegram": os.environ.get("TELEGRAM_BOT_TOKEN", ""),
            "webhook": os.environ.get("WEBHOOK_URL", ""),
            "slack": os.environ.get("SLACK_WEBHOOK", "")
        }

        self.repurposing_dir = Path(__file__).parent.parent.parent / "data" / "repurposing"
        self.templates_dir = self.repurposing_dir / "templates"
        self.highlights_dir = self.repurposing_dir / "highlights"
        self.shorts_dir = self.repurposing_dir / "shorts"

        self.ensure_directories()
        self.load_configuration()
        self.initialize_notification_systems()

    def initialize_notification_systems(self) -> None:
        """Initialize notification systems"""
        logger.info("🔔 Initializing notification systems...")
        self.notification_systems = {
            "discord": bool(self.notification_channels["discord"]),
            "telegram": bool(self.notification_channels["telegram"]),
            "webhook": bool(self.notification_channels["webhook"]),
            "slack": bool(self.notification_channels["slack"])
        }
        logger.info("✅ Notification systems initialized")

    async def send_notification(self, message: str, level: str = "info") -> None:
        """Send notification"""
        # In a real implementation, this would send notifications through various channels
        logger.info(f"[{level.upper()}] {message}")

        # Discord notification
        if self.notification_systems["discord"] and self.notification_channels["discord"]:
            logger.info(f"📤 Discord notification: {message}")

        # Telegram notification
        if self.notification_systems["telegram"] and self.notification_channels["telegram"]:
            logger.info(f"📤 Telegram notification: {message}")

        # Webhook notification
        if self.notification_systems["webhook"] and self.notification_channels["webhook"]:
            logger.info(f"📤 Webhook notification: {message}")

        # Slack notification
        if self.notification_systems["slack"] and self.notification_channels["slack"]:
            logger.info(f"📤 Slack notification: {message}")

    def ensure_directories(self) -> None:
        """Ensure required directories exist"""
        dirs = [self.repurposing_dir, self.templates_dir, self.highlights_dir, self.shorts_dir]
        for directory in dirs:
            directory.mkdir(parents=True, exist_ok=True)

    def load_configuration(self) -> None:
        """Load repurposing configuration"""
        try:
            config_path = self.repurposing_dir / "config.json"
            if config_path.exists():
                with open(config_path, "r", encoding="utf-8") as f:
                    self.config = json.load(f)
            else:
                self.config = {
                    "short_formats": {
                        "youtube_shorts": {
                            "duration": 60,  # Sekunden
                            "aspect_ratio": "9:16",
                            "resolution": "1080x1920",
                            "recommended_lengths": [15, 30, 45, 60]
                        },
                        "instagram_reels": {
                            "duration": 90,  # Sekunden
                            "aspect_ratio": "9:16",
                            "resolution": "1080x1920",
                            "recommended_lengths": [15, 30, 45, 60, 90]
                        },
                        "tiktok": {
                            "duration": 60,  # Sekunden
                            "aspect_ratio": "9:16",
                            "resolution": "1080x1920",
                            "recommended_lengths": [15, 30, 45, 60]
                        },
                        "linkedin": {
                            "duration": 60,  # Sekunden
                            "aspect_ratio": "1:1",
                            "resolution": "1080x1080",
                            "recommended_lengths": [15, 30, 45, 60]
                        }
                    },
                    "highlight_detection": {
                        "engagement_threshold": 0.7,  # 70% Engagement-Rate
                        "text_density_threshold": 0.5,  # 50% Text-Dichte
                        "visual_change_threshold": 0.3,  # 30% visuelle Veränderung
                        "viral_score_threshold": 0.8  # 80% Viral-Potenzial
                    },
                    "templates": {
                        "hook_first": {
                            "name": "Hook-First",
                            "description": "Beginnt mit dem stärksten Hook des Originalvideos",
                            "structure": ["hook", "context", "value_proposition", "call_to_action"],
                            "category": "engagement"
                        },
                        "value_first": {
                            "name": "Value-First",
                            "description": "Beginnt mit dem wertvollsten Inhalt des Originalvideos",
                            "structure": ["value_proposition", "hook", "context", "call_to_action"],
                            "category": "value"
                        },
                        "question_hook": {
                            "name": "Question Hook",
                            "description": "Beginnt mit einer provozierenden Frage",
                            "structure": ["question", "hook", "value_proposition", "call_to_action"],
                            "category": "engagement"
                        },
                        "storytelling": {
                            "name": "Storytelling",
                            "description": "Erzählt eine Geschichte aus dem Originalvideo",
                            "structure": ["setup", "conflict", "resolution", "call_to_action"],
                            "category": "narrative"
                        },
                        "educational": {
                            "name": "Educational",
                            "description": "Fokussiert auf Bildungsinhalte",
                            "structure": ["problem", "solution", "example", "call_to_action"],
                            "category": "education"
                        }
                    }
                }
                self.save_configuration()
        except Exception as error:
            logger.error(f"❌ Failed to load repurposing config: {error}")
            self.config = {}

    def save_configuration(self) -> None:
        """Save repurposing configuration"""
        try:
            config_path = self.repurposing_dir / "config.json"
            with open(config_path, "w", encoding="utf-8") as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
        except Exception as error:
            logger.error(f"❌ Failed to save repurposing config: {error}")

    async def analyze_video_for_highlights(self, video_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze long-form video for highlight extraction"""
        try:
            # Send notification about analysis start
            await self.send_notification(f"Starting video analysis for: {video_data.get('title', '')}", "info")

            video_id = video_data.get("video_id", "")
            title = video_data.get("title", "")
            transcript = video_data.get("transcript", "")
            timestamps = video_data.get("timestamps", [])
            engagement_metrics = video_data.get("engagement_metrics", {})
            monetization_data = video_data.get("monetization_data", {})

            logger.info(f"🔍 Analyzing video {video_id} for highlights: \"{title}\"")

            # 1. Textbasierte Analyse
            text_highlights = self.extract_text_highlights(transcript, timestamps)

            # 2. Engagement-basierte Analyse
            engagement_highlights = self.extract_engagement_highlights(engagement_metrics, timestamps)

            # 3. Monetarisierungs-basierte Analyse
            monetization_highlights = self.extract_monetization_highlights(monetization_data, timestamps)

            # 4. Kombinierte Highlight-Bewertung
            combined_highlights = self.combine_and_rank_highlights(
                text_highlights,
                engagement_highlights,
                monetization_highlights
            )

            # 5. Speichern der Highlights
            highlight_id = str(uuid.uuid4())
            highlight_data = {
                "highlight_id": highlight_id,
                "video_id": video_id,
                "title": title,
                "created_at": datetime.now().isoformat(),
                "highlights": combined_highlights,
                "summary": {
                    "total_highlights": len(combined_highlights),
                    "top_performing_segments": combined_highlights[:5]
                }
            }

            await self.save_highlights(highlight_id, highlight_data)

            # Send notification about successful completion
            await self.send_notification(f"Video analysis completed for: {title} - {len(combined_highlights)} highlights found", "success")

            return highlight_data
        except Exception as error:
            logger.error(f"❌ Failed to analyze video for highlights: {error}")
            await self.send_notification(f"Video analysis failed for: {video_data.get('title', '')} - {str(error)}", "error")
            raise error

    def extract_text_highlights(self, transcript: str, timestamps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract text-based highlights"""
        highlights = []

        # Zerlege Transkript in Sätze
        sentences = [s.strip() for s in transcript.split(".") if s.strip()]

        # Analysiere jeden Satz auf Schlüsselwörter und Struktur
        for index, sentence in enumerate(sentences):
            score = self.calculate_text_score(sentence)
            if score > 0.6:  # Schwellenwert für relevante Inhalte
                # Finde Zeitstempel für diesen Satz
                timestamp = self.find_timestamp_for_sentence(sentence, timestamps, index)

                highlights.append({
                    "type": "text",
                    "content": sentence,
                    "timestamp": timestamp,
                    "score": score,
                    "confidence": "high"
                })

        return sorted(highlights, key=lambda x: x["score"], reverse=True)

    def calculate_text_score(self, sentence: str) -> float:
        """Calculate text score based on keywords and structure"""
        viral_keywords = [
            "wusstet ihr", "überraschend", "unglaublich", "geheim", "tipp",
            "müssen sehen", "verblüffend", "erstaunlich", "sensation", "exklusiv",
            "neu", "aktuell", "trend", "jetzt", "sofort"
        ]

        question_words = [
            "warum", "wie", "was", "wann", "wer", "wo", "welche", "weshalb"
        ]

        call_to_action_words = [
            "jetzt", "klick", "abonnieren", "teilen", "kommentieren",
            "mehr", "hier", "jetzt", "sehen", "lernen"
        ]

        score = 0
        lower_sentence = sentence.lower()

        # Viral-Koeffizient
        for keyword in viral_keywords:
            if keyword in lower_sentence:
                score += 0.2

        # Frage-Koeffizient
        for word in question_words:
            if word in lower_sentence:
                score += 0.15

        # Call-to-Action-Koeffizient
        for word in call_to_action_words:
            if word in lower_sentence:
                score += 0.1

        # Längen-Koeffizient (optimale Länge 10-20 Wörter)
        word_count = len(sentence.split())
        if 10 <= word_count <= 20:
            score += 0.1

        return min(score, 1.0)

    def find_timestamp_for_sentence(self, sentence: str, timestamps: List[Dict[str, Any]], sentence_index: int) -> Dict[str, Any]:
        """Find timestamp for sentence"""
        # Vereinfachte Implementierung - in echter Anwendung würde dies
        # komplexe Text-zu-Zeitstempel-Matching-Algorithmen verwenden
        if timestamps and len(timestamps) > 0:
            index = min(sentence_index, len(timestamps) - 1)
            return timestamps[index]
        return {"start": sentence_index * 5, "end": (sentence_index + 1) * 5}  # Schätzung

    def extract_engagement_highlights(self, engagement_metrics: Dict[str, Any], timestamps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract engagement-based highlights"""
        highlights = []

        if not engagement_metrics or not engagement_metrics.get("timeline"):
            return highlights

        timeline = engagement_metrics["timeline"]
        threshold = self.config["highlight_detection"]["engagement_threshold"]

        # Finde Zeitabschnitte mit hoher Engagement-Rate
        for index, segment in enumerate(timeline):
            if segment.get("engagement_rate", 0) > threshold:
                timestamp = timestamps[index] if timestamps and len(timestamps) > index else {
                    "start": segment.get("timestamp", 0),
                    "end": segment.get("timestamp", 0) + segment.get("duration", 0)
                }

                highlights.append({
                    "type": "engagement",
                    "content": f"Hochengagierter Abschnitt mit {round(segment.get('engagement_rate', 0) * 100)}% Engagement",
                    "timestamp": timestamp,
                    "score": segment.get("engagement_rate", 0),
                    "confidence": "medium"
                })

        return sorted(highlights, key=lambda x: x["score"], reverse=True)

    def extract_monetization_highlights(self, monetization_data: Dict[str, Any], timestamps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract monetization-based highlights"""
        highlights = []

        if not monetization_data or not monetization_data.get("revenue_timeline"):
            return highlights

        timeline = monetization_data["revenue_timeline"]
        if not timeline:
            return highlights

        avg_revenue = sum(segment.get("revenue", 0) for segment in timeline) / len(timeline) if timeline else 0

        # Finde Zeitabschnitte mit überdurchschnittlicher Monetarisierung
        for index, segment in enumerate(timeline):
            if segment.get("revenue", 0) > avg_revenue * 1.5:  # 50% über dem Durchschnitt
                timestamp = timestamps[index] if timestamps and len(timestamps) > index else {
                    "start": segment.get("timestamp", 0),
                    "end": segment.get("timestamp", 0) + segment.get("duration", 0)
                }

                highlights.append({
                    "type": "monetization",
                    "content": f"Hochwertiger Abschnitt mit ${segment.get('revenue', 0):.2f} Umsatz",
                    "timestamp": timestamp,
                    "score": segment.get("revenue", 0) / avg_revenue if avg_revenue > 0 else 0,
                    "confidence": "high"
                })

        return sorted(highlights, key=lambda x: x["score"], reverse=True)

    def combine_and_rank_highlights(self, text_highlights: List[Dict[str, Any]], engagement_highlights: List[Dict[str, Any]], monetization_highlights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Combine and rank highlights from different sources"""
        # Kombiniere alle Highlights
        all_highlights = []
        all_highlights.extend([{"source": "text", **h} for h in text_highlights])
        all_highlights.extend([{"source": "engagement", **h} for h in engagement_highlights])
        all_highlights.extend([{"source": "monetization", **h} for h in monetization_highlights])

        # Deduplizierung basierend auf Zeitstempel-Überlappung
        deduplicated = self.deduplicate_highlights(all_highlights)

        # Ranking basierend auf Score und Quelle
        return sorted(deduplicated, key=lambda x: x["score"] * self.get_highlight_weight(x), reverse=True)

    def deduplicate_highlights(self, highlights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Deduplicate highlights based on timestamp overlap"""
        deduplicated = []
        processed_timestamps = set()

        for highlight in highlights:
            timestamp = highlight.get("timestamp", {})
            start = timestamp.get("start", 0)
            end = timestamp.get("end", 0)
            timestamp_key = f"{int(start // 10)}-{int(end // 10)}"

            if timestamp_key not in processed_timestamps:
                deduplicated.append(highlight)
                processed_timestamps.add(timestamp_key)

        return deduplicated

    def get_highlight_weight(self, highlight: Dict[str, Any]) -> float:
        """Get highlight weight based on source"""
        source = highlight.get("source", "")
        if source == "monetization":
            return 0.4
        elif source == "engagement":
            return 0.35
        elif source == "text":
            return 0.25
        else:
            return 0.2

    async def save_highlights(self, highlight_id: str, highlight_data: Dict[str, Any]) -> None:
        """Save highlights to file"""
        try:
            filename = f"highlights-{highlight_id}.json"
            filepath = self.highlights_dir / filename

            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(highlight_data, f, indent=2, ensure_ascii=False)

            logger.info(f"💾 Highlights saved: {filename}")
        except Exception as error:
            logger.error(f"❌ Failed to save highlights: {error}")

    async def create_short_from_highlights(self, highlight_data: Dict[str, Any], options: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Create short video from highlights"""
        try:
            # Send notification about short creation start
            await self.send_notification(f"Starting short creation from: {highlight_data.get('title', '')}", "info")

            target_platform = options.get("target_platform", "youtube_shorts")
            target_length = options.get("target_length", 60)  # Sekunden
            template = options.get("template", "hook_first")
            custom_hook = options.get("custom_hook", None)

            short_id = str(uuid.uuid4())
            logger.info(f"🎬 Creating short {short_id} from highlights for {target_platform}")

            # 1. Wähle beste Highlights basierend auf Zielplattform und Länge
            selected_highlights = self.select_highlights_for_short(
                highlight_data["highlights"],
                target_length,
                target_platform
            )

            # 2. Erstelle Short-Struktur basierend auf Template
            short_structure = self.create_short_structure(
                selected_highlights,
                template,
                custom_hook,
                target_length
            )

            # 3. Generiere Short-Skript
            short_script = self.generate_short_script(short_structure, target_platform)

            # 4. Erstelle Short-Konfiguration
            short_config = {
                "short_id": short_id,
                "original_video_id": highlight_data.get("video_id", ""),
                "title": highlight_data.get("title", ""),
                "target_platform": target_platform,
                "target_length": target_length,
                "template": template,
                "created_at": datetime.now().isoformat(),
                "highlights": selected_highlights,
                "structure": short_structure,
                "script": short_script,
                "estimated_duration": sum(segment.get("duration", 0) for segment in short_structure)
            }

            # 5. Speichere Short
            await self.save_short(short_id, short_config)

            # Send notification about successful completion
            await self.send_notification(f"Short creation completed for: {highlight_data.get('title', '')}", "success")

            return short_config
        except Exception as error:
            logger.error(f"❌ Failed to create short from highlights: {error}")
            await self.send_notification(f"Short creation failed for: {highlight_data.get('title', '')} - {str(error)}", "error")
            raise error

    def select_highlights_for_short(self, highlights: List[Dict[str, Any]], target_length: int, target_platform: str) -> List[Dict[str, Any]]:
        """Select highlights for short video"""
        # Filter Highlights nach Plattform-Eignung
        platform_config = self.config["short_formats"].get(target_platform, {})
        recommended_lengths = platform_config.get("recommended_lengths", [])
        max_recommended_length = max(recommended_lengths) if recommended_lengths else 60

        suitable_highlights = [
            h for h in highlights
            if h.get("timestamp", {}).get("end", 0) - h.get("timestamp", {}).get("start", 0) <= max_recommended_length
        ]

        # Sortiere nach Score
        sorted_highlights = sorted(suitable_highlights, key=lambda x: x.get("score", 0), reverse=True)

        # Wähle Highlights aus, die in die Zielzeit passen
        selected = []
        total_time = 0

        for highlight in sorted_highlights:
            timestamp = highlight.get("timestamp", {})
            duration = timestamp.get("end", 0) - timestamp.get("start", 0)
            if total_time + duration <= target_length:
                selected.append(highlight)
                total_time += duration

            # Stoppe wenn wir nah an der Zielzeit sind
            if total_time >= target_length * 0.9:
                break

        return selected

    def create_short_structure(self, highlights: List[Dict[str, Any]], template_name: str, custom_hook: Optional[str], target_length: int) -> List[Dict[str, Any]]:
        """Create short structure from highlights"""
        template = self.config["templates"].get(template_name, self.config["templates"]["hook_first"])
        structure = []

        # Berechne Zeit pro Segment
        segment_time = target_length / len(template["structure"]) if template["structure"] else target_length

        for index, segment_type in enumerate(template["structure"]):
            if segment_type == "hook":
                # Verwende benutzerdefinierten Hook oder besten Highlight
                hook_content = custom_hook or self.get_best_hook(highlights)
                structure.append({
                    "type": "hook",
                    "content": hook_content,
                    "duration": segment_time,
                    "order": index
                })
            elif segment_type == "value_proposition":
                # Verwende wertvollsten Highlight
                value_content = self.get_best_value_proposition(highlights)
                structure.append({
                    "type": "value_proposition",
                    "content": value_content,
                    "duration": segment_time,
                    "order": index
                })
            elif segment_type == "context":
                # Verwende kontextrelevanten Highlight
                context_content = self.get_context(highlights)
                structure.append({
                    "type": "context",
                    "content": context_content,
                    "duration": segment_time,
                    "order": index
                })
            elif segment_type == "question":
                # Erstelle provozierende Frage
                question_content = self.generate_question(highlights)
                structure.append({
                    "type": "question",
                    "content": question_content,
                    "duration": segment_time,
                    "order": index
                })
            elif segment_type == "call_to_action":
                # Standard-Call-to-Action
                structure.append({
                    "type": "call_to_action",
                    "content": "Gefällt dir der Inhalt? Dann abonniere für mehr!",
                    "duration": segment_time,
                    "order": index
                })
            elif segment_type == "setup":
                # Storytelling Setup
                structure.append({
                    "type": "setup",
                    "content": "Lass mich dir eine Geschichte erzählen...",
                    "duration": segment_time,
                    "order": index
                })
            elif segment_type == "conflict":
                # Storytelling Conflict
                conflict_content = self.get_best_conflict(highlights)
                structure.append({
                    "type": "conflict",
                    "content": conflict_content,
                    "duration": segment_time,
                    "order": index
                })
            elif segment_type == "resolution":
                # Storytelling Resolution
                structure.append({
                    "type": "resolution",
                    "content": "Und so wurde das Problem gelöst.",
                    "duration": segment_time,
                    "order": index
                })
            elif segment_type == "problem":
                # Educational Problem
                problem_content = self.get_best_problem(highlights)
                structure.append({
                    "type": "problem",
                    "content": problem_content,
                    "duration": segment_time,
                    "order": index
                })
            elif segment_type == "solution":
                # Educational Solution
                solution_content = self.get_best_solution(highlights)
                structure.append({
                    "type": "solution",
                    "content": solution_content,
                    "duration": segment_time,
                    "order": index
                })
            elif segment_type == "example":
                # Educational Example
                structure.append({
                    "type": "example",
                    "content": "Hier ist ein Beispiel dafür...",
                    "duration": segment_time,
                    "order": index
                })
            else:
                # Fallback zu einfachem Highlight
                if index < len(highlights):
                    structure.append({
                        "type": "content",
                        "content": highlights[index].get("content", ""),
                        "duration": segment_time,
                        "order": index
                    })

        return structure

    def get_best_hook(self, highlights: List[Dict[str, Any]]) -> str:
        """Get best hook from highlights"""
        # Finde Highlight mit höchstem Score und viralen Keywords
        hook_highlights = [
            h for h in highlights
            if any(keyword in h.get("content", "").lower() for keyword in ["wusstet", "überraschend", "unglaublich"])
        ]

        if hook_highlights:
            return hook_highlights[0].get("content", "")

        # Fallback zu bestem Highlight
        return highlights[0].get("content", "Schau dir das an!") if highlights else "Schau dir das an!"

    def get_best_value_proposition(self, highlights: List[Dict[str, Any]]) -> str:
        """Get best value proposition from highlights"""
        # Sortiere nach Monetarisierungs-Score
        monetization_highlights = [h for h in highlights if h.get("source") == "monetization"]
        if monetization_highlights:
            return monetization_highlights[0].get("content", "")

        # Fallback zu bestem Highlight
        return highlights[0].get("content", "Das solltest du sehen!") if highlights else "Das solltest du sehen!"

    def get_context(self, highlights: List[Dict[str, Any]]) -> str:
        """Get context from highlights"""
        # Verwende mittleren Highlight für Kontext
        mid_index = len(highlights) // 2
        return highlights[mid_index].get("content", "Hier ist der Kontext:") if mid_index < len(highlights) else "Hier ist der Kontext:"

    def generate_question(self, highlights: List[Dict[str, Any]]) -> str:
        """Generate question from highlights"""
        # Erstelle Frage basierend auf bestem Highlight
        if highlights:
            best_highlight = highlights[0].get("content", "")
            # Vereinfachte Frage-Generierung
            return f"Wusstest du schon: {best_highlight[:30]}...?"
        return "Was denkst du darüber?"

    def get_best_conflict(self, highlights: List[Dict[str, Any]]) -> str:
        """Get best conflict from highlights"""
        # Finde Highlight mit Konflikt-Keywords
        conflict_highlights = [
            h for h in highlights
            if any(keyword in h.get("content", "").lower() for keyword in ["problem", "herausforderung", "schwierig"])
        ]

        if conflict_highlights:
            return conflict_highlights[0].get("content", "")

        # Fallback zu bestem Highlight
        return highlights[0].get("content", "Es gab ein Problem...") if highlights else "Es gab ein Problem..."

    def get_best_problem(self, highlights: List[Dict[str, Any]]) -> str:
        """Get best problem from highlights"""
        # Finde Highlight mit Problem-Keywords
        problem_highlights = [
            h for h in highlights
            if any(keyword in h.get("content", "").lower() for keyword in ["problem", "herausforderung", "schwierig"])
        ]

        if problem_highlights:
            return problem_highlights[0].get("content", "")

        # Fallback zu bestem Highlight
        return highlights[0].get("content", "Was ist das Problem?") if highlights else "Was ist das Problem?"

    def get_best_solution(self, highlights: List[Dict[str, Any]]) -> str:
        """Get best solution from highlights"""
        # Finde Highlight mit Lösungs-Keywords
        solution_highlights = [
            h for h in highlights
            if any(keyword in h.get("content", "").lower() for keyword in ["lösung", "antwort", "beheben"])
        ]

        if solution_highlights:
            return solution_highlights[0].get("content", "")

        # Fallback zu bestem Highlight
        return highlights[0].get("content", "So wurde es gelöst...") if highlights else "So wurde es gelöst..."

    def generate_short_script(self, structure: List[Dict[str, Any]], target_platform: str) -> str:
        """Generate short script"""
        script = f"# Short Video Script für {target_platform}\n\n"

        for index, segment in enumerate(structure):
            script += f"## {index + 1}. {segment.get('type', '').upper()}\n"
            script += f"{segment.get('content', '')}\n\n"

        return script

    async def save_short(self, short_id: str, short_data: Dict[str, Any]) -> None:
        """Save short to file"""
        try:
            filename = f"short-{short_id}.json"
            filepath = self.shorts_dir / filename

            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(short_data, f, indent=2, ensure_ascii=False)

            logger.info(f"💾 Short saved: {filename}")
        except Exception as error:
            logger.error(f"❌ Failed to save short: {error}")

    def get_stats(self) -> Dict[str, Any]:
        """Get repurposing statistics"""
        try:
            highlight_files = [f for f in self.highlights_dir.iterdir() if f.name.startswith("highlights-") and f.suffix == ".json"]
            short_files = [f for f in self.shorts_dir.iterdir() if f.name.startswith("short-") and f.suffix == ".json"]

            return {
                "total_highlights": len(highlight_files),
                "total_shorts": len(short_files),
                "last_highlight": highlight_files[-1].name if highlight_files else None,
                "last_short": short_files[-1].name if short_files else None,
                "notification_systems": self.notification_systems,
                "supported_platforms": list(self.config.get("short_formats", {}).keys()),
                "supported_templates": list(self.config.get("templates", {}).keys())
            }
        except Exception as error:
            logger.error(f"❌ Failed to get repurposing stats: {error}")
            return {
                "total_highlights": 0,
                "total_shorts": 0,
                "error": str(error)
            }


# Main execution
if __name__ == "__main__":
    service = VideoRepurposingService()
    logger.info("🎬 Video Repurposing Service initialized")

    # Example usage
    logger.info(f"📁 Repurposing directory: {service.repurposing_dir}")
    logger.info(f"📊 Supported platforms: {len(service.config.get('short_formats', {}))}")
    logger.info(f"📋 Supported templates: {len(service.config.get('templates', {}))}")