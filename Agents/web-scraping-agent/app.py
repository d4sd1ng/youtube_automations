#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Web Scraping Agent
Handles web scraping operations for content discovery
Only uses approved sources: YouTube, Twitter/X, TikTok, Instagram, Bundestag, Landtage, politische Talkshows
"""

import asyncio
import logging
import random
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebScrapingAgent:
    def __init__(self):
        self.weekend_pause = False
        self.user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

        # Approved platforms only
        self.supported_platforms = {
            'youtube': {'name': 'YouTube', 'icon': '▶️'},
            'twitter': {'name': 'Twitter/X', 'icon': '🐦'},
            'tiktok': {'name': 'TikTok', 'icon': '🎵'},
            'instagram': {'name': 'Instagram', 'icon': '📸'},
            'bundestag': {'name': 'Bundestag', 'icon': '🏛️'},
            'landtage': {'name': 'Landtage', 'icon': '🏛️'},
            'politische-talkshows': {'name': 'Politische Talkshows', 'icon': '📺'}
        }

        # Define themes/topics for classification with clear separation
        self.themes = {
            'ki': ['ki', 'künstliche intelligenz', 'ai', 'machine learning', 'algorithmus', 'daten', 'robotik', 'neuronale netze', 'deep learning', 'chatgpt', 'openai'],
            'afd': ['afd', 'alternative für deutschland', 'alice weidel', 'tino chrupalla', 'rechtspopulismus', 'pegida', 'lutz bachmann'],
            'politik': ['politik', 'regierung', 'wahl', 'partei', 'bundestag', 'landtag', 'demokratie', 'parlament', 'minister', 'kanzler', 'bundespräsident', 'spd', 'cdu', 'csu', 'fdp', 'linke', 'grüne']
        }

    def is_weekend_pause(self) -> bool:
        """Check if weekend pause is enabled"""
        if not self.weekend_pause:
            return False

        now = datetime.now()
        day = now.weekday()  # Monday is 0, Sunday is 6
        hour = now.hour

        # Pause on Friday evening through Sunday
        return (day == 4 and hour >= 18) or day == 5 or (day == 6 and hour < 18)

    def calculate_quality_score(self, item: Dict[str, Any]) -> int:
        """Calculate quality score for content"""
        if not item:
            return 0

        # Base score calculation
        score = 0

        # Engagement metrics (weighted)
        if item.get('view_count'):
            score += item['view_count'] * 0.1
        if item.get('like_count'):
            score += item['like_count'] * 0.5
        if item.get('comment_count'):
            score += item['comment_count'] * 1.0
        if item.get('share_count'):
            score += item['share_count'] * 1.5

        # Recency bonus (newer content gets higher scores)
        if item.get('published_at'):
            try:
                published_date = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00'))
                hours_since_published = (datetime.now(published_date.tzinfo) - published_date).total_seconds() / (60 * 60)
                recency_bonus = max(0, 50 - (hours_since_published / 24))  # Max 50 point bonus for very recent content
                score += recency_bonus
            except ValueError:
                pass  # Invalid date format

        # Cap the score at 100
        return min(100, max(0, round(score)))

    def extract_relevant_keywords(self, content_items: List[Dict[str, Any]], original_keywords: List[str] = []) -> List[Dict[str, Any]]:
        """Extract relevant keywords from content items"""
        keyword_frequency = {}

        # Add original keywords with high frequency to prioritize them
        for keyword in original_keywords:
            keyword_frequency[keyword.lower()] = 100

        # Process each content item to extract keywords
        for item in content_items:
            # Extract keywords from title
            if item.get('title'):
                title_words = re.findall(r'\b(\w{3,})\b', item['title'].lower())
                for word in title_words:
                    keyword_frequency[word] = keyword_frequency.get(word, 0) + 3

            # Extract keywords from description/content
            content_text = (item.get('description', '') or item.get('content', '') or item.get('caption', '') or '').lower()
            content_words = re.findall(r'\b(\w{3,})\b', content_text)
            for word in content_words:
                keyword_frequency[word] = keyword_frequency.get(word, 0) + 1

            # Boost keywords from high-quality content
            if item.get('quality_score', 0) >= 90:
                high_quality_text = ((item.get('title', '') or '') + ' ' + content_text).lower()
                high_quality_words = re.findall(r'\b(\w{3,})\b', high_quality_text)
                for word in high_quality_words:
                    keyword_frequency[word] = keyword_frequency.get(word, 0) + 2

        # Convert to array and sort by frequency
        sorted_keywords = [
            {'word': word, 'frequency': freq}
            for word, freq in sorted(keyword_frequency.items(), key=lambda x: x[1], reverse=True)
            if freq > 2  # Only include words that appear more than twice
        ]

        # Return top 15 keywords
        return sorted_keywords[:15]

    def extract_todays_top_keywords(self, content_items: List[Dict[str, Any]], original_keywords: List[str] = []) -> List[Dict[str, Any]]:
        """Extract today's top keywords from content items"""
        keyword_frequency = {}
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)  # Set to start of today

        # Add original keywords with high frequency to prioritize them
        for keyword in original_keywords:
            keyword_frequency[keyword.lower()] = 100

        # Process each content item to extract keywords
        for item in content_items:
            # Check if content is from today
            if item.get('published_at'):
                try:
                    published_date = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00'))
                    published_date = published_date.replace(hour=0, minute=0, second=0, microsecond=0)

                    # Only process content from today
                    if published_date == today:
                        # Extract keywords from title
                        if item.get('title'):
                            title_words = re.findall(r'\b(\w{3,})\b', item['title'].lower())
                            for word in title_words:
                                keyword_frequency[word] = keyword_frequency.get(word, 0) + 5  # Higher weight for today's content

                        # Extract keywords from description/content
                        content_text = (item.get('description', '') or item.get('content', '') or item.get('caption', '') or '').lower()
                        content_words = re.findall(r'\b(\w{3,})\b', content_text)
                        for word in content_words:
                            keyword_frequency[word] = keyword_frequency.get(word, 0) + 2  # Higher weight for today's content
                except ValueError:
                    pass  # Invalid date format

        # Convert to array and sort by frequency
        sorted_keywords = [
            {'word': word, 'frequency': freq}
            for word, freq in sorted(keyword_frequency.items(), key=lambda x: x[1], reverse=True)
            if freq > 1  # Only include words that appear more than once
        ]

        # Return top 10 keywords from today
        return sorted_keywords[:10]

    def classify_themes(self, content_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Classify content items into themes with clear separation"""
        theme_scores = {theme: 0 for theme in self.themes}

        # Process each content item to classify themes
        for item in content_items:
            title = (item.get('title', '') or '').lower()
            content_text = (title + ' ' + (item.get('description', '') or item.get('content', '') or item.get('caption', '') or '')).lower()

            # Check for theme keywords in content
            for theme, keywords in self.themes.items():
                theme_score = 0

                for keyword in keywords:
                    # Count occurrences of each keyword
                    count = len(re.findall(rf'\b{re.escape(keyword)}\b', content_text))
                    # Add to theme score (weighted by keyword importance)
                    theme_score += count * 3

                # Boost score for high-quality content
                if item.get('quality_score', 0) >= 90:
                    theme_score *= 1.5

                # Boost score for recent content
                if item.get('published_at'):
                    try:
                        published_date = datetime.fromisoformat(item['published_at'].replace('Z', '+00:00'))
                        hours_since_published = (datetime.now(published_date.tzinfo) - published_date).total_seconds() / (60 * 60)
                        if hours_since_published <= 24:  # Content from last 24 hours
                            theme_score *= 1.2
                    except ValueError:
                        pass  # Invalid date format

                theme_scores[theme] += theme_score

        # Convert to array and sort by score
        sorted_themes = [
            {'theme': theme, 'score': round(score)}
            for theme, score in sorted(theme_scores.items(), key=lambda x: x[1], reverse=True)
            if score > 0  # Only include themes with score > 0
        ]

        return sorted_themes

    def extract_theme_specific_content(self, content_items: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Extract theme-specific content"""
        theme_content = {theme: [] for theme in self.themes}

        # Process each content item and assign to themes
        for item in content_items:
            title = (item.get('title', '') or '').lower()
            content_text = (title + ' ' + (item.get('description', '') or item.get('content', '') or item.get('caption', '') or '')).lower()

            # Check for theme keywords in content
            for theme, keywords in self.themes.items():
                theme_relevance = 0

                for keyword in keywords:
                    # Count occurrences of each keyword
                    count = len(re.findall(rf'\b{re.escape(keyword)}\b', content_text))
                    theme_relevance += count

                # If content is relevant to theme, add it
                if theme_relevance > 0:
                    theme_item = item.copy()
                    theme_item['theme_relevance'] = theme_relevance
                    theme_content[theme].append(theme_item)

        # Sort theme content by relevance and quality
        for theme in theme_content:
            theme_content[theme].sort(key=lambda x: (x['theme_relevance'], x.get('quality_score', 0)), reverse=True)
            # Keep only top 5 items per theme
            theme_content[theme] = theme_content[theme][:5]

        return theme_content

    def extract_video_topics(self, content_items: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """Extract specific video topics for content creation"""
        video_topics = {
            'ki': [],
            'politik': []
        }

        # Process each content item to extract potential video topics
        for item in content_items:
            title = (item.get('title', '') or '').lower()
            content_text = (title + ' ' + (item.get('description', '') or item.get('content', '') or item.get('caption', '') or '')).lower()

            # Extract potential video topics for KI
            if any(keyword in content_text for keyword in self.themes['ki']):
                # Extract topic from title
                ki_topic = self.extract_topic_from_text(title, self.themes['ki'])
                if ki_topic and ki_topic not in video_topics['ki']:
                    video_topics['ki'].append(ki_topic)

            # Extract potential video topics for Politik
            if any(keyword in content_text for keyword in self.themes['politik']):
                # Extract topic from title
                politik_topic = self.extract_topic_from_text(title, self.themes['politik'])
                if politik_topic and politik_topic not in video_topics['politik']:
                    video_topics['politik'].append(politik_topic)

        # Limit to top 5 topics per theme
        video_topics['ki'] = video_topics['ki'][:5]
        video_topics['politik'] = video_topics['politik'][:5]

        return video_topics

    def extract_topic_from_text(self, text: str, theme_keywords: List[str]) -> Optional[str]:
        """Extract topic from text based on theme keywords"""
        # Find theme keywords in text
        found_keywords = [keyword for keyword in theme_keywords if keyword in text]

        if found_keywords:
            # Try to extract a more specific topic
            words = text.split(' ')
            topic_words = [
                word for word in words
                if len(word) > 3 and word not in [
                    'über', 'mit', 'für', 'und', 'der', 'die', 'das', 'ist', 'von', 'auf', 'in', 'an'
                ]
            ]

            if topic_words:
                # Return a combination of theme keyword and specific topic word
                return f"{found_keywords[0]}: {' '.join(topic_words[:3])}"

            return found_keywords[0]

        return None

    async def search_web(self, query: str, options: Dict[str, Any] = {}) -> List[Dict[str, Any]]:
        """Search the web for content"""
        try:
            max_results = options.get('max_results', 10)
            language = options.get('language', 'de')  # Default to German

            # Mock implementation - in a real service, this would make actual API calls
            results = []
            for i in range(max_results):
                result = {
                    'title': f'Suchergebnis {i + 1} für "{query}"',
                    'url': f'https://example.com/ergebnis-{i + 1}',
                    'snippet': f'Dies ist ein Beispielergebnis für die Suchanfrage "{query}"',
                    'relevance': random.random(),
                    'quality_score': random.randint(60, 100)  # Scores between 60-100
                }
                results.append(result)

            return results
        except Exception as error:
            logger.error(f'❌ Web search failed: {error}')
            return []

    async def scrape_youtube_with_keywords(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Scrape YouTube with keywords"""
        try:
            # Mock implementation
            keyword = keywords[0] if keywords else 'Thema'
            items = []

            # Generate 3-5 mock YouTube videos
            count = random.randint(3, 5)
            for i in range(count):
                item = {
                    'title': f'YouTube Video über {keyword} #{i + 1}',
                    'description': f'Dies ist eine Beispielbeschreibung für ein YouTube-Video über {keyword}',
                    'view_count': random.randint(0, 1000000),
                    'like_count': random.randint(0, 100000),
                    'comment_count': random.randint(0, 10000),
                    'published_at': (datetime.now() - timedelta(seconds=random.randint(0, 7 * 24 * 60 * 60))).isoformat() + 'Z',  # Within last week
                    'channel_title': 'Beispielkanal',
                    'url': f'https://youtube.com/watch?v={int(datetime.now().timestamp())}-{i}',
                    'source': 'youtube',
                    'platform': self.supported_platforms['youtube']
                }

                item['quality_score'] = self.calculate_quality_score(item)
                items.append(item)

            return items
        except Exception as error:
            logger.error(f'❌ YouTube scraping with keywords failed: {error}')
            return []

    async def scrape_twitter_with_keywords(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Scrape Twitter with keywords"""
        try:
            # Mock implementation
            keyword = keywords[0] if keywords else 'Thema'
            items = []

            # Generate 5-10 mock Twitter posts
            count = random.randint(5, 10)
            for i in range(count):
                item = {
                    'title': f'Twitter-Post über {keyword} #{i + 1}',
                    'content': f'Dies ist ein Beispiel-Twitter-Post über {keyword} #{keyword.replace(" ", "")}',
                    'retweet_count': random.randint(0, 10000),
                    'like_count': random.randint(0, 10000),
                    'comment_count': random.randint(0, 1000),
                    'published_at': (datetime.now() - timedelta(seconds=random.randint(0, 24 * 60 * 60))).isoformat() + 'Z',  # Within last 24 hours
                    'url': f'https://twitter.com/user/status/{int(datetime.now().timestamp())}-{i}',
                    'source': 'twitter',
                    'platform': self.supported_platforms['twitter']
                }

                item['quality_score'] = self.calculate_quality_score(item)
                items.append(item)

            return items
        except Exception as error:
            logger.error(f'❌ Twitter scraping with keywords failed: {error}')
            return []

    async def scrape_tiktok_with_keywords(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Scrape TikTok with keywords"""
        try:
            # Mock implementation
            keyword = keywords[0] if keywords else 'Thema'
            items = []

            # Generate 3-7 mock TikTok videos
            count = random.randint(3, 7)
            for i in range(count):
                item = {
                    'title': f'TikTok Video über {keyword} #{i + 1}',
                    'description': f'#{keyword.replace(" ", "")} #TikTok #Viral',
                    'view_count': random.randint(0, 5000000),
                    'like_count': random.randint(0, 500000),
                    'comment_count': random.randint(0, 50000),
                    'share_count': random.randint(0, 100000),
                    'published_at': (datetime.now() - timedelta(seconds=random.randint(0, 48 * 60 * 60))).isoformat() + 'Z',  # Within last 48 hours
                    'creator': 'BeispielCreator',
                    'url': f'https://tiktok.com/@creator/video/{int(datetime.now().timestamp())}-{i}',
                    'source': 'tiktok',
                    'platform': self.supported_platforms['tiktok']
                }

                item['quality_score'] = self.calculate_quality_score(item)
                items.append(item)

            return items
        except Exception as error:
            logger.error(f'❌ TikTok scraping with keywords failed: {error}')
            return []

    async def scrape_instagram_with_keywords(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Scrape Instagram with keywords"""
        try:
            # Mock implementation
            keyword = keywords[0] if keywords else 'Thema'
            items = []

            # Generate 2-6 mock Instagram posts
            count = random.randint(2, 6)
            for i in range(count):
                item = {
                    'title': f'Instagram-Post über {keyword} #{i + 1}',
                    'caption': f'Beispielbild über {keyword} #{keyword.replace(" ", "")} #Instagram',
                    'like_count': random.randint(0, 100000),
                    'comment_count': random.randint(0, 5000),
                    'published_at': (datetime.now() - timedelta(seconds=random.randint(0, 72 * 60 * 60))).isoformat() + 'Z',  # Within last 72 hours
                    'url': f'https://instagram.com/p/{int(datetime.now().timestamp())}-{i}',
                    'source': 'instagram',
                    'platform': self.supported_platforms['instagram']
                }

                item['quality_score'] = self.calculate_quality_score(item)
                items.append(item)

            return items
        except Exception as error:
            logger.error(f'❌ Instagram scraping with keywords failed: {error}')
            return []

    async def scrape_bundestag_with_keywords(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Scrape Bundestag content with keywords"""
        try:
            # Mock implementation
            keyword = keywords[0] if keywords else 'Politik'
            items = []

            # Generate 1-3 mock Bundestag items
            count = random.randint(1, 3)
            for i in range(count):
                item = {
                    'title': f'Bundestag: Debatte über {keyword} #{i + 1}',
                    'content': f'Amtlicher Bericht der Debatte über {keyword} im Deutschen Bundestag',
                    'published_at': (datetime.now() - timedelta(seconds=random.randint(0, 168 * 60 * 60))).isoformat() + 'Z',  # Within last week
                    'url': f'https://bundestag.de/dokument-{int(datetime.now().timestamp())}-{i}',
                    'source': 'bundestag',
                    'platform': self.supported_platforms['bundestag'],
                    'quality_score': 95  # Official government content gets high score
                }

                items.append(item)

            return items
        except Exception as error:
            logger.error(f'❌ Bundestag scraping with keywords failed: {error}')
            return []

    async def scrape_landtage_with_keywords(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Scrape Landtage content with keywords"""
        try:
            # Mock implementation
            keyword = keywords[0] if keywords else 'Regionalpolitik'
            items = []

            # Generate 1-2 mock Landtag items
            count = random.randint(1, 2)
            for i in range(count):
                item = {
                    'title': f'Landtag: Diskussion über {keyword} #{i + 1}',
                    'content': f'Amtlicher Bericht der Diskussion über {keyword} im Landtag',
                    'published_at': (datetime.now() - timedelta(seconds=random.randint(0, 168 * 60 * 60))).isoformat() + 'Z',  # Within last week
                    'url': f'https://landtag.de/dokument-{int(datetime.now().timestamp())}-{i}',
                    'source': 'landtage',
                    'platform': self.supported_platforms['landtage'],
                    'quality_score': 90  # Official regional government content
                }

                items.append(item)

            return items
        except Exception as error:
            logger.error(f'❌ Landtage scraping with keywords failed: {error}')
            return []

    async def scrape_talkshows_with_keywords(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Scrape politische Talkshows with keywords"""
        try:
            # Mock implementation
            keyword = keywords[0] if keywords else 'Aktuelles'
            items = []

            # Generate 2-4 mock talk show items
            count = random.randint(2, 4)
            for i in range(count):
                item = {
                    'title': f'Talksendung: Diskussion über {keyword} #{i + 1}',
                    'content': f'Zusammenfassung der Talksendung über {keyword} mit Expertengast',
                    'view_count': random.randint(0, 2000000),
                    'published_at': (datetime.now() - timedelta(seconds=random.randint(0, 168 * 60 * 60))).isoformat() + 'Z',  # Within last week
                    'url': f'https://talkshow.de/sendung-{int(datetime.now().timestamp())}-{i}',
                    'source': 'politische-talkshows',
                    'platform': self.supported_platforms['politische-talkshows'],
                    'quality_score': random.randint(85, 95)  # 85-95 range
                }

                item['quality_score'] = self.calculate_quality_score(item)
                items.append(item)

            return items
        except Exception as error:
            logger.error(f'❌ Talkshows scraping with keywords failed: {error}')
            return []

    async def execute(self, options: Dict[str, Any] = {}) -> Dict[str, Any]:
        """Execute scraping operation"""
        try:
            logger.info(f"🔍 Starting scraping operation with type: {options.get('type')}")

            # Handle different scraping types
            scraping_type = options.get('type')
            if scraping_type == 'scrape-political-content':
                return await self.scrape_political_content(options.get('keywords', []), options.get('sources', []))
            elif scraping_type == 'scrape-business-content':
                return await self.scrape_business_content(options.get('keywords', []), options.get('sources', []))
            elif scraping_type == 'scrape-keywords':
                return await self.scrape_content_with_keywords(options.get('keywords', []), options.get('sources', []))
            elif scraping_type == 'search-web':
                return await self.search_web(options.get('query', ''), options)
            else:
                raise Exception(f'Unsupported scraping type: {scraping_type}')
        except Exception as error:
            logger.error(f'❌ Scraping execution failed: {error}')
            raise error

    async def scrape_political_content(self, keywords: List[str] = [], sources: List[str] = []) -> Dict[str, Any]:
        """Scrape political content for Senara channel"""
        try:
            logger.info(f"🔍 Scraping political content with keywords: {', '.join(keywords) if keywords else 'none'}")
            logger.info(f"📚 Using sources: {', '.join(sources) if sources else 'all political'}")

            # Handle case where keywords might be undefined
            safe_keywords = keywords if isinstance(keywords, list) else []

            # Use all political sources if none specified
            sources_to_use = sources if sources else ['bundestag', 'landtage', 'politische-talkshows']

            # Validate sources
            valid_sources = [source for source in sources_to_use if source in self.supported_platforms]
            if not valid_sources:
                raise Exception('No valid political sources specified')

            logger.info(f"✅ Valid sources: {', '.join(valid_sources)}")

            # Scrape from multiple sources in parallel
            scraping_tasks = []

            if 'bundestag' in valid_sources:
                scraping_tasks.append(self.scrape_bundestag_with_keywords(safe_keywords))
            if 'landtage' in valid_sources:
                scraping_tasks.append(self.scrape_landtage_with_keywords(safe_keywords))
            if 'politische-talkshows' in valid_sources:
                scraping_tasks.append(self.scrape_talkshows_with_keywords(safe_keywords))

            # Wait for all scraping operations to complete
            results = await asyncio.gather(*scraping_tasks)

            # Flatten results
            all_content = [item for sublist in results for item in sublist]

            # Sort by quality score (descending)
            all_content.sort(key=lambda x: x.get('quality_score', 0), reverse=True)

            # Filter for high quality content (95+)
            high_quality_content = [item for item in all_content if item.get('quality_score', 0) >= 95]

            # Extract relevant keywords from all content
            relevant_keywords = self.extract_relevant_keywords(all_content, safe_keywords)

            # Extract today's top keywords
            todays_top_keywords = self.extract_todays_top_keywords(all_content, safe_keywords)

            # Classify themes from all content with improved logic
            classified_themes = self.classify_themes(all_content)

            # Extract theme-specific content
            theme_specific_content = self.extract_theme_specific_content(all_content)

            # Extract specific video topics for content creation
            video_topics = self.extract_video_topics(all_content)

            logger.info(f"✅ Scraped {len(all_content)} total items ({len(high_quality_content)} with 95+ quality)")
            logger.info(f"🔑 Extracted {len(relevant_keywords)} relevant keywords")
            logger.info(f"🔥 Extracted {len(todays_top_keywords)} today's top keywords")
            logger.info(f"🏷️  Classified {len(classified_themes)} themes")
            logger.info(f"📂 Extracted theme-specific content for {len(theme_specific_content)} themes")
            logger.info(f"🎬 Extracted {len(video_topics['ki']) + len(video_topics['politik'])} specific video topics")

            # Return structured result with all extracted information
            return {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'keywords': safe_keywords,
                'sources': valid_sources,
                'total_items': len(all_content),
                'high_quality_items': len(high_quality_content),
                'content_items': all_content,
                'high_quality_content': high_quality_content,
                'relevant_keywords': relevant_keywords,
                'todays_top_keywords': todays_top_keywords,
                'themes': classified_themes,
                'theme_specific_content': theme_specific_content,
                'video_topics': video_topics,
                'statistics': {
                    'avg_quality_score': round(sum(item.get('quality_score', 0) for item in all_content) / len(all_content)) if all_content else 0,
                    'sources_count': len(valid_sources)
                }
            }
        except Exception as error:
            logger.error(f'❌ Political content scraping failed: {error}')
            raise error

    async def scrape_business_content(self, keywords: List[str] = [], sources: List[str] = []) -> Dict[str, Any]:
        """Scrape business content for Neurova channel"""
        try:
            logger.info(f"🔍 Scraping business content with keywords: {', '.join(keywords) if keywords else 'none'}")
            logger.info(f"📚 Using sources: {', '.join(sources) if sources else 'all business'}")

            # Handle case where keywords might be undefined
            safe_keywords = keywords if isinstance(keywords, list) else []

            # Use all business sources if none specified
            sources_to_use = sources if sources else ['youtube', 'twitter', 'tiktok', 'instagram']

            # Validate sources
            valid_sources = [source for source in sources_to_use if source in self.supported_platforms]
            if not valid_sources:
                raise Exception('No valid business sources specified')

            logger.info(f"✅ Valid sources: {', '.join(valid_sources)}")

            # Scrape from multiple sources in parallel
            scraping_tasks = []

            if 'youtube' in valid_sources:
                scraping_tasks.append(self.scrape_youtube_with_keywords(safe_keywords))
            if 'twitter' in valid_sources:
                scraping_tasks.append(self.scrape_twitter_with_keywords(safe_keywords))
            if 'tiktok' in valid_sources:
                scraping_tasks.append(self.scrape_tiktok_with_keywords(safe_keywords))
            if 'instagram' in valid_sources:
                scraping_tasks.append(self.scrape_instagram_with_keywords(safe_keywords))

            # Wait for all scraping operations to complete
            results = await asyncio.gather(*scraping_tasks)

            # Flatten results
            all_content = [item for sublist in results for item in sublist]

            # Sort by quality score (descending)
            all_content.sort(key=lambda x: x.get('quality_score', 0), reverse=True)

            # Filter for high quality content (95+)
            high_quality_content = [item for item in all_content if item.get('quality_score', 0) >= 95]

            # Extract relevant keywords from all content
            relevant_keywords = self.extract_relevant_keywords(all_content, safe_keywords)

            # Extract today's top keywords
            todays_top_keywords = self.extract_todays_top_keywords(all_content, safe_keywords)

            # Classify themes from all content with improved logic
            classified_themes = self.classify_themes(all_content)

            # Extract theme-specific content
            theme_specific_content = self.extract_theme_specific_content(all_content)

            # Extract specific video topics for content creation
            video_topics = self.extract_video_topics(all_content)

            logger.info(f"✅ Scraped {len(all_content)} total items ({len(high_quality_content)} with 95+ quality)")
            logger.info(f"🔑 Extracted {len(relevant_keywords)} relevant keywords")
            logger.info(f"🔥 Extracted {len(todays_top_keywords)} today's top keywords")
            logger.info(f"🏷️  Classified {len(classified_themes)} themes")
            logger.info(f"📂 Extracted theme-specific content for {len(theme_specific_content)} themes")
            logger.info(f"🎬 Extracted {len(video_topics['ki']) + len(video_topics['politik'])} specific video topics")

            # Return structured result with all extracted information
            return {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'keywords': safe_keywords,
                'sources': valid_sources,
                'total_items': len(all_content),
                'high_quality_items': len(high_quality_content),
                'content_items': all_content,
                'high_quality_content': high_quality_content,
                'relevant_keywords': relevant_keywords,
                'todays_top_keywords': todays_top_keywords,
                'themes': classified_themes,
                'theme_specific_content': theme_specific_content,
                'video_topics': video_topics,
                'statistics': {
                    'avg_quality_score': round(sum(item.get('quality_score', 0) for item in all_content) / len(all_content)) if all_content else 0,
                    'sources_count': len(valid_sources)
                }
            }
        except Exception as error:
            logger.error(f'❌ Business content scraping failed: {error}')
            raise error

    async def scrape_content_with_keywords(self, keywords: List[str], sources: List[str] = []) -> Dict[str, Any]:
        """Scrape content with keywords from approved sources and extract relevant information for video content creation"""
        try:
            logger.info(f"🔍 Scraping content with keywords: {', '.join(keywords) if keywords else 'none'}")
            logger.info(f"📚 Using sources: {', '.join(sources) if sources else 'all approved'}\n")

            # Handle case where keywords might be undefined
            safe_keywords = keywords if isinstance(keywords, list) else []

            # Use all approved sources if none specified
            sources_to_use = sources if sources else list(self.supported_platforms.keys())

            # Validate sources
            valid_sources = [source for source in sources_to_use if source in self.supported_platforms]
            if not valid_sources:
                raise Exception('No valid sources specified')

            logger.info(f"✅ Valid sources: {', '.join(valid_sources)}")

            # Scrape from multiple sources in parallel
            scraping_tasks = []

            if 'youtube' in valid_sources:
                scraping_tasks.append(self.scrape_youtube_with_keywords(safe_keywords))
            if 'twitter' in valid_sources:
                scraping_tasks.append(self.scrape_twitter_with_keywords(safe_keywords))
            if 'tiktok' in valid_sources:
                scraping_tasks.append(self.scrape_tiktok_with_keywords(safe_keywords))
            if 'instagram' in valid_sources:
                scraping_tasks.append(self.scrape_instagram_with_keywords(safe_keywords))
            if 'bundestag' in valid_sources:
                scraping_tasks.append(self.scrape_bundestag_with_keywords(safe_keywords))
            if 'landtage' in valid_sources:
                scraping_tasks.append(self.scrape_landtage_with_keywords(safe_keywords))
            if 'politische-talkshows' in valid_sources:
                scraping_tasks.append(self.scrape_talkshows_with_keywords(safe_keywords))

            # Wait for all scraping operations to complete
            results = await asyncio.gather(*scraping_tasks)

            # Flatten results
            all_content = [item for sublist in results for item in sublist]

            # Sort by quality score (descending)
            all_content.sort(key=lambda x: x.get('quality_score', 0), reverse=True)

            # Filter for high quality content (95+)
            high_quality_content = [item for item in all_content if item.get('quality_score', 0) >= 95]

            # Extract relevant keywords from all content
            relevant_keywords = self.extract_relevant_keywords(all_content, safe_keywords)

            # Extract today's top keywords
            todays_top_keywords = self.extract_todays_top_keywords(all_content, safe_keywords)

            # Classify themes from all content with improved logic
            classified_themes = self.classify_themes(all_content)

            # Extract theme-specific content
            theme_specific_content = self.extract_theme_specific_content(all_content)

            # Extract specific video topics for content creation
            video_topics = self.extract_video_topics(all_content)

            logger.info(f"✅ Scraped {len(all_content)} total items ({len(high_quality_content)} with 95+ quality)")
            logger.info(f"🔑 Extracted {len(relevant_keywords)} relevant keywords")
            logger.info(f"🔥 Extracted {len(todays_top_keywords)} today's top keywords")
            logger.info(f"🏷️  Classified {len(classified_themes)} themes")
            logger.info(f"📂 Extracted theme-specific content for {len(theme_specific_content)} themes")
            logger.info(f"🎬 Extracted {len(video_topics['ki']) + len(video_topics['politik'])} specific video topics")

            # Return structured result with all extracted information
            return {
                'success': True,
                'timestamp': datetime.now().isoformat(),
                'keywords': safe_keywords,
                'sources': valid_sources,
                'total_items': len(all_content),
                'high_quality_items': len(high_quality_content),
                'content_items': all_content,
                'high_quality_content': high_quality_content,
                'relevant_keywords': relevant_keywords,
                'todays_top_keywords': todays_top_keywords,
                'themes': classified_themes,
                'theme_specific_content': theme_specific_content,
                'video_topics': video_topics,  # Neue Ausgabe der spezifischen Videothemen
                'statistics': {
                    'avg_quality_score': round(sum(item.get('quality_score', 0) for item in all_content) / len(all_content)) if all_content else 0,
                    'sources_count': len(valid_sources)
                }
            }
        except Exception as error:
            logger.error(f'❌ Content scraping with keywords failed: {error}')
            raise error


# Main execution
if __name__ == "__main__":
    agent = WebScrapingAgent()
    logger.info("🎬 Web Scraping Agent initialized")

    # Example usage
    logger.info(f"📱 Supported platforms: {len(agent.supported_platforms)}")
    for platform, info in agent.supported_platforms.items():
        logger.info(f"  - {info['name']} ({platform}): {info['icon']}")