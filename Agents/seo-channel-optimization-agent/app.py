#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
SEO Channel Optimization Agent
Service for creating channel-specific SEO-compliant descriptions and keywords
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, List
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SEOChannelOptimizationAgent:
    def __init__(self):
        self.default_config = {
            "language": "de",
            "max_description_length": 5000,
            "max_title_length": 100,
            "max_tags": 30,
            "target_keywords": [],
            "exclude_words": ["sex", "porn", "casino", "gambling"]
        }
        
        # Data directory
        self.data_dir = Path(__file__).parent / "data"
        self.data_dir.mkdir(exist_ok=True)
    
    def generate_channel_description(self, channel_data: Dict[str, Any], config: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Create an SEO-compliant channel description
        
        Args:
            channel_data (Dict[str, Any]): Channel information
            config (Dict[str, Any]): Configuration options
            
        Returns:
            Dict[str, Any]: SEO-optimized channel description
        """
        merged_config = {**self.default_config, **config}
        
        try:
            # Create channel description based on provided data
            description = self._create_channel_description(channel_data, merged_config)
            keywords = self._extract_channel_keywords(channel_data, merged_config)
            tags = self._generate_channel_tags(channel_data, merged_config)
            
            return {
                "success": True,
                "description": description,
                "keywords": keywords,
                "tags": tags,
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "language": merged_config["language"],
                    "target_audience": channel_data.get("target_audience", "Allgemeines Publikum")
                }
            }
        except Exception as e:
            logger.error(f"Error creating channel description: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "description": "",
                "keywords": [],
                "tags": []
            }
    
    def generate_channel_keywords(self, channel_data: Dict[str, Any], config: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Extract keywords for the channel
        
        Args:
            channel_data (Dict[str, Any]): Channel information
            config (Dict[str, Any]): Configuration options
            
        Returns:
            Dict[str, Any]: SEO-optimized channel keywords
        """
        merged_config = {**self.default_config, **config}
        
        try:
            keywords = self._extract_channel_keywords(channel_data, merged_config)
            
            return {
                "success": True,
                "keywords": keywords,
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "language": merged_config["language"]
                }
            }
        except Exception as e:
            logger.error(f"Error generating channel keywords: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "keywords": []
            }
    
    def _create_channel_description(self, channel_data: Dict[str, Any], config: Dict[str, Any]) -> str:
        """
        Create a channel description
        
        Args:
            channel_data (Dict[str, Any]): Channel information
            config (Dict[str, Any]): Configuration
            
        Returns:
            str: Channel description
        """
        channel_name = channel_data.get("channel_name", "")
        description = channel_data.get("description", "")
        niche = channel_data.get("niche", "")
        target_audience = channel_data.get("target_audience", "")
        
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
    
    def _extract_channel_keywords(self, channel_data: Dict[str, Any], config: Dict[str, Any]) -> List[str]:
        """
        Extract channel keywords
        
        Args:
            channel_data (Dict[str, Any]): Channel information
            config (Dict[str, Any]): Configuration
            
        Returns:
            List[str]: Keywords
        """
        keywords = set()
        
        if channel_data.get("channel_name"):
            keywords.add(channel_data["channel_name"])
        
        if channel_data.get("niche"):
            keywords.add(channel_data["niche"])
        
        if channel_data.get("target_audience"):
            for word in channel_data["target_audience"].split():
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
    
    def _generate_channel_tags(self, channel_data: Dict[str, Any], config: Dict[str, Any]) -> List[str]:
        """
        Generate channel tags
        
        Args:
            channel_data (Dict[str, Any]): Channel information
            config (Dict[str, Any]): Configuration
            
        Returns:
            List[str]: Tags
        """
        tags = set()
        
        if channel_data.get("channel_name"):
            tags.add(channel_data["channel_name"].replace(" ", ""))
        
        if channel_data.get("niche"):
            tags.add(channel_data["niche"].replace(" ", ""))
        
        # Add general tags
        general_tags = ["YouTube", "Kanal", "Video", "Content"]
        for tag in general_tags:
            tags.add(tag)
        
        return list(tags)[:config["max_tags"]]

# Main execution
if __name__ == "__main__":
    agent = SEOChannelOptimizationAgent()
    print("SEO Channel Optimization Agent initialized")