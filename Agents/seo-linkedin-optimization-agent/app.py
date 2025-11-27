import asyncio
from typing import Dict, Any, List, Optional, Set
from datetime import datetime
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SEOLinkedInOptimizationService:
    def __init__(self, options: Dict[str, Any] = None):
        """
        Initialize SEO LinkedIn Optimization Service
        :param options: Configuration options
        """
        if options is None:
            options = {}

        self.default_config = {
            "language": options.get("language", "de"),
            "max_description_length": options.get("max_description_length", 3000),
            "max_title_length": options.get("max_title_length", 200),
            "max_tags": options.get("max_tags", 15),
            "target_keywords": options.get("target_keywords", []),
            "exclude_words": options.get("exclude_words", ["sex", "porn", "casino", "gambling"])
        }

    async def generate_linkedin_post_description(self, post_data: Dict[str, Any], config: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Creates an SEO-compliant description for LinkedIn posts
        :param post_data: Post data
        :param config: Configuration options
        :return: SEO-optimized LinkedIn post description
        """
        if config is None:
            config = {}

        merged_config = {**self.default_config, **config}

        try:
            # For LinkedIn we use a more professional language
            merged_config["language"] = "de"  # LinkedIn posts in German

            description = self.create_linkedin_description(post_data, merged_config)
            title = self.optimize_post_title(post_data.get("title", ""), merged_config)
            tags = self.generate_linkedin_tags(post_data, merged_config)
            keywords = self.extract_linkedin_keywords(post_data, merged_config)

            return {
                "success": True,
                "title": title,
                "description": description,
                "tags": tags,
                "keywords": keywords,
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "platform": "linkedin",
                    "language": merged_config["language"]
                }
            }
        except Exception as error:
            logger.error(f"Fehler bei der LinkedIn-Post-Beschreibungserstellung: {error}")
            return {
                "success": False,
                "error": str(error),
                "title": post_data.get("title", ""),
                "description": "",
                "tags": [],
                "keywords": []
            }

    def create_linkedin_description(self, post_data: Dict[str, Any], config: Dict[str, Any]) -> str:
        """
        Creates a LinkedIn description
        :param post_data: Post data
        :param config: Configuration
        :return: LinkedIn description
        """
        title = post_data.get("title", "")
        content = post_data.get("content", "")
        key_points = post_data.get("keyPoints", [])
        call_to_action = post_data.get("callToAction", "")

        desc = f"{title or 'Professioneller Inhalt'}\n\n"

        if content:
            desc += f"{content}\n\n"

        if key_points and len(key_points) > 0:
            desc += "Schlüsselpunkte:\n"
            for point in key_points:
                desc += f"• {point}\n"
            desc += "\n"

        if call_to_action:
            desc += f"{call_to_action}\n\n"

        desc += "Weitere Insights: [Folgen Sie uns]\n"
        desc += "Diskussion: [Kommentare erwünscht]"

        return desc[:config["max_description_length"]]

    def optimize_post_title(self, title: str, config: Dict[str, Any]) -> str:
        """
        Optimizes the post title
        :param title: Original title
        :param config: Configuration
        :return: Optimized title
        """
        # For LinkedIn we use a more professional formatting
        cleaned_title = re.sub(r'[^\w\s\-äöüÄÖÜß:]', '', title)  # Allow colon for professional titles
        return cleaned_title[:config["max_title_length"]]

    def extract_linkedin_keywords(self, post_data: Dict[str, Any], config: Dict[str, Any]) -> List[str]:
        """
        Extracts LinkedIn keywords
        :param post_data: Post data
        :param config: Configuration
        :return: Keywords
        """
        keywords: Set[str] = set()

        if post_data.get("title"):
            for word in post_data["title"].split():
                if len(word) > 4:  # Longer words for professional context
                    keywords.add(word)

        if post_data.get("industry"):
            keywords.add(post_data["industry"])

        if post_data.get("profession"):
            keywords.add(post_data["profession"])

        # Add target keywords
        for keyword in config["target_keywords"]:
            keywords.add(keyword)

        # Filter excluded words
        filtered_keywords = [
            keyword for keyword in keywords
            if keyword.lower() not in [word.lower() for word in config["exclude_words"]]
        ]

        return filtered_keywords[:20]  # Fewer keywords for LinkedIn

    def generate_linkedin_tags(self, post_data: Dict[str, Any], config: Dict[str, Any]) -> List[str]:
        """
        Generates LinkedIn tags
        :param post_data: Post data
        :param config: Configuration
        :return: Tags
        """
        tags: Set[str] = set()

        if post_data.get("industry"):
            tags.add(post_data["industry"])

        if post_data.get("profession"):
            tags.add(post_data["profession"])

        # Add general business tags
        general_tags = ["Business", "Professional", "Leadership", "Innovation"]
        for tag in general_tags:
            tags.add(tag)

        return list(tags)[:15]  # Fewer tags for LinkedIn

if __name__ == "__main__":
    # Example usage
    async def main():
        seo_service = SEOLinkedInOptimizationService()
        print("SEO LinkedIn Optimization Agent initialized successfully!")

        # Example post data
        example_data = {
            "title": "Wie man effektive LinkedIn-Strategien entwickelt",
            "content": "In diesem Beitrag erfahren Sie, wie Sie Ihre Präsenz auf LinkedIn professionalisieren können.",
            "keyPoints": [
                "Definieren Sie Ihre Zielgruppe klar",
                "Nutzen Sie relevante Keywords",
                "Seien Sie konsistent in Ihrer Posting-Häufigkeit"
            ],
            "callToAction": "Teilen Sie Ihre eigenen Erfahrungen in den Kommentaren!",
            "industry": "Marketing",
            "profession": "Social Media Manager"
        }

        try:
            result = await seo_service.generate_linkedin_post_description(example_data)
            print(f"LinkedIn post description result: {result}")
        except Exception as e:
            print(f"❌ Failed to generate LinkedIn post description: {e}")

    asyncio.run(main())