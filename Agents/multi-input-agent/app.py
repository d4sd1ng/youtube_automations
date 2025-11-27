#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Multi-Input Service
Handles processing of multiple input sources
"""

import os
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MultiInputService:
    def __init__(self):
        self.inputs_dir = Path(__file__).parent.parent.parent / "data" / "inputs"
        self.processed_dir = self.inputs_dir / "processed"
        self.ensure_directories()

    def ensure_directories(self) -> None:
        """Ensure required directories exist"""
        for directory in [self.inputs_dir, self.processed_dir]:
            directory.mkdir(parents=True, exist_ok=True)

    async def process_multi_input(self, content_id: str, input_data: Dict[str, Any], options: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Process multiple inputs
        """
        try:
            logger.info(f"🔄 Processing multi-input for content: {content_id}")

            # Combine all input sources
            combined_data = self.combine_input_sources(input_data)

            # Analyze content structure
            analysis = self.analyze_content_structure(combined_data)

            # Extract key information
            key_info = self.extract_key_information(combined_data, analysis)

            # Generate metadata
            metadata = {
                "content_id": content_id,
                "sources": input_data.get("sources", []),
                "word_count": len(combined_data["text"]),
                "key_themes": key_info["themes"],
                "key_points": key_info["points"],
                "sentiment": key_info["sentiment"],
                "language": key_info["language"],
                "processing_options": options,
                "processed_at": datetime.now().isoformat()
            }

            # Save processed input
            self.save_processed_input(content_id, combined_data, metadata)

            logger.info(f"✅ Multi-input processing completed for: {content_id}")

            return {
                "content_id": content_id,
                "combined_data": combined_data,
                "metadata": metadata,
                "analysis": analysis,
                "key_info": key_info
            }
        except Exception as error:
            logger.error(f"❌ Multi-input processing failed: {error}")
            raise error

    def combine_input_sources(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Combine multiple input sources into a single data structure
        """
        # Mock implementation - in a real service, this would handle various input types
        text = input_data.get("text", "")
        urls = input_data.get("urls", [])
        files = input_data.get("files", [])

        return {
            "text": text,
            "urls": urls,
            "files": files,
            "combined_text": text + " " + " ".join(urls) + " " + " ".join(files)
        }

    def analyze_content_structure(self, combined_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze content structure
        """
        # Mock implementation - in a real service, this would perform detailed analysis
        text = combined_data["combined_text"]
        words = text.split()
        word_count = len(words)
        sentences = [s for s in text.split(".") if s.strip()]
        sentence_count = len(sentences)
        paragraphs = [p for p in text.split("\n\n") if p.strip()]
        paragraph_count = len(paragraphs)

        return {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "paragraph_count": paragraph_count,
            "average_words_per_sentence": round(word_count / sentence_count) if sentence_count > 0 else 0,
            "average_sentences_per_paragraph": round(sentence_count / paragraph_count) if paragraph_count > 0 else 0
        }

    def extract_key_information(self, combined_data: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract key information from content
        """
        # Mock implementation - in a real service, this would use NLP techniques
        text = combined_data["combined_text"].lower()

        # Simple theme detection (mock)
        themes = []
        if "ai" in text or "artificial intelligence" in text:
            themes.append("AI")
        if "blockchain" in text:
            themes.append("Blockchain")
        if "machine learning" in text:
            themes.append("Machine Learning")
        if "data" in text:
            themes.append("Data Science")

        # Simple point extraction (mock)
        sentences = [s.strip() for s in text.split(".") if len(s.strip()) > 10]
        points = sentences[:5]

        return {
            "themes": themes if themes else ["General"],
            "points": points if points else ["No key points identified"],
            "sentiment": "neutral",  # Would be determined by NLP in a real implementation
            "language": "en"  # Would be detected in a real implementation
        }

    def save_processed_input(self, content_id: str, combined_data: Dict[str, Any], metadata: Dict[str, Any]) -> None:
        """
        Save processed input to file
        """
        try:
            file_path = self.processed_dir / f"{content_id}.json"
            data = {
                "content_id": content_id,
                "combined_data": combined_data,
                "metadata": metadata
            }

            with open(file_path, 'w', encoding='utf-8') as file:
                json.dump(data, file, indent=2, ensure_ascii=False)

            logger.info(f"✅ Processed input saved: {content_id}")
        except Exception as error:
            logger.error(f"❌ Failed to save processed input: {error}")

    def load_processed_input(self, content_id: str) -> Optional[Dict[str, Any]]:
        """
        Load processed input from file
        """
        try:
            file_path = self.processed_dir / f"{content_id}.json"
            if not file_path.exists():
                return None

            with open(file_path, 'r', encoding='utf-8') as file:
                return json.load(file)
        except Exception as error:
            logger.error(f"❌ Failed to load processed input: {error}")
            return None


# Main execution
if __name__ == "__main__":
    service = MultiInputService()
    logger.info("🎬 Multi-Input Service initialized")

    # Example usage
    logger.info(f"📁 Inputs directory: {service.inputs_dir}")
    logger.info(f"📁 Processed directory: {service.processed_dir}")