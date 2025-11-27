import os
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging
from docxtpl import DocxTemplate
from weasyprint import HTML
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentExportService:
    def __init__(self, export_dir: str = None):
        """
        Initialize Document Export Service
        :param export_dir: Custom export directory path
        """
        # Allow customization of export directory
        self.export_dir = Path(export_dir) if export_dir else Path(__file__).parent.parent / "data" / "exports"
        self.ensure_export_dir()

    def ensure_export_dir(self):
        """Ensure export directory exists"""
        self.export_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Export directory ensured: {self.export_dir}")

    async def export_to_word(self, analysis_data: Dict[Any, Any], options: Dict[Any, Any] = None) -> Dict[Any, Any]:
        """
        Export analysis results to Word document
        :param analysis_data: Analysis results
        :param options: Export options
        :return: Export result
        """
        if options is None:
            options = {}

        try:
            logger.info("📄 Generating Word document...")

            filename = options.get("filename", f"analyse_{int(datetime.now().timestamp())}.docx")
            file_path = self.export_dir / filename

            # Generate Word document content
            doc_content = self.generate_word_content(analysis_data, options)

            # Save document
            await self.save_word_document(doc_content, str(file_path))

            # Get file size
            file_size = file_path.stat().st_size

            return {
                "success": True,
                "filename": filename,
                "path": str(file_path),
                "size": file_size,
                "format": "docx",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as error:
            logger.error(f"❌ Word export failed: {error}")
            raise Exception(f"Word export failed: {str(error)}")

    def generate_word_content(self, data: Dict[Any, Any], options: Dict[Any, Any]) -> Dict[Any, Any]:
        """
        Generate content for Word document
        :param data: Analysis data
        :param options: Export options
        :return: Document content structure
        """
        analysis = data.get("analysis", {})
        original_text = data.get("originalText", {})

        # Document content structure
        content = {
            "title": options.get("title", "Text-Analyse Ergebnis"),
            "metadata": {
                "created_at": datetime.now().strftime("%d.%m.%Y %H:%M:%S"),
                "word_count": original_text.get("wordCount", "Unbekannt"),
                "reading_time": original_text.get("estimatedReadingTime", "Unbekannt")
            },
            "summary": analysis.get("summary", ""),
            "key_points": analysis.get("keyPoints", []),
            "categories": analysis.get("categories", {}),
            "action_items": analysis.get("actionItems", [])
        }

        return content

    async def save_word_document(self, content: Dict[Any, Any], file_path: str):
        """
        Save Word document to file
        :param content: Document content
        :param file_path: Output file path
        """
        try:
            # For now, we'll create a simple text-based DOCX file
            # In a production environment, you would use a proper DOCX library
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(f"# {content['title']}\n\n")
                f.write(f"## Analyse-Details\n")
                f.write(f"Erstellt am: {content['metadata']['created_at']}\n")
                f.write(f"Wortanzahl: {content['metadata']['word_count']}\n")
                f.write(f"Lesezeit: {content['metadata']['reading_time']} Minuten\n\n")

                if content["summary"]:
                    f.write(f"## Zusammenfassung\n")
                    f.write(f"{content['summary']}\n\n")

                if content["key_points"]:
                    f.write(f"## Hauptpunkte\n")
                    for i, point in enumerate(content["key_points"], 1):
                        f.write(f"{i}. {point.get('title', '')}\n")
                        if point.get("description"):
                            f.write(f"   {point['description']}\n")
                        if point.get("category") or point.get("importance"):
                            meta = []
                            if point.get("category"):
                                meta.append(f"Kategorie: {point['category']}")
                            if point.get("importance"):
                                meta.append(f"Wichtigkeit: {point['importance']}")
                            f.write(f"   {', '.join(meta)}\n")
                        f.write("\n")

                if content["categories"]:
                    f.write(f"## Thematische Kategorien\n")
                    for category, points in content["categories"].items():
                        f.write(f"{category}:\n")
                        f.write(f"{', '.join(points) if isinstance(points, list) else points}\n\n")

                if content["action_items"]:
                    f.write(f"## Handlungsempfehlungen\n")
                    for i, action in enumerate(content["action_items"], 1):
                        f.write(f"{i}. {action.get('action', '')}\n")
                        meta = []
                        if action.get("priority"):
                            meta.append(f"Priorität: {action['priority']}")
                        if action.get("timeframe"):
                            meta.append(f"Zeitrahmen: {action['timeframe']}")
                        if meta:
                            f.write(f"   {', '.join(meta)}\n")

            logger.info(f"✅ Word document saved: {os.path.basename(file_path)}")
        except Exception as error:
            logger.error(f"❌ Failed to save Word document: {error}")
            raise error

    async def export_to_pdf(self, analysis_data: Dict[Any, Any], options: Dict[Any, Any] = None) -> Dict[Any, Any]:
        """
        Export analysis results to PDF
        :param analysis_data: Analysis results
        :param options: Export options
        :return: Export result
        """
        if options is None:
            options = {}

        try:
            logger.info("📄 Generating PDF document...")

            filename = options.get("filename", f"analyse_{int(datetime.now().timestamp())}.pdf")
            file_path = self.export_dir / filename

            # Generate HTML content
            html_content = self.generate_html_content(analysis_data, options)

            # Create PDF
            await self.create_pdf(html_content, str(file_path))

            # Get file size
            file_size = file_path.stat().st_size

            return {
                "success": True,
                "filename": filename,
                "path": str(file_path),
                "size": file_size,
                "format": "pdf",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as error:
            logger.error(f"❌ PDF export failed: {error}")
            raise Exception(f"PDF export failed: {str(error)}")

    def generate_html_content(self, data: Dict[Any, Any], options: Dict[Any, Any]) -> str:
        """
        Generate HTML content for PDF export
        :param data: Analysis data
        :param options: Export options
        :return: HTML content
        """
        analysis = data.get("analysis", {})
        original_text = data.get("originalText", {})
        title = options.get("title", "Text-Analyse Ergebnis")

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                }}
                h1 {{
                    color: #1f4e79;
                    border-bottom: 2px solid #1f4e79;
                    padding-bottom: 10px;
                }}
                h2 {{
                    color: #1f4e79;
                    margin-top: 30px;
                    margin-bottom: 15px;
                }}
                .metadata {{
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
                .key-point {{
                    margin-bottom: 20px;
                    padding: 15px;
                    border-left: 4px solid #1f4e79;
                    background-color: #f8f9fa;
                }}
                .key-point h3 {{
                    margin: 0 0 10px 0;
                    color: #1f4e79;
                }}
                .point-meta {{
                    font-size: 0.9em;
                    color: #666;
                    font-style: italic;
                }}
                .category-section {{
                    margin: 20px 0;
                }}
                .action-item {{
                    padding: 10px;
                    margin: 5px 0;
                    background-color: #e8f4f8;
                    border-radius: 3px;
                }}
                .summary {{
                    background-color: #fff9e6;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                    border-left: 4px solid #ffc107;
                }}
            </style>
        </head>
        <body>
            <h1>{title}</h1>

            <div class="metadata">
                <strong>Analyse-Details</strong><br>
                Erstellt am: {datetime.now().strftime("%d.%m.%Y %H:%M:%S")}<br>
                Wortanzahl: {original_text.get("wordCount", "Unbekannt")}<br>
                Lesezeit: {original_text.get("estimatedReadingTime", "Unbekannt")} Minuten
            </div>"""

        # Summary
        if analysis.get("summary"):
            html += f"""
            <h2>Zusammenfassung</h2>
            <div class="summary">{analysis["summary"]}</div>"""

        # Key points
        if analysis.get("keyPoints"):
            html += "<h2>Hauptpunkte</h2>"

            for i, point in enumerate(analysis["keyPoints"], 1):
                html += f"""
                <div class="key-point">
                    <h3>{i}. {point.get("title", "")}</h3>
                    {f"<p>{point.get('description', '')}</p>" if point.get("description") else ""}
                    <div class="point-meta">
                        {f"Kategorie: {point.get('category', '')}" if point.get("category") else ""}
                        {f" | Wichtigkeit: {point.get('importance', '')}" if point.get("importance") else ""}
                    </div>
                </div>"""

        # Categories
        if analysis.get("categories"):
            html += "<h2>Thematische Kategorien</h2>"

            for category, points in analysis["categories"].items():
                html += f"""
                <div class="category-section">
                    <strong>{category}:</strong><br>
                    {", ".join(points) if isinstance(points, list) else points}
                </div>"""

        # Action items
        if analysis.get("actionItems"):
            html += "<h2>Handlungsempfehlungen</h2>"

            for i, action in enumerate(analysis["actionItems"], 1):
                html += f"""
                <div class="action-item">
                    <strong>{i}. {action.get("action", "")}</strong><br>
                    {f"Priorität: {action.get('priority', '')}" if action.get("priority") else ""}
                    {f" | Zeitrahmen: {action.get('timeframe', '')}" if action.get("timeframe") else ""}
                </div>"""

        html += """
        </body>
        </html>"""

        return html

    async def create_pdf(self, html_content: str, file_path: str):
        """
        Create PDF from HTML content
        :param html_content: HTML content
        :param file_path: Output file path
        """
        try:
            # Create PDF using WeasyPrint
            HTML(string=html_content).write_pdf(file_path)
            logger.info(f"✅ PDF document saved: {os.path.basename(file_path)}")
        except Exception as error:
            logger.error(f"❌ Failed to create PDF: {error}")
            raise error

    async def export_both(self, analysis_data: Dict[Any, Any], options: Dict[Any, Any] = None) -> Dict[Any, Any]:
        """
        Export in both formats
        :param analysis_data: Analysis results
        :param options: Export options
        :return: Export results
        """
        if options is None:
            options = {}

        try:
            base_filename = options.get("filename", f"analyse_{int(datetime.now().timestamp())}")
            if "." in base_filename:
                base_filename = ".".join(base_filename.split(".")[:-1])

            # Export to both formats concurrently
            word_result = await self.export_to_word(analysis_data, {
                **options,
                "filename": f"{base_filename}.docx"
            })

            pdf_result = await self.export_to_pdf(analysis_data, {
                **options,
                "filename": f"{base_filename}.pdf"
            })

            return {
                "success": True,
                "word": word_result,
                "pdf": pdf_result,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as error:
            logger.error(f"❌ Dual export failed: {error}")
            raise error

    def get_exported_files(self) -> List[Dict[Any, Any]]:
        """
        Get list of exported files
        :return: List of exported files
        """
        try:
            files = []
            for file_path in self.export_dir.iterdir():
                if file_path.is_file():
                    stat = file_path.stat()
                    files.append({
                        "filename": file_path.name,
                        "path": str(file_path),
                        "size": stat.st_size,
                        "created": datetime.fromtimestamp(stat.st_birthtime if hasattr(stat, 'st_birthtime') else stat.st_ctime).isoformat(),
                        "format": file_path.suffix.lower()
                    })
            return files
        except Exception as error:
            logger.error(f"❌ Failed to list exported files: {error}")
            return []

    def cleanup_old_files(self, max_age_days: int = 7) -> int:
        """
        Clean up old export files
        :param max_age_days: Maximum age in days
        :return: Number of deleted files
        """
        try:
            from datetime import timedelta

            files = self.get_exported_files()
            cutoff_date = datetime.now() - timedelta(days=max_age_days)
            deleted_count = 0

            for file_info in files:
                created_date = datetime.fromisoformat(file_info["created"])
                if created_date < cutoff_date:
                    try:
                        Path(file_info["path"]).unlink()
                        deleted_count += 1
                        logger.info(f"🗑️ Deleted old export: {file_info['filename']}")
                    except Exception as e:
                        logger.error(f"❌ Failed to delete file {file_info['filename']}: {e}")

            return deleted_count
        except Exception as error:
            logger.error(f"❌ Cleanup failed: {error}")
            return 0

if __name__ == "__main__":
    # Example usage
    async def main():
        export_service = DocumentExportService()
        print("Document Export Agent initialized successfully!")

        # Example data
        example_data = {
            "analysis": {
                "summary": "This is an example summary of the text analysis.",
                "keyPoints": [
                    {
                        "title": "Key Point 1",
                        "description": "This is the first key point description.",
                        "category": "Technology",
                        "importance": "High"
                    }
                ],
                "categories": {
                    "Technology": ["AI", "Machine Learning", "Blockchain"]
                },
                "actionItems": [
                    {
                        "action": "Review the analysis results",
                        "priority": "High",
                        "timeframe": "This week"
                    }
                ]
            },
            "originalText": {
                "wordCount": 1250,
                "estimatedReadingTime": 5
            }
        }

        try:
            # Test export to Word
            word_result = await export_service.export_to_word(example_data, {"title": "Example Analysis"})
            print(f"✅ Word export successful: {word_result['filename']}")

            # Test export to PDF
            pdf_result = await export_service.export_to_pdf(example_data, {"title": "Example Analysis"})
            print(f"✅ PDF export successful: {pdf_result['filename']}")
        except Exception as e:
            print(f"❌ Export failed: {e}")

    asyncio.run(main())