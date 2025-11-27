import os
import shutil
from pathlib import Path
from typing import Dict, Any

class PathManagementService:
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent.parent
        self.data_dir = self.base_dir / "data"

        # Define the new organized directory structure
        self.paths = {
            # Main directories
            "data": self.data_dir,
            "channels": self.data_dir / "channels",
            "content": self.data_dir / "content",
            "templates": self.data_dir / "templates",
            "seo": self.data_dir / "seo",
            "monetization": self.data_dir / "monetization",
            "analytics": self.data_dir / "analytics",
            "logs": self.data_dir / "logs",

            # Content directories by channel
            "autonova": {
                "base": self.data_dir / "content" / "autonova",
                "scripts": self.data_dir / "content" / "autonova" / "scripts",
                "videos": self.data_dir / "content" / "autonova" / "videos",
                "thumbnails": self.data_dir / "content" / "autonova" / "thumbnails",
                "backgrounds": self.data_dir / "content" / "autonova" / "backgrounds",
                "graphics": self.data_dir / "content" / "autonova" / "graphics",
                "audio": self.data_dir / "content" / "autonova" / "audio"
            },

            "politara": {
                "base": self.data_dir / "content" / "politara",
                "scripts": self.data_dir / "content" / "politara" / "scripts",
                "videos": self.data_dir / "content" / "politara" / "videos",
                "thumbnails": self.data_dir / "content" / "politara" / "thumbnails",
                "backgrounds": self.data_dir / "content" / "politara" / "backgrounds",
                "graphics": self.data_dir / "content" / "politara" / "graphics",
                "audio": self.data_dir / "content" / "politara" / "audio"
            },

            "shared": {
                "base": self.data_dir / "content" / "shared",
                "scripts": self.data_dir / "content" / "shared" / "scripts",
                "videos": self.data_dir / "content" / "shared" / "videos",
                "thumbnails": self.data_dir / "content" / "shared" / "thumbnails",
                "backgrounds": self.data_dir / "content" / "shared" / "backgrounds",
                "graphics": self.data_dir / "content" / "shared" / "graphics",
                "audio": self.data_dir / "content" / "shared" / "audio"
            },

            # Template directories
            "templateScripts": self.data_dir / "templates" / "scripts",
            "templateVideo": self.data_dir / "templates" / "video",
            "templateThumbnails": self.data_dir / "templates" / "thumbnails",
            "templateBackgrounds": self.data_dir / "templates" / "backgrounds",
            "templateGraphics": self.data_dir / "templates" / "graphics",
            "templateWorkflows": self.data_dir / "templates" / "workflows",
            "templatePrompts": self.data_dir / "templates" / "prompts",

            # Other directories
            "demo": self.base_dir / "demo",
            "docs": self.base_dir / "docs",
            "examples": self.base_dir / "examples",
            "tests": self.base_dir / "tests",
            "tools": self.base_dir / "tools"
        }

        self.ensure_directories()

    def ensure_directories(self):
        """Ensure all required directories exist"""
        # Create main directories
        main_dirs = [
            self.paths["data"],
            self.paths["channels"],
            self.paths["content"],
            self.paths["templates"],
            self.paths["seo"],
            self.paths["monetization"],
            self.paths["analytics"],
            self.paths["logs"],
            self.paths["demo"],
            self.paths["docs"],
            self.paths["examples"],
            self.paths["tests"],
            self.paths["tools"]
        ]

        for directory in main_dirs:
            directory.mkdir(parents=True, exist_ok=True)

        # Create channel directories
        channel_dirs = []
        for channel in ["autonova", "politara", "shared"]:
            for content_type in ["base", "scripts", "videos", "thumbnails", "backgrounds", "graphics", "audio"]:
                channel_dirs.append(self.paths[channel][content_type])

        for directory in channel_dirs:
            directory.mkdir(parents=True, exist_ok=True)

        # Create template directories
        template_dirs = [
            self.paths["templateScripts"],
            self.paths["templateVideo"],
            self.paths["templateThumbnails"],
            self.paths["templateBackgrounds"],
            self.paths["templateGraphics"],
            self.paths["templateWorkflows"],
            self.paths["templatePrompts"]
        ]

        for directory in template_dirs:
            directory.mkdir(parents=True, exist_ok=True)

        print("✅ All required directories ensured")

    def get_content_path(self, channel: str, content_type: str) -> Path:
        """Get path for a specific content type and channel"""
        if channel not in self.paths:
            raise ValueError(f"Invalid channel: {channel}")

        if content_type not in self.paths[channel]:
            raise ValueError(f"Invalid content type: {content_type} for channel: {channel}")

        return self.paths[channel][content_type]

    def get_template_path(self, template_type: str) -> Path:
        """Get path for a specific template type"""
        template_path_key = f"template{template_type.capitalize()}"

        if template_path_key not in self.paths:
            raise ValueError(f"Invalid template type: {template_type}")

        return self.paths[template_path_key]

    def get_seo_path(self) -> Path:
        """Get path for SEO data"""
        return self.paths["seo"]

    def get_monetization_path(self) -> Path:
        """Get path for monetization data (highest priority)"""
        return self.paths["monetization"]

    def get_analytics_path(self) -> Path:
        """Get path for analytics data"""
        return self.paths["analytics"]

    def get_logs_path(self) -> Path:
        """Get path for logs"""
        return self.paths["logs"]

    def move_file_to_organized_structure(self, old_path: str, channel: str, content_type: str, filename: str) -> str:
        """Move file from old path to new organized structure"""
        try:
            old_path_obj = Path(old_path)
            new_path = self.get_content_path(channel, content_type) / filename

            # Ensure the target directory exists
            new_path.parent.mkdir(parents=True, exist_ok=True)

            # Move the file
            shutil.move(str(old_path_obj), str(new_path))

            print(f"✅ Moved file from {old_path} to {new_path}")
            return str(new_path)
        except Exception as error:
            print(f"❌ Failed to move file: {str(error)}")
            raise error

    def copy_file_to_organized_structure(self, source_path: str, channel: str, content_type: str, filename: str) -> str:
        """Copy file to organized structure"""
        try:
            source_path_obj = Path(source_path)
            target_path = self.get_content_path(channel, content_type) / filename

            # Ensure the target directory exists
            target_path.parent.mkdir(parents=True, exist_ok=True)

            # Copy the file
            shutil.copy2(source_path_obj, target_path)

            print(f"✅ Copied file from {source_path} to {target_path}")
            return str(target_path)
        except Exception as error:
            print(f"❌ Failed to copy file: {str(error)}")
            raise error

    def list_files(self, channel: str, content_type: str) -> list:
        """List files in a specific directory"""
        try:
            dir_path = self.get_content_path(channel, content_type)

            if not dir_path.exists():
                return []

            return [f.name for f in dir_path.iterdir() if f.is_file()]
        except Exception as error:
            print(f"❌ Failed to list files: {str(error)}")
            raise error

    def file_exists(self, channel: str, content_type: str, filename: str) -> bool:
        """Check if a file exists in the organized structure"""
        try:
            file_path = self.get_content_path(channel, content_type) / filename
            return file_path.exists()
        except Exception as error:
            print(f"❌ Failed to check file existence: {str(error)}")
            return False

    def get_file_path(self, channel: str, content_type: str, filename: str) -> str:
        """Get the full path for a file in the organized structure"""
        return str(self.get_content_path(channel, content_type) / filename)

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the directory structure"""
        stats = {
            "total_directories": 0,
            "total_files": 0,
            "channels": {
                "autonova": {},
                "politara": {},
                "shared": {}
            }
        }

        # Count files in each channel directory
        channels = ["autonova", "politara", "shared"]
        content_types = ["scripts", "videos", "thumbnails", "backgrounds", "graphics", "audio"]

        for channel in channels:
            for content_type in content_types:
                try:
                    dir_path = self.paths[channel][content_type]
                    if dir_path.exists():
                        files = [f for f in dir_path.iterdir() if f.is_file()]
                        stats["channels"][channel][content_type] = len(files)
                        stats["total_files"] += len(files)
                    else:
                        stats["channels"][channel][content_type] = 0
                except Exception:
                    stats["channels"][channel][content_type] = 0

        # Count template files
        stats["templates"] = {}
        template_types = ["Scripts", "Video", "Thumbnails", "Backgrounds", "Graphics", "Workflows", "Prompts"]

        for template_type in template_types:
            try:
                dir_path = self.paths[f"template{template_type}"]
                if dir_path.exists():
                    files = [f for f in dir_path.iterdir() if f.is_file()]
                    stats["templates"][template_type.lower()] = len(files)
                    stats["total_files"] += len(files)
                else:
                    stats["templates"][template_type.lower()] = 0
            except Exception:
                stats["templates"][template_type.lower()] = 0

        # Count directories
        def count_directories(directory: Path) -> int:
            if not directory.exists():
                return 0

            count = 1  # Count the directory itself
            try:
                for item in directory.iterdir():
                    if item.is_dir():
                        count += count_directories(item)
            except Exception:
                pass

            return count

        stats["total_directories"] = count_directories(self.data_dir)

        return stats

if __name__ == "__main__":
    # Example usage
    path_manager = PathManagementService()
    print("Path Management Agent initialized successfully!")

    # Display some stats
    stats = path_manager.get_stats()
    print(f"Total directories: {stats['total_directories']}")
    print(f"Total files: {stats['total_files']}")