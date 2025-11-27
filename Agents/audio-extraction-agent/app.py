#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audio Extraction Service - YouTube-DL Integration
Extracts audio from YouTube videos discovered by VideoDiscoveryService
"""

import os
import json
import asyncio
import subprocess
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

class AudioExtractionService:
    def __init__(self):
        self.download_dir = Path(__file__).parent.parent.parent / "data" / "audio-extracts"
        self.temp_dir = Path(__file__).parent.parent.parent / "data" / "temp"
        self.max_duration = 1800  # 30 minutes max
        self.max_file_size = 50 * 1024 * 1024  # 50MB max

        # Initialize directories
        self.ensure_directories()

        # Quality settings
        self.audio_formats = {
            "high": "bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio",
            "medium": "bestaudio[abr<=128]/bestaudio",
            "low": "worstaudio[ext=m4a]/worstaudio[ext=mp3]/worstaudio",
            # Neue Formate hinzufügen
            "flac": "bestaudio[ext=flac]/bestaudio",
            "wav": "bestaudio[ext=wav]/bestaudio",
            "aac": "bestaudio[ext=aac]/bestaudio"
        }

        # Rate limiting for API compliance
        self.request_delay = 3000  # 3 seconds between downloads
        self.last_download = 0

        # Retry settings
        self.max_retries = 3
        self.retry_delay = 5000  # 5 seconds

    def ensure_directories(self) -> None:
        """Ensure required directories exist"""
        dirs = [self.download_dir, self.temp_dir]
        for directory in dirs:
            directory.mkdir(parents=True, exist_ok=True)

    async def check_youtube_dl(self) -> str:
        """
        Check if youtube-dl or yt-dlp is available
        """
        try:
            # Try yt-dlp first (more actively maintained)
            subprocess.run(["yt-dlp", "--version"], check=True, capture_output=True)
            return "yt-dlp"
        except (subprocess.CalledProcessError, FileNotFoundError):
            try:
                # Fallback to youtube-dl
                subprocess.run(["youtube-dl", "--version"], check=True, capture_output=True)
                return "youtube-dl"
            except (subprocess.CalledProcessError, FileNotFoundError):
                raise Exception("Neither yt-dlp nor youtube-dl found. Please install one of them.")

    async def extract_audio_from_video(self, video_data: Dict[str, Any], options: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Extract audio from a single video with retry logic
        """
        quality = options.get("quality", "medium")
        max_duration = options.get("maxDuration", self.max_duration)

        print(f"🎵 Extracting audio from: {video_data.get('title', 'Unknown')}")

        # Rate limiting
        await self.wait_for_rate_limit()

        # Retry logic
        for attempt in range(1, self.max_retries + 1):
            try:
                youtube_dl = await self.check_youtube_dl()
                video_url = f"https://www.youtube.com/watch?v={video_data.get('videoId', '')}"

                # Generate safe filename
                safe_title = self.sanitize_filename(video_data.get("title", "unknown"))
                output_path = self.temp_dir / f"{video_data.get('videoId', '')}_{safe_title}"

                # Build youtube-dl command
                command = self.build_extraction_command(
                    youtube_dl,
                    video_url,
                    str(output_path),
                    quality,
                    max_duration
                )

                print(f"🔄 Running: {command}")

                # Execute extraction
                process = await asyncio.create_subprocess_shell(
                    command,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )

                stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=300)  # 5 minutes timeout

                if process.returncode != 0:
                    raise Exception(f"Extraction failed: {stderr.decode()}")

                # Find extracted file
                extracted_file = self.find_extracted_file(str(output_path))
                if not extracted_file:
                    raise Exception("Audio extraction completed but file not found")

                # Validate file
                await self.validate_audio_file(extracted_file)

                # Move to final location
                final_path = self.download_dir / os.path.basename(extracted_file)
                os.rename(extracted_file, final_path)

                # Extract metadata
                metadata = await self.extract_metadata(str(final_path))

                result = {
                    "success": True,
                    "videoId": video_data.get("videoId", ""),
                    "videoTitle": video_data.get("title", ""),
                    "channelTitle": video_data.get("channelTitle", ""),
                    "audioPath": str(final_path),
                    "fileSize": os.path.getsize(final_path),
                    "extractedAt": datetime.now().isoformat(),
                    "quality": quality,
                    "duration": await self.get_audio_duration(str(final_path)),
                    "metadata": metadata
                }

                print(f"✅ Audio extracted successfully: {os.path.basename(final_path)}")
                return result

            except Exception as error:
                print(f"❌ Audio extraction attempt {attempt} failed for {video_data.get('videoId', '')}: {error}")

                # If this is the last attempt, return failure
                if attempt == self.max_retries:
                    return {
                        "success": False,
                        "videoId": video_data.get("videoId", ""),
                        "videoTitle": video_data.get("title", ""),
                        "error": str(error),
                        "extractedAt": datetime.now().isoformat(),
                        "attempts": attempt
                    }

                # Wait before retrying
                print(f"⏳ Retrying in {self.retry_delay/1000} seconds...")
                await asyncio.sleep(self.retry_delay / 1000)

    def build_extraction_command(self, youtube_dl: str, video_url: str, output_path: str, quality: str, max_duration: int) -> str:
        """
        Build youtube-dl extraction command with intelligent quality adjustment
        """
        # Intelligente Qualitätsanpassung basierend auf Dateigröße und Dauer
        format_string = self.audio_formats.get(quality, self.audio_formats["medium"])
        audio_quality = "0"  # Beste Qualität

        # Anpassung der Qualität basierend auf den Anforderungen
        if quality == "low":
            audio_quality = "9"  # Niedrigste Qualität
        elif quality == "medium":
            audio_quality = "5"  # Mittlere Qualität

        # Erweiterte Optionen für bessere Extraktion
        options = [
            youtube_dl,
            "--extract-audio",
            "--audio-format", self.get_audio_format_extension(quality),
            "--audio-quality", audio_quality,
            "--format", format_string,
            "--max-duration", str(max_duration),
            "--max-filesize", "50M",
            "--no-playlist",
            "--no-warnings",
            "--ignore-errors",
            "--retries", "3",
            "--fragment-retries", "3",
            "--continue",
            "--output", f'"{output_path}.%(ext)s"',
            f'"{video_url}"'
        ]

        return " ".join(options)

    def get_audio_format_extension(self, quality: str) -> str:
        """
        Get audio format extension based on quality setting
        """
        extensions = {
            "high": "m4a",  # Beste Komprimierung und Qualität
            "medium": "mp3",  # Gute Komprimierung und weite Verbreitung
            "low": "mp3",  # Kleinste Dateigröße
            "flac": "flac",  # Verlustfreie Qualität
            "wav": "wav",  # Unkomprimiert
            "aac": "aac"  # Effiziente Komprimierung
        }
        return extensions.get(quality, "mp3")

    async def analyze_and_adjust_quality(self, video_data: Dict[str, Any], initial_quality: str) -> str:
        """
        Intelligent quality adjustment based on content analysis
        """
        try:
            # In einer erweiterten Implementierung würden wir hier den Inhalt analysieren
            # und die Qualität entsprechend anpassen (z.B. höhere Qualität für Musik,
            # niedrigere Qualität für Sprache)

            # Für jetzt verwenden wir eine einfache Heuristik
            title = video_data.get("title", "").lower()
            content = video_data.get("content", "").lower()

            # Höhere Qualität für Musikinhalte
            if any(keyword in title or keyword in content for keyword in ["music", "song"]):
                return "high"

            # Niedrigere Qualität für Sprachinhalte
            if any(keyword in title or keyword in content for keyword in ["podcast", "talk"]):
                return initial_quality if initial_quality == "high" else initial_quality

            # Standardqualität für andere Inhalte
            return initial_quality
        except Exception as error:
            print(f"⚠️ Failed to analyze content for quality adjustment: {error}")
            return initial_quality

    def categorize_error(self, error: Exception) -> str:
        """
        Enhanced error handling with detailed error categorization
        """
        error_string = str(error).lower()

        if any(keyword in error_string for keyword in ["network", "timeout", "connection"]):
            return "NETWORK_ERROR"

        if any(keyword in error_string for keyword in ["format", "codec"]):
            return "FORMAT_ERROR"

        if any(keyword in error_string for keyword in ["permission", "access"]):
            return "PERMISSION_ERROR"

        if any(keyword in error_string for keyword in ["quota", "limit"]):
            return "QUOTA_ERROR"

        if any(keyword in error_string for keyword in ["file", "not found"]):
            return "FILE_ERROR"

        return "UNKNOWN_ERROR"

    def find_extracted_file(self, base_path: str) -> Optional[str]:
        """
        Find the extracted audio file
        """
        possible_extensions = [".mp3", ".m4a", ".opus", ".webm"]

        for ext in possible_extensions:
            file_path = base_path + ext
            if os.path.exists(file_path):
                return file_path

        # Check directory for any audio files
        dir_path = os.path.dirname(base_path)
        basename = os.path.basename(base_path)

        try:
            files = os.listdir(dir_path)
            for file in files:
                if file.startswith(basename) and any(file.endswith(ext) for ext in possible_extensions):
                    return os.path.join(dir_path, file)
        except Exception:
            pass

        return None

    async def validate_audio_file(self, file_path: str) -> None:
        """
        Validate extracted audio file
        """
        file_size = os.path.getsize(file_path)

        if file_size == 0:
            raise Exception("Extracted file is empty")

        if file_size > self.max_file_size:
            raise Exception(f"File too large: {file_size} bytes")

        # Basic audio file validation (check first few bytes)
        with open(file_path, "rb") as f:
            buffer = f.read(12)

        file_signature = buffer.hex()
        audio_signatures = [
            "fffb", "fff3", "fff2",  # MP3
            "66747970",  # M4A/MP4
            "4f676753"  # OGG
        ]

        is_valid_audio = any(
            file_signature.lower().startswith(sig.lower())
            for sig in audio_signatures
        )

        if not is_valid_audio:
            raise Exception("File does not appear to be a valid audio file")

    async def extract_metadata(self, file_path: str) -> Dict[str, Any]:
        """
        Extract metadata from audio file using ffprobe
        """
        try:
            command = f'ffprobe -v quiet -print_format json -show_format -show_streams "{file_path}"'
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await process.communicate()
            metadata = json.loads(stdout.decode())

            return {
                "format": metadata.get("format", {}).get("format_name", ""),
                "duration": float(metadata.get("format", {}).get("duration", 0)) or 0,
                "bitrate": int(metadata.get("format", {}).get("bit_rate", 0)) or 0,
                "sampleRate": (
                    int(metadata.get("streams", [{}])[0].get("sample_rate", 0))
                    if metadata.get("streams") else 0
                ),
                "channels": (
                    int(metadata.get("streams", [{}])[0].get("channels", 0))
                    if metadata.get("streams") else 0
                ),
                "codec": (
                    metadata.get("streams", [{}])[0].get("codec_name", "unknown")
                    if metadata.get("streams") else "unknown"
                )
            }
        except Exception as error:
            print(f"⚠️ Failed to extract metadata: {error}")
            return {}

    async def get_audio_duration(self, file_path: str) -> float:
        """
        Get audio duration using ffprobe if available
        """
        try:
            command = f'ffprobe -v quiet -show_entries format=duration -of csv=p=0 "{file_path}"'
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout, stderr = await process.communicate()
            return float(stdout.decode().strip()) or 0
        except Exception:
            # Fallback: estimate from file size (rough estimate)
            file_size = os.path.getsize(file_path)
            return round(file_size / (128 * 1024 / 8))  # Assume 128kbps

    def sanitize_filename(self, filename: str) -> str:
        """
        Sanitize filename for safe file system usage
        """
        # Remove special characters and replace spaces with underscores
        sanitized = "".join(c if c.isalnum() or c in " _-" else "" for c in filename)
        # Limit length
        return sanitized[:50]

    async def wait_for_rate_limit(self) -> None:
        """
        Rate limiting helper
        """
        import time
        now = time.time() * 1000  # Convert to milliseconds
        time_since_last_download = now - self.last_download
        if time_since_last_download < self.request_delay:
            await asyncio.sleep((self.request_delay - time_since_last_download) / 1000)
        self.last_download = time.time() * 1000

    async def extract_audio_from_videos(self, videos: List[Dict[str, Any]], options: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Extract audio from multiple videos (batch processing) with progress tracking
        """
        max_concurrent = options.get("maxConcurrent", 2)
        quality = options.get("quality", "medium")

        print(f"🎵 Starting batch audio extraction for {len(videos)} videos")

        results = []
        progress = {
            "total": len(videos),
            "completed": 0,
            "successful": 0,
            "failed": 0,
            "totalSize": 0,
            "totalDuration": 0
        }

        # Process videos in batches
        for i in range(0, len(videos), max_concurrent):
            batch = videos[i:i + max_concurrent]
            print(f"🔄 Processing batch {i//max_concurrent + 1}/{(len(videos)-1)//max_concurrent + 1}")

            # Process batch with concurrency control
            batch_tasks = []
            for video in batch:
                task = asyncio.create_task(self.process_single_video(video, quality, progress))
                batch_tasks.append(task)

            # Wait for batch completion
            batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)

            for result in batch_results:
                if isinstance(result, Exception):
                    results.append({
                        "success": False,
                        "error": str(result),
                        "errorType": self.categorize_error(result),
                        "extractedAt": datetime.now().isoformat()
                    })
                else:
                    results.append(result)

        successful = [r for r in results if r.get("success")]
        failed = [r for r in results if not r.get("success")]

        print(f"🎉 Batch extraction completed: {len(successful)} successful, {len(failed)} failed")

        return {
            "summary": {
                "total": len(videos),
                "successful": len(successful),
                "failed": len(failed),
                "totalSize": sum(r.get("fileSize", 0) for r in successful),
                "totalDuration": sum(r.get("duration", 0) for r in successful),
                "successRate": round(len(successful) / len(videos) * 100) if videos else 0
            },
            "progress": progress,
            "results": results,
            "timestamp": datetime.now().isoformat()
        }

    async def process_single_video(self, video: Dict[str, Any], quality: str, progress: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a single video for batch extraction
        """
        try:
            # Intelligente Qualitätsanpassung
            adjusted_quality = await self.analyze_and_adjust_quality(video, quality)
            result = await self.extract_audio_from_video(video, {
                "quality": adjusted_quality
            })

            # Aktualisiere Fortschritt
            progress["completed"] += 1
            if result.get("success"):
                progress["successful"] += 1
                progress["totalSize"] += result.get("fileSize", 0)
                progress["totalDuration"] += result.get("duration", 0)
            else:
                progress["failed"] += 1

            # Logge Fortschritt
            percentage = round((progress["completed"] / progress["total"]) * 100)
            print(f"📊 Progress: {progress['completed']}/{progress['total']} ({percentage}%) - Successful: {progress['successful']}, Failed: {progress['failed']}")

            return result
        except Exception as error:
            progress["completed"] += 1
            progress["failed"] += 1

            percentage = round((progress["completed"] / progress["total"]) * 100)
            print(f"📊 Progress: {progress['completed']}/{progress['total']} ({percentage}%) - Successful: {progress['successful']}, Failed: {progress['failed']}")

            return {
                "success": False,
                "videoId": video.get("videoId", ""),
                "videoTitle": video.get("title", ""),
                "error": str(error),
                "errorType": self.categorize_error(error),
                "extractedAt": datetime.now().isoformat()
            }

    async def cleanup_old_files(self, max_age_hours: int = 24) -> Dict[str, Any]:
        """
        Clean up old audio files
        """
        max_age = max_age_hours * 60 * 60 * 1000
        now = datetime.now().timestamp() * 1000

        directories = [self.download_dir, self.temp_dir]
        cleaned_count = 0
        freed_space = 0

        for directory in directories:
            try:
                for file_path in directory.iterdir():
                    if file_path.is_file():
                        file_age = now - file_path.stat().st_mtime * 1000
                        if file_age > max_age:
                            freed_space += file_path.stat().st_size
                            file_path.unlink()
                            cleaned_count += 1
            except Exception as error:
                print(f"⚠️ Failed to clean directory {directory}: {error}")

        print(f"🧹 Cleanup completed: {cleaned_count} files removed, {round(freed_space / 1024 / 1024)}MB freed")

        return {
            "filesRemoved": cleaned_count,
            "spaceFreed": freed_space,
            "timestamp": datetime.now().isoformat()
        }

    def get_stats(self) -> Dict[str, Any]:
        """
        Get service statistics with detailed metrics
        """
        stats = {
            "downloadDirectory": str(self.download_dir),
            "tempDirectory": str(self.temp_dir),
            "maxDuration": self.max_duration,
            "maxFileSize": self.max_file_size,
            "availableFiles": 0,
            "totalSize": 0,
            "formats": list(self.audio_formats.keys()),
            "retrySettings": {
                "maxRetries": self.max_retries,
                "retryDelay": self.retry_delay
            }
        }

        try:
            files = list(self.download_dir.iterdir())
            stats["availableFiles"] = len(files)

            for file_path in files:
                if file_path.is_file():
                    stats["totalSize"] += file_path.stat().st_size
        except Exception as error:
            print("⚠️ Failed to read download directory stats")

        return stats


# Main execution
if __name__ == "__main__":
    service = AudioExtractionService()
    print("🎬 Audio Extraction Service initialized")

    # Show stats
    stats = service.get_stats()
    print(f"📊 Available files: {stats['availableFiles']}")
    print(f"💾 Total size: {stats['totalSize'] / 1024 / 1024:.2f} MB")