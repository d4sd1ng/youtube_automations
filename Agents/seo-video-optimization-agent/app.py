import asyncio
from typing import Dict, Any, List, Optional, Set
from datetime import datetime
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SEOVideoOptimizationService:
    def __init__(self, options: Dict[str, Any] = None):
        """
        Initialize SEO Video Optimization Service
        :param options: Configuration options
        """
        if options is None:
            options = {}

        self.default_config = {
            "language": options.get("language", "de"),
            "max_description_length": options.get("max_description_length", 5000),
            "max_title_length": options.get("max_title_length", 100),
            "max_tags": options.get("max_tags", 30),
            "target_keywords": options.get("target_keywords", []),
            "exclude_words": options.get("exclude_words", ["sex", "porn", "casino", "gambling"])
        }

    async def generate_long_form_video_description(self, video_data: Dict[str, Any], config: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Creates an SEO-compliant video description for long-form content
        :param video_data: Video data
        :param config: Configuration options
        :return: SEO-optimized video description
        """
        if config is None:
            config = {}

        merged_config = {**self.default_config, **config}

        try:
            description = self.create_long_form_description(video_data, merged_config)
            title = self.optimize_video_title(video_data.get("title", ""), merged_config)
            tags = self.generate_video_tags(video_data, merged_config)
            keywords = self.extract_video_keywords(video_data, merged_config)

            return {
                "success": True,
                "title": title,
                "description": description,
                "tags": tags,
                "keywords": keywords,
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "content_type": "long-form",
                    "language": merged_config["language"]
                }
            }
        except Exception as error:
            logger.error(f"Fehler bei der Long-Form-Beschreibungserstellung: {error}")
            return {
                "success": False,
                "error": str(error),
                "title": video_data.get("title", ""),
                "description": "",
                "tags": [],
                "keywords": []
            }

    async def generate_shorts_video_description(self, video_data: Dict[str, Any], config: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Creates an SEO-compliant video description for shorts
        :param video_data: Video data
        :param config: Configuration options
        :return: SEO-optimized shorts description
        """
        if config is None:
            config = {}

        merged_config = {**self.default_config, **config}

        try:
            description = self.create_shorts_description(video_data, merged_config)
            title = self.optimize_video_title(video_data.get("title", ""), merged_config)
            tags = self.generate_video_tags(video_data, merged_config)
            keywords = self.extract_video_keywords(video_data, merged_config)

            return {
                "success": True,
                "title": title,
                "description": description,
                "tags": tags,
                "keywords": keywords,
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "content_type": "shorts",
                    "language": merged_config["language"]
                }
            }
        except Exception as error:
            logger.error(f"Fehler bei der Shorts-Beschreibungserstellung: {error}")
            return {
                "success": False,
                "error": str(error),
                "title": video_data.get("title", ""),
                "description": "",
                "tags": [],
                "keywords": []
            }

    def create_long_form_description(self, video_data: Dict[str, Any], config: Dict[str, Any]) -> str:
        """
        Creates a long-form description
        :param video_data: Video data
        :param config: Configuration
        :return: Video description
        """
        title = video_data.get("title", "")
        content = video_data.get("content", "")
        key_points = video_data.get("keyPoints", [])
        call_to_action = video_data.get("callToAction", "")

        desc = f"{title or 'Unbenanntes Video'}\n\n"

        if content:
            desc += f"{content}\n\n"

        if key_points and len(key_points) > 0:
            desc += "Wichtige Punkte:\n"
            for i, point in enumerate(key_points, 1):
                desc += f"{i}. {point}\n"
            desc += "\n"

        if call_to_action:
            desc += f"{call_to_action}\n\n"

        desc += "Mehr Inhalte: [Kanal abonnieren]\n"
        desc += "Diskussion: [Kommentare unten]\n\n"
        desc += "#Video #YouTube #Content"

        return desc[:config["max_description_length"]]

    def create_shorts_description(self, video_data: Dict[str, Any], config: Dict[str, Any]) -> str:
        """
        Creates a shorts description
        :param video_data: Video data
        :param config: Configuration
        :return: Shorts description
        """
        title = video_data.get("title", "")
        content = video_data.get("content", "")

        desc = f"{title or 'Kurzvideo'}\n\n"

        if content:
            desc += f"{content[:200]}...\n\n"

        desc += "Mehr auf unserem Kanal!\n"
        desc += "#Shorts #YouTube #Kurzvideo"

        return desc[:200]  # Shorts have a shorter description

    def optimize_video_title(self, title: str, config: Dict[str, Any]) -> str:
        """
        Optimizes the video title
        :param title: Original title
        :param config: Configuration
        :return: Optimized title
        """
        # Remove unnecessary characters and truncate to maximum length
        cleaned_title = re.sub(r'[^\w\s\-äöüÄÖÜß]', '', title)  # Remove special characters except hyphens
        return cleaned_title[:config["max_title_length"]]

    def extract_video_keywords(self, video_data: Dict[str, Any], config: Dict[str, Any]) -> List[str]:
        """
        Extracts video keywords
        :param video_data: Video data
        :param config: Configuration
        :return: Keywords
        """
        keywords: Set[str] = set()

        if video_data.get("title"):
            for word in video_data["title"].split():
                if len(word) > 3:
                    keywords.add(word)

        if video_data.get("tags"):
            for tag in video_data["tags"]:
                keywords.add(tag)

        # Add target keywords
        for keyword in config["target_keywords"]:
            keywords.add(keyword)

        # Filter excluded words
        filtered_keywords = [
            keyword for keyword in keywords
            if keyword.lower() not in [word.lower() for word in config["exclude_words"]]
        ]

        return filtered_keywords[:30]

    def generate_video_tags(self, video_data: Dict[str, Any], config: Dict[str, Any]) -> List[str]:
        """
        Generates video tags
        :param video_data: Video data
        :param config: Configuration
        :return: Tags
        """
        tags: Set[str] = set()

        if video_data.get("title"):
            for word in video_data["title"].split():
                if len(word) > 3:
                    tags.add(word)

        if video_data.get("category"):
            tags.add(video_data["category"])

        if video_data.get("contentType"):
            tags.add(video_data["contentType"])

        return list(tags)[:config["max_tags"]]

if __name__ == "__main__":
    # Example usage
    async def main():
        seo_service = SEOVideoOptimizationService()
        print("SEO Video Optimization Agent initialized successfully!")

        # Example video data
        example_data = {
            "title": "Wie man effektive YouTube-Videos erstellt",
            "content": "In diesem Video erfahren Sie, wie Sie ansprechende YouTube-Videos produzieren können.",
            "keyPoints": [
                "Gute Planung ist entscheidend",
                "Achten Sie auf eine klare Struktur",
                "Verwenden Sie visuelle Elemente"
            ],
            "callToAction": "Abonnieren Sie unseren Kanal für weitere Tipps!",
            "category": "Bildung",
            "contentType": "Tutorial"
        }

        try:
            result = await seo_service.generate_long_form_video_description(example_data)
            print(f"Video description result: {result}")
        except Exception as e:
            print(f"❌ Failed to generate video description: {e}")

    asyncio.run(main())