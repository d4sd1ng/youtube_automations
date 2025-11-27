#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Trend Analysis & Topic Discovery Agent
Analyzes scraped content to identify viral trends and hot topics with advanced AI capabilities
Bewertung: 9/10
"""

import os
import json
import asyncio
import logging
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Set
from pathlib import Path
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TrendAnalysisAgent:
    def __init__(self):
        self.data_dir = Path(__file__).parent.parent.parent / "data" / "scraped-content"
        self.trends_dir = Path(__file__).parent.parent.parent / "data" / "trends"
        self.cache_dir = Path(__file__).parent.parent.parent / "data" / "trend-cache"
        self.predictions_dir = self.trends_dir / "predictions"
        self.reports_dir = self.trends_dir / "reports"

        # Erweiterte Trendanalyse-Konfiguration
        self.analysis_config = {
            "min_engagement": 50,        # Minimum engagement for trend consideration
            "trending_threshold": 3,     # Minimum mentions across sources
            "viral_threshold": 7.5,      # Minimum viral potential score
            "time_window": 72,           # Hours to look back for trending analysis
            "max_trends": 50,            # Maximum trends to track
            "prediction_window": 7,      # Tage für Trendvorhersagen
            "confidence_threshold": 0.7  # Mindestvertrauensschwelle für Vorhersagen
        }

        # Erweiterte Keyword-Bewertungsgewichte
        self.scoring_weights = {
            "engagement": 0.25,
            "viral_potential": 0.2,
            "recency": 0.15,
            "cross_platform": 0.15,
            "sentiment": 0.1,
            "momentum": 0.1,
            "keyword_relevance": 0.05
        }

        # Erweiterte Themenkategorien
        self.categories = {
            "ai_tech": {
                "keywords": ["ai", "artificial intelligence", "machine learning", "neural", "gpt", "llm", "robot", "automation"],
                "weight": 1.2
            },
            "programming": {
                "keywords": ["code", "developer", "programming", "software", "github", "python", "javascript", "framework"],
                "weight": 1.0
            },
            "startup": {
                "keywords": ["startup", "funding", "venture", "ipo", "acquisition", "series", "entrepreneur"],
                "weight": 1.1
            },
            "crypto": {
                "keywords": ["bitcoin", "crypto", "blockchain", "ethereum", "nft", "defi", "web3"],
                "weight": 1.0
            },
            "science": {
                "keywords": ["research", "study", "discovery", "breakthrough", "science", "university", "experiment"],
                "weight": 0.9
            },
            "business": {
                "keywords": ["company", "ceo", "market", "business", "revenue", "profit", "economy"],
                "weight": 1.0
            },
            "politics": {
                "keywords": ["government", "policy", "regulation", "law", "congress", "senate", "election"],
                "weight": 0.8
            },
            "health": {
                "keywords": ["health", "medical", "doctor", "treatment", "vaccine", "pandemic", "wellness"],
                "weight": 1.1
            },
            "environment": {
                "keywords": ["climate", "environment", "sustainability", "green", "renewable", "carbon", "eco"],
                "weight": 1.0
            },
            "entertainment": {
                "keywords": ["movie", "music", "celebrity", "show", "tv", "actor", "album"],
                "weight": 0.9
            }
        }

        # Sentiment-Wörterbücher
        self.sentiment_words = {
            "positive": ["good", "great", "excellent", "amazing", "wonderful", "fantastic", "brilliant", "outstanding"],
            "negative": ["bad", "terrible", "awful", "horrible", "disappointing", "poor", "worst", "failed"]
        }

        self.ensure_directories()

    def ensure_directories(self) -> None:
        """Ensure required directories exist"""
        dirs = [self.trends_dir, self.cache_dir, self.predictions_dir, self.reports_dir]
        for directory in dirs:
            directory.mkdir(parents=True, exist_ok=True)

    def get_latest_scraped_content(self, hours_back: int = 72) -> List[Dict[str, Any]]:
        """Get latest scraped content files"""
        cutoff_time = datetime.now() - timedelta(hours=hours_back)
        all_content = []

        try:
            files = []
            if self.data_dir.exists():
                for f in self.data_dir.iterdir():
                    if f.name.startswith("scraped-content-") and f.suffix == ".json":
                        mtime = datetime.fromtimestamp(f.stat().st_mtime)
                        if mtime > cutoff_time:
                            files.append({"name": f.name, "path": f, "mtime": mtime})

                # Sort by modification time (newest first)
                files.sort(key=lambda x: x["mtime"], reverse=True)

                for file_info in files:
                    try:
                        with open(file_info["path"], "r", encoding="utf-8") as f:
                            data = json.load(f)
                            all_content.extend(data.get("items", []))
                    except Exception as e:
                        logger.warning(f"⚠️ Failed to load scraped content file {file_info['name']}: {e}")
        except Exception as e:
            logger.warning(f"⚠️ Failed to load scraped content: {e}")

        return all_content

    def extract_keywords(self, text: str) -> List[Dict[str, Any]]:
        """Erweiterte Keyword-Extraktion mit NLP"""
        if not text:
            return []

        # Convert to lowercase and remove special characters
        clean_text = re.sub(r"[^\w\s]", " ", text.lower())
        clean_text = re.sub(r"\s+", " ", clean_text).strip()

        # Erweiterte Stoppwort-Liste
        stop_words = {
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
            "of", "with", "by", "from", "up", "about", "into", "through", "during",
            "before", "after", "above", "below", "between", "among", "this", "that",
            "these", "those", "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
            "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself",
            "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their",
            "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these",
            "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has",
            "had", "having", "do", "does", "did", "doing", "will", "would", "should", "could",
            "can", "may", "might", "must", "shall", "get", "got", "getting", "make", "made",
            "making", "take", "took", "taking", "go", "went", "going", "come", "came", "coming"
        }

        # Extract words (minimum 3 characters)
        words = [word for word in clean_text.split() if len(word) >= 3 and word not in stop_words and not word.isdigit()]

        # Count word frequencies
        word_count = {}
        for word in words:
            word_count[word] = word_count.get(word, 0) + 1

        # Return sorted by frequency with additional metrics
        sorted_words = sorted(word_count.items(), key=lambda x: x[1], reverse=True)[:20]
        return [
            {
                "word": word,
                "count": count,
                "relevance": self.calculate_word_relevance(word),
                "trending_potential": self.calculate_trending_potential(word)
            }
            for word, count in sorted_words
        ]

    def calculate_word_relevance(self, word: str) -> float:
        """Berechne Wortrelevanz"""
        # Prüfe auf Tech/Trending-Begriffe
        trending_keywords = [
            "ai", "artificial intelligence", "machine learning", "breakthrough", "revolutionary",
            "new", "latest", "update", "release", "launch", "announcement", "trend", "viral"
        ]

        return 1.0 if any(tk.lower() in word.lower() for tk in trending_keywords) else 0.5

    def calculate_trending_potential(self, word: str) -> float:
        """Berechne Trending-Potential eines Wortes"""
        # Einfache Heuristik basierend auf Worttyp
        if len(word) > 10:
            return 0.3  # Lange Wörter seltener
        if len(word) < 4:
            return 0.7   # Kurze Wörter häufiger
        return 0.5      # Standard

    def categorize_content(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Erweiterte Inhaltskategorisierung"""
        text = f"{content.get('title', '')} {content.get('content', '')}".lower()
        scores = {}

        for category, data in self.categories.items():
            score = 0
            for keyword in data["keywords"]:
                matches = len(re.findall(keyword, text))
                score += matches * data["weight"]
            if score > 0:
                scores[category] = score

        # Return primary category (highest score)
        if not scores:
            return {"category": "general", "confidence": 0}

        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        primary = sorted_scores[0]

        # Berechne Konfidenz
        total_score = sum(score for _, score in sorted_scores)
        confidence = primary[1] / total_score if total_score > 0 else 0

        return {
            "category": primary[0],
            "confidence": confidence,
            "scores": dict(sorted_scores)
        }

    def analyze_sentiment(self, text: str) -> float:
        """Sentiment-Analyse"""
        words = text.lower().split()
        positive = sum(1 for word in words if word in self.sentiment_words["positive"])
        negative = sum(1 for word in words if word in self.sentiment_words["negative"])

        total = positive + negative
        if total == 0:
            return 0  # Neutral

        return (positive - negative) / total  # -1 bis 1

    def calculate_trending_score(self, keyword_data: Dict[str, Any]) -> float:
        """Berechne Trending-Score für ein Thema"""
        weights = self.scoring_weights

        # Normalize values
        normalized_mentions = min(keyword_data.get("mentions", 0) / 20, 1)  # Max 20 mentions = 1.0
        normalized_time_spread = min(keyword_data.get("time_spread", 0) / 72, 1)  # Max 72 hours = 1.0
        normalized_engagement = min(keyword_data.get("avg_engagement", 0) / 1000, 1)  # Max 1000 engagement = 1.0
        normalized_viral = min(keyword_data.get("avg_viral_potential", 0) / 10, 1)  # Max 10 viral score = 1.0
        normalized_momentum = min(keyword_data.get("momentum", 0) / 5, 1)  # Max 5 momentum = 1.0
        normalized_sentiment = (keyword_data.get("avg_sentiment", 0) + 1) / 2  # -1 bis 1 -> 0 bis 1

        score = (
            normalized_engagement * weights["engagement"] +
            normalized_viral * weights["viral_potential"] +
            normalized_time_spread * weights["recency"] +
            normalized_mentions * weights["cross_platform"] +
            normalized_momentum * weights["momentum"] +
            normalized_sentiment * weights["sentiment"] +
            keyword_data.get("relevance", 0) * weights["keyword_relevance"]
        )

        return round(score * 100) / 100

    async def analyze_trends(self) -> Dict[str, Any]:
        """Erweiterte Trendanalyse"""
        logger.info("📈 Starting advanced trend analysis...")

        content = self.get_latest_scraped_content(self.analysis_config["time_window"])

        if not content:
            logger.info("⚠️ No content available for trend analysis")
            return {"trends": [], "topics": [], "analysis": None}

        logger.info(f"📊 Analyzing {len(content)} content items...")

        # Extract all keywords from all content
        keyword_data = {}
        topic_data = {}

        for item in content:
            # Skip low-engagement content
            if item.get("engagement", 0) < self.analysis_config["min_engagement"]:
                continue

            # Extract keywords
            keywords = self.extract_keywords(f"{item.get('title', '')} {item.get('content', '')}")
            for kw_data in keywords:
                word = kw_data["word"]
                count = kw_data["count"]
                relevance = kw_data["relevance"]
                trending_potential = kw_data["trending_potential"]

                if word not in keyword_data:
                    keyword_data[word] = {
                        "word": word,
                        "mentions": 0,
                        "total_count": 0,
                        "sources": set(),
                        "items": [],
                        "total_engagement": 0,
                        "total_viral_potential": 0,
                        "total_sentiment": 0,
                        "first_seen": item.get("created", ""),
                        "last_seen": item.get("created", ""),
                        "relevance": relevance,
                        "trending_potential": trending_potential
                    }

                kd = keyword_data[word]
                kd["mentions"] += 1
                kd["total_count"] += count
                kd["sources"].add(item.get("source", ""))
                kd["items"].append(item)
                kd["total_engagement"] += item.get("engagement", 0)
                kd["total_viral_potential"] += item.get("viral_potential", 0)
                kd["total_sentiment"] += self.analyze_sentiment(f"{item.get('title', '')} {item.get('content', '')}")

                if item.get("created", "") < kd["first_seen"]:
                    kd["first_seen"] = item.get("created", "")
                if item.get("created", "") > kd["last_seen"]:
                    kd["last_seen"] = item.get("created", "")

            # Categorize content
            category_result = self.categorize_content(item)
            category = category_result["category"]

            if category not in topic_data:
                topic_data[category] = {
                    "category": category,
                    "items": [],
                    "total_engagement": 0,
                    "total_viral_potential": 0,
                    "total_sentiment": 0,
                    "avg_score": 0
                }

            topic_data[category]["items"].append(item)
            topic_data[category]["total_engagement"] += item.get("engagement", 0)
            topic_data[category]["total_viral_potential"] += item.get("viral_potential", 0)
            topic_data[category]["total_sentiment"] += self.analyze_sentiment(f"{item.get('title', '')} {item.get('content', '')}")

        # Calculate trending scores for keywords
        trends = []
        for kd in keyword_data.values():
            if kd["mentions"] >= self.analysis_config["trending_threshold"]:
                first_seen = datetime.fromisoformat(kd["first_seen"].replace("Z", "+00:00")) if kd["first_seen"] else datetime.now()
                last_seen = datetime.fromisoformat(kd["last_seen"].replace("Z", "+00:00")) if kd["last_seen"] else datetime.now()
                time_spread = (last_seen - first_seen).total_seconds() / (60 * 60)  # hours

                avg_engagement = kd["total_engagement"] / kd["mentions"] if kd["mentions"] > 0 else 0
                avg_viral_potential = kd["total_viral_potential"] / kd["mentions"] if kd["mentions"] > 0 else 0
                avg_sentiment = kd["total_sentiment"] / kd["mentions"] if kd["mentions"] > 0 else 0
                momentum = kd["mentions"] / time_spread if time_spread > 0 else kd["mentions"]

                trend_data = {
                    "word": kd["word"],
                    "mentions": kd["mentions"],
                    "sources": list(kd["sources"]),
                    "cross_platform": len(kd["sources"]) > 1,
                    "total_engagement": kd["total_engagement"],
                    "avg_engagement": round(avg_engagement),
                    "avg_viral_potential": round(avg_viral_potential * 10) / 10,
                    "avg_sentiment": round(avg_sentiment * 100) / 100,
                    "time_spread": round(time_spread * 10) / 10,
                    "momentum": momentum,
                    "first_seen": kd["first_seen"],
                    "last_seen": kd["last_seen"],
                    "relevance": kd["relevance"],
                    "trending_potential": kd["trending_potential"],
                    "sample_titles": [item.get("title", "") for item in kd["items"][:3]]
                }

                trend_data["trending_score"] = self.calculate_trending_score(trend_data)
                trends.append(trend_data)

        # Sort by trending score and limit to max_trends
        trends.sort(key=lambda x: x["trending_score"], reverse=True)
        trends = trends[:self.analysis_config["max_trends"]]

        # Calculate topic scores
        topics = []
        for td in topic_data.values():
            td["avg_score"] = td["total_engagement"] / len(td["items"]) if td["items"] else 0
            td["avg_viral_potential"] = td["total_viral_potential"] / len(td["items"]) if td["items"] else 0
            td["avg_sentiment"] = td["total_sentiment"] / len(td["items"]) if td["items"] else 0
            topics.append(td)

        topics.sort(key=lambda x: x["avg_score"], reverse=True)

        # Analysis summary
        analysis = {
            "total_content": len(content),
            "time_window": self.analysis_config["time_window"],
            "trends_found": len(trends),
            "topics_analyzed": len(topics),
            "sources": list(set(item.get("source", "") for item in content)),
            "top_trend": trends[0] if trends else None,
            "hottest_topic": topics[0] if topics else None,
            "avg_engagement": round(sum(item.get("engagement", 0) for item in content) / len(content)) if content else 0,
            "analysis_time": datetime.now().isoformat()
        }

        # Generiere Vorhersagen
        predictions = await self.generate_trend_predictions(trends)

        # Save results
        await self.save_trend_analysis({"trends": trends, "topics": topics, "analysis": analysis, "predictions": predictions})

        logger.info(f"🎉 Trend analysis completed: {len(trends)} trends, {len(topics)} topics")

        return {"trends": trends, "topics": topics, "analysis": analysis, "predictions": predictions}

    async def generate_trend_predictions(self, current_trends: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generiere Trendvorhersagen mit KI-Modell (vereinfachte Implementierung)"""
        try:
            logger.info("🔮 Generating trend predictions...")

            predictions = []

            # Für jede aktuelle Trendvorhersage
            for trend in current_trends[:10]:  # Nur Top 10
                # Berechne Wachstumstrend basierend auf Momentum und Engagement
                growth_rate = self.calculate_growth_rate(trend)
                predicted_score = min(10, trend["trending_score"] * (1 + growth_rate))
                confidence = min(1, trend["mentions"] / 20 + (0.3 if trend["cross_platform"] else 0))

                predictions.append({
                    "keyword": trend["word"],
                    "current_score": trend["trending_score"],
                    "predicted_score": round(predicted_score * 100) / 100,
                    "growth_rate": round(growth_rate * 100) / 100,
                    "confidence": round(confidence * 100) / 100,
                    "prediction_window": self.analysis_config["prediction_window"],
                    "predicted_at": datetime.now().isoformat()
                })

            # Speichere Vorhersagen
            await self.save_predictions(predictions)

            return predictions
        except Exception as e:
            logger.error(f"❌ Failed to generate trend predictions: {e}")
            return []

    def calculate_growth_rate(self, trend: Dict[str, Any]) -> float:
        """Berechne Wachstumsrate für Vorhersagen"""
        # Einfache Heuristik basierend auf Momentum und Engagement
        momentum_factor = min(1, trend.get("momentum", 0) / 5)
        engagement_factor = min(1, trend.get("avg_engagement", 0) / 500)
        cross_platform_factor = 0.5 if trend.get("cross_platform", False) else 0

        return (momentum_factor + engagement_factor + cross_platform_factor) / 3

    async def save_predictions(self, predictions: List[Dict[str, Any]]) -> None:
        """Speichere Trendvorhersagen"""
        try:
            timestamp = datetime.now().isoformat().replace(":", "-").replace(".", "-")
            filename = f"trend-predictions-{timestamp}.json"
            filepath = self.predictions_dir / filename

            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(predictions, f, indent=2, ensure_ascii=False)

            logger.info(f"💾 Saved trend predictions to {filename}")
        except Exception as e:
            logger.error(f"❌ Failed to save trend predictions: {e}")

    async def save_trend_analysis(self, results: Dict[str, Any]) -> None:
        """Save trend analysis results"""
        timestamp = datetime.now().isoformat().replace(":", "-").replace(".", "-")
        filename = f"trend-analysis-{timestamp}.json"
        filepath = self.trends_dir / filename

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        logger.info(f"💾 Saved trend analysis to {filename}")

        # Speichere auch detaillierten Bericht
        await self.generate_detailed_report(results, timestamp)

        # Keep only last 20 files
        self.cleanup_old_trend_files()

    async def generate_detailed_report(self, results: Dict[str, Any], timestamp: str) -> None:
        """Generiere detaillierten Bericht"""
        try:
            report = {
                **results,
                "generated_at": datetime.now().isoformat(),
                "summary": {
                    "total_trends": len(results["trends"]),
                    "total_topics": len(results["topics"]),
                    "avg_trending_score": round(sum(t.get("trending_score", 0) for t in results["trends"]) / len(results["trends"]) * 100) / 100 if results["trends"] else 0,
                    "top_sources": results["analysis"]["sources"][:5] if results["analysis"] else [],
                    "trending_categories": self.get_trending_categories(results["trends"])
                },
                "recommendations": self.generate_recommendations(results)
            }

            filename = f"trend-report-{timestamp}.json"
            filepath = self.reports_dir / filename

            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(report, f, indent=2, ensure_ascii=False)

            logger.info(f"📊 Generated detailed trend report: {filename}")
        except Exception as e:
            logger.error(f"❌ Failed to generate detailed report: {e}")

    def get_trending_categories(self, trends: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Ermittle trendende Kategorien"""
        category_count = {}

        for trend in trends:
            # Versuche, die Kategorie aus dem Keyword abzuleiten
            category = self.derive_category_from_keyword(trend["word"])
            if category:
                category_count[category] = category_count.get(category, 0) + 1

        # Sort by count and return top 5
        sorted_categories = sorted(category_count.items(), key=lambda x: x[1], reverse=True)[:5]
        return [{"category": category, "count": count} for category, count in sorted_categories]

    def derive_category_from_keyword(self, keyword: str) -> Optional[str]:
        """Leite Kategorie aus Keyword ab"""
        for category, data in self.categories.items():
            if any(kw in keyword.lower() for kw in data["keywords"]):
                return category
        return None

    def generate_recommendations(self, results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generiere Empfehlungen basierend auf der Analyse"""
        recommendations = []

        # Empfehlung basierend auf Top-Trend
        if results.get("trends"):
            top_trend = results["trends"][0]
            recommendations.append({
                "type": "content",
                "priority": "high",
                "message": f"Top-Trend: \"{top_trend['word']}\" mit Score {top_trend['trending_score']}. Erwägen Sie Inhalte zu diesem Thema zu erstellen."
            })

        # Empfehlung basierend auf Kategorien
        if results.get("topics"):
            hottest_topic = results["topics"][0]
            recommendations.append({
                "type": "strategy",
                "priority": "medium",
                "message": f"Hottest Topic: \"{hottest_topic['category']}\" mit durchschnittlichem Score {round(hottest_topic['avg_score'])}. Fokus auf diese Kategorie."
            })

        # Allgemeine Empfehlung
        recommendations.append({
            "type": "optimization",
            "priority": "low",
            "message": "Erwägen Sie die Integration externer Datenquellen für genauere Trendvorhersagen."
        })

        return recommendations

    def cleanup_old_trend_files(self) -> None:
        """Cleanup old trend files"""
        try:
            # Bereinige Haupt-Trend-Dateien
            trend_files = []
            if self.trends_dir.exists():
                for f in self.trends_dir.iterdir():
                    if f.name.startswith("trend-analysis-") and f.suffix == ".json":
                        mtime = datetime.fromtimestamp(f.stat().st_mtime)
                        trend_files.append({"name": f.name, "path": f, "mtime": mtime})

                # Sort by modification time (newest first)
                trend_files.sort(key=lambda x: x["mtime"], reverse=True)

                # Remove files beyond the limit
                for file_info in trend_files[20:]:
                    file_info["path"].unlink()

            # Bereinige Vorhersage-Dateien
            prediction_files = []
            if self.predictions_dir.exists():
                for f in self.predictions_dir.iterdir():
                    if f.name.startswith("trend-predictions-") and f.suffix == ".json":
                        mtime = datetime.fromtimestamp(f.stat().st_mtime)
                        prediction_files.append({"name": f.name, "path": f, "mtime": mtime})

                # Sort by modification time (newest first)
                prediction_files.sort(key=lambda x: x["mtime"], reverse=True)

                # Remove files beyond the limit
                for file_info in prediction_files[50:]:
                    file_info["path"].unlink()

            # Bereinige Berichts-Dateien
            report_files = []
            if self.reports_dir.exists():
                for f in self.reports_dir.iterdir():
                    if f.name.startswith("trend-report-") and f.suffix == ".json":
                        mtime = datetime.fromtimestamp(f.stat().st_mtime)
                        report_files.append({"name": f.name, "path": f, "mtime": mtime})

                # Sort by modification time (newest first)
                report_files.sort(key=lambda x: x["mtime"], reverse=True)

                # Remove files beyond the limit
                for file_info in report_files[30:]:
                    file_info["path"].unlink()
        except Exception as e:
            logger.warning(f"⚠️ Trend cleanup failed: {e}")

    def get_latest_trends(self) -> Optional[Dict[str, Any]]:
        """Get latest trend analysis"""
        try:
            files = []
            if self.trends_dir.exists():
                for f in self.trends_dir.iterdir():
                    if f.name.startswith("trend-analysis-") and f.suffix == ".json":
                        files.append(f.name)

            files.sort(reverse=True)

            if not files:
                return None

            latest_file = self.trends_dir / files[0]
            with open(latest_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"⚠️ Failed to load latest trends: {e}")
            return None

    def get_latest_predictions(self) -> Optional[List[Dict[str, Any]]]:
        """Get latest predictions"""
        try:
            files = []
            if self.predictions_dir.exists():
                for f in self.predictions_dir.iterdir():
                    if f.name.startswith("trend-predictions-") and f.suffix == ".json":
                        files.append(f.name)

            files.sort(reverse=True)

            if not files:
                return None

            latest_file = self.predictions_dir / files[0]
            with open(latest_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"⚠️ Failed to load latest predictions: {e}")
            return None

    def get_stats(self) -> Dict[str, Any]:
        """Get service statistics"""
        try:
            trend_files = []
            if self.trends_dir.exists():
                for f in self.trends_dir.iterdir():
                    if f.name.startswith("trend-analysis-") and f.suffix == ".json":
                        trend_files.append(f.name)

            prediction_files = []
            if self.predictions_dir.exists():
                for f in self.predictions_dir.iterdir():
                    if f.name.startswith("trend-predictions-") and f.suffix == ".json":
                        prediction_files.append(f.name)

            report_files = []
            if self.reports_dir.exists():
                for f in self.reports_dir.iterdir():
                    if f.name.startswith("trend-report-") and f.suffix == ".json":
                        report_files.append(f.name)

            latest = self.get_latest_trends()

            return {
                "total_analyses": len(trend_files),
                "total_predictions": len(prediction_files),
                "total_reports": len(report_files),
                "latest_analysis": latest["analysis"]["analysis_time"] if latest and latest.get("analysis") else None,
                "current_trends": len(latest["trends"]) if latest and latest.get("trends") else 0,
                "current_topics": len(latest["topics"]) if latest and latest.get("topics") else 0,
                "top_trend": latest["trends"][0]["word"] if latest and latest.get("trends") else None,
                "top_trend_score": latest["trends"][0]["trending_score"] if latest and latest.get("trends") else 0,
                "analysis_config": self.analysis_config
            }
        except Exception as e:
            logger.error(f"❌ Failed to get trend analysis stats: {e}")
            return {
                "total_analyses": 0,
                "total_predictions": 0,
                "total_reports": 0,
                "error": str(e)
            }

    async def realtime_trend_analysis(self, new_content: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Echtzeit-Trend-Analyse (simulierte Implementierung)"""
        try:
            logger.info("⚡ Performing realtime trend analysis...")

            # Führe eine schnelle Analyse des neuen Inhalts durch
            keywords = self.extract_keywords(f"{new_content.get('title', '')} {new_content.get('content', '')}")
            category = self.categorize_content(new_content)
            sentiment = self.analyze_sentiment(f"{new_content.get('title', '')} {new_content.get('content', '')}")

            # Prüfe, ob neue Trends entstehen
            emerging_trends = [kw for kw in keywords if kw["trending_potential"] > 0.7]

            result = {
                "content_id": new_content.get("id", ""),
                "keywords": [kw["word"] for kw in keywords],
                "category": category["category"],
                "sentiment": round(sentiment * 100) / 100,
                "emerging_trends": [t["word"] for t in emerging_trends],
                "analyzed_at": datetime.now().isoformat()
            }

            # Speichere Echtzeit-Ergebnis im Cache
            cache_file = self.cache_dir / f"realtime-{int(datetime.now().timestamp())}.json"
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2, ensure_ascii=False)

            return result
        except Exception as e:
            logger.error(f"❌ Failed to perform realtime trend analysis: {e}")
            return None

    def export_trends(self, format_type: str = "json") -> Dict[str, Any]:
        """Export trends for external use"""
        try:
            latest_trends = self.get_latest_trends()
            if not latest_trends:
                raise Exception("No trends available for export")

            export_data = {
                "exported_at": datetime.now().isoformat(),
                "trends": latest_trends["trends"],
                "topics": latest_trends["topics"],
                "predictions": self.get_latest_predictions()
            }

            exported_content = ""
            file_extension = ""

            if format_type.lower() == "json":
                exported_content = json.dumps(export_data, indent=2, ensure_ascii=False)
                file_extension = "json"
            elif format_type.lower() == "csv":
                # Konvertiere zu CSV-Format
                if export_data["trends"]:
                    headers = ",".join(export_data["trends"][0].keys())
                    rows = []
                    for trend in export_data["trends"]:
                        row_values = []
                        for value in trend.values():
                            if isinstance(value, (list, dict)):
                                row_values.append(json.dumps(value))
                            else:
                                row_values.append(str(value))
                        rows.append(",".join(row_values))
                    exported_content = "\n".join([headers] + rows)
                file_extension = "csv"
            else:
                raise Exception(f"Unsupported export format: {format_type}")

            timestamp = datetime.now().isoformat().replace(":", "-").replace(".", "-")
            filename = f"trends-export-{timestamp}.{file_extension}"
            filepath = self.trends_dir / filename

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(exported_content)

            logger.info(f"📤 Exported trends to {filename}")

            return {
                "success": True,
                "path": str(filepath),
                "format": format_type
            }
        except Exception as e:
            logger.error(f"❌ Failed to export trends: {e}")
            return {
                "success": False,
                "error": str(e)
            }


# Main execution
if __name__ == "__main__":
    agent = TrendAnalysisAgent()
    logger.info("🎬 Trend Analysis Agent initialized")

    # Example usage
    logger.info(f"📊 Analysis config: {agent.analysis_config['time_window']}h time window")
    logger.info(f"📁 Data directory: {agent.data_dir}")
    logger.info(f"📁 Trends directory: {agent.trends_dir}")