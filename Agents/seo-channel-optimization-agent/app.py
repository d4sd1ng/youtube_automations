import asyncio
from typing import Dict, Any, List, Optional, Set
from datetime import datetime
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SEOChannelOptimizationService:
    def __init__(self, options: Dict[str, Any] = None):
        """
        Initialize SEO Channel Optimization Service
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

    async def generate_channel_description(self, channel_data: Dict[str, Any], config: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Creates an SEO-compliant channel description
        :param channel_data: Channel information
        :param config: Configuration options
        :return: SEO-optimized channel description
        """
        if config is None:
            config = {}

        merged_config = {**self.default_config, **config}

        try:
            # Create channel description based on provided data
            description = self.create_channel_description(channel_data, merged_config)
            keywords = self.extract_channel_keywords(channel_data, merged_config)
            tags = self.generate_channel_tags(channel_data, merged_config)

            return {
                "success": True,
                "description": description,
                "keywords": keywords,
                "tags": tags,
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "language": merged_config["language"],
                    "target_audience": channel_data.get("targetAudience", "Allgemeines Publikum")
                }
            }
        except Exception as error:
            logger.error(f"Fehler bei der Kanalbeschreibungserstellung: {error}")
            return {
                "success": False,
                "error": str(error),
                "description": "",
                "keywords": [],
                "tags": []
            }

    async def generate_channel_keywords(self, channel_data: Dict[str, Any], config: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Extracts keywords for the channel
        :param channel_data: Channel information
        :param config: Configuration options
        :return: SEO-optimized channel keywords
        """
        if config is None:
            config = {}

        merged_config = {**self.default_config, **config}

        try:
            keywords = self.extract_channel_keywords(channel_data, merged_config)

            return {
                "success": True,
                "keywords": keywords,
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "language": merged_config["language"]
                }
            }
        except Exception as error:
            logger.error(f"Fehler bei der Kanal-Keywords-Generierung: {error}")
            return {
                "success": False,
                "error": str(error),
                "keywords": []
            }

    def create_channel_description(self, channel_data: Dict[str, Any], config: Dict[str, Any]) -> str:
        """
        Creates a channel description
        :param channel_data: Channel information
        :param config: Configuration
        :return: Channel description
        """
        channel_name = channel_data.get("channelName", "")
        description = channel_data.get("description", "")
        niche = channel_data.get("niche", "")
        target_audience = channel_data.get("targetAudience", "")

        desc = f"Willkommen auf dem offiziellen Kanal von {channel_name or 'Unserem Kanal'}!\n\n"

        if description:
            desc += f"{description}\n\n"

        if niche:
            desc += f"Inhalt: {niche}\n\n"

        if target_audience:
            desc += f"Zielgruppe: {target_audience}\n\n"

        desc += "Abonniere für wöchentliche Updates zu spannenden Themen!\n\n"
        desc += "#YouTube #Kanal #Abonnieren"

        # Truncate to maximum length
        return desc[:config["max_description_length"]]

    def extract_channel_keywords(self, channel_data: Dict[str, Any], config: Dict[str, Any]) -> List[str]:
        """
        Extracts channel keywords
        :param channel_data: Channel information
        :param config: Configuration
        :return: Keywords
        """
        keywords: Set[str] = set()

        if channel_data.get("channelName"):
            keywords.add(channel_data["channelName"])

        if channel_data.get("niche"):
            keywords.add(channel_data["niche"])

        if channel_data.get("targetAudience"):
            for word in channel_data["targetAudience"].split():
                if len(word) > 3:
                    keywords.add(word)

        # Add target keywords
        for keyword in config["target_keywords"]:
            keywords.add(keyword)

        # Filter excluded words
        filtered_keywords = [
            keyword for keyword in keywords
            if keyword.lower() not in [word.lower() for word in config["exclude_words"]]
        ]

        return filtered_keywords[:30]

    def generate_channel_tags(self, channel_data: Dict[str, Any], config: Dict[str, Any]) -> List[str]:
        """
        Generates channel tags
        :param channel_data: Channel information
        :param config: Configuration
        :return: Tags
        """
        tags: Set[str] = set()

        if channel_data.get("channelName"):
            # Remove spaces from channel name for tag
            tags.add(re.sub(r'\s+', '', channel_data["channelName"]))

        if channel_data.get("niche"):
            # Remove spaces from niche for tag
            tags.add(re.sub(r'\s+', '', channel_data["niche"]))

        # Add general tags
        general_tags = ["YouTube", "Kanal", "Video", "Content"]
        for tag in general_tags:
            tags.add(tag)

        return list(tags)[:config["max_tags"]]

if __name__ == "__main__":
    # Example usage
    async def main():
        seo_service = SEOChannelOptimizationService()
        print("SEO Channel Optimization Agent initialized successfully!")

        # Example channel data
        example_data = {
            "channelName": "TechReviewsDE",
            "description": "Deutschsprachiger Technikkanal mit Reviews und Tests",
            "niche": "Technologie",
            "targetAudience": "Technikinteressierte Jugendliche und Erwachsene"
        }

        try:
            result = await seo_service.generate_channel_description(example_data)
            print(f"Channel description result: {result}")
        except Exception as e:
            print(f"❌ Failed to generate channel description: {e}")

    asyncio.run(main())