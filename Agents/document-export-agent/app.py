#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Document Export Agent
Service for exporting documents in various formats
"""

import os
import json
import logging
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentExportAgent:
    def __init__(self):
        self.data_dir = Path(__file__).parent / "data"
        self.data_dir.mkdir(exist_ok=True)

    async def export_document(self, document_id: str, format_type: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Export a document in the specified format

        Args:
            document_id (str): The ID of the document to export
            format_type (str): The format to export to (pdf, docx, txt, html, md)
            options (Dict[str, Any]): Additional export options

        Returns:
            Dict[str, Any]: Result of the export operation
        """
        try:
            # Validate inputs
            if not document_id:
                raise ValueError("Document ID is required")

            if format_type not in ['pdf', 'docx', 'txt', 'html', 'md']:
                raise ValueError(f"Unsupported format: {format_type}")

            # Load document data
            document = await self._load_document(document_id)
            if not document:
                raise ValueError(f"Document not found: {document_id}")

            # Process export based on format
            exported_file_path = await self._process_export(document, format_type, options)

            # Save export record
            export_record = {
                "export_id": f"exp_{datetime.now().strftime('%Y%m%d%H%M%S%f')}",
                "document_id": document_id,
                "format": format_type,
                "exported_at": datetime.now().isoformat(),
                "file_path": str(exported_file_path),
                "options": options or {}
            }

            await self._save_export_record(export_record)

            return {
                "success": True,
                "message": f"Document exported successfully as {format_type}",
                "export_id": export_record["export_id"],
                "file_path": str(exported_file_path)
            }

        except Exception as e:
            logger.error(f"Error exporting document: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to export document: {str(e)}"
            }

    async def _load_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Load document data from storage"""
        try:
            document_path = self.data_dir / f"{document_id}.json"
            if document_path.exists():
                with open(document_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return None
        except Exception as e:
            logger.error(f"Error loading document: {str(e)}")
            return None

    async def _process_export(self, document: Dict[str, Any], format_type: str, options: Dict[str, Any]) -> Path:
        """Process the document export based on format type"""
        filename = f"{document.get('id', 'document')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{format_type}"
        export_path = self.data_dir / filename

        if format_type == 'txt':
            await self._export_as_txt(document, export_path)
        elif format_type == 'html':
            await self._export_as_html(document, export_path, options)
        elif format_type == 'md':
            await self._export_as_md(document, export_path)
        elif format_type == 'pdf':
            await self._export_as_pdf(document, export_path, options)
        elif format_type == 'docx':
            await self._export_as_docx(document, export_path, options)

        return export_path

    async def _export_as_txt(self, document: Dict[str, Any], export_path: Path):
        """Export document as plain text"""
        content = document.get('content', '')
        with open(export_path, 'w', encoding='utf-8') as f:
            f.write(content)

    async def _export_as_html(self, document: Dict[str, Any], export_path: Path, options: Dict[str, Any]):
        """Export document as HTML"""
        title = document.get('title', 'Untitled Document')
        content = document.get('content', '')

        # Apply styling if specified
        css_style = ""
        if options and options.get('styled'):
            css_style = """
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #333; }
                p { line-height: 1.6; }
            </style>
            """

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            {css_style}
        </head>
        <body>
            <h1>{title}</h1>
            <div>{content}</div>
        </body>
        </html>
        """

        with open(export_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

    async def _export_as_md(self, document: Dict[str, Any], export_path: Path):
        """Export document as Markdown"""
        title = document.get('title', 'Untitled Document')
        content = document.get('content', '')

        md_content = f"# {title}\n\n{content}"

        with open(export_path, 'w', encoding='utf-8') as f:
            f.write(md_content)

    async def _export_as_pdf(self, document: Dict[str, Any], export_path: Path, options: Dict[str, Any]):
        """Export document as PDF (placeholder implementation)"""
        # In a real implementation, you would use a library like ReportLab or WeasyPrint
        # For now, we'll create a simple text file with PDF extension to demonstrate
        content = f"PDF Export of {document.get('title', 'Untitled Document')}\n\n{document.get('content', '')}"
        with open(export_path, 'w', encoding='utf-8') as f:
            f.write(content)

    async def _export_as_docx(self, document: Dict[str, Any], export_path: Path, options: Dict[str, Any]):
        """Export document as DOCX (placeholder implementation)"""
        # In a real implementation, you would use python-docx library
        # For now, we'll create a simple text file with DOCX extension to demonstrate
        content = f"DOCX Export of {document.get('title', 'Untitled Document')}\n\n{document.get('content', '')}"
        with open(export_path, 'w', encoding='utf-8') as f:
            f.write(content)

    async def _save_export_record(self, export_record: Dict[str, Any]):
        """Save export record to storage"""
        record_path = self.data_dir / f"export_{export_record['export_id']}.json"
        with open(record_path, 'w', encoding='utf-8') as f:
            json.dump(export_record, f, indent=2, ensure_ascii=False)

    async def get_export_history(self, document_id: str = None) -> Dict[str, Any]:
        """Get export history for a document or all exports"""
        try:
            exports = []
            for file_path in self.data_dir.glob("export_*.json"):
                with open(file_path, 'r', encoding='utf-8') as f:
                    export_record = json.load(f)
                    if document_id is None or export_record.get('document_id') == document_id:
                        exports.append(export_record)

            # Sort by export date
            exports.sort(key=lambda x: x.get('exported_at', ''), reverse=True)

            return {
                "success": True,
                "exports": exports
            }
        except Exception as e:
            logger.error(f"Error retrieving export history: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to retrieve export history: {str(e)}"
            }

# Main execution
if __name__ == "__main__":
    agent = DocumentExportAgent()
    print("Document Export Agent initialized")