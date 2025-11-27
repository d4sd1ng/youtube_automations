#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Pipeline Orchestrator Agent
Coordinates the content generation pipeline with enhanced prompting
"""

import os
import sys
import uuid
import json
import asyncio
from pathlib import Path
from typing import Dict, Any, Optional

class PipelineOrchestratorAgent:
    def __init__(self):
        self.jobs_dir = Path(__file__).parent.parent.parent / "data" / "jobs"
        self.outputs_dir = Path(__file__).parent.parent.parent / "data" / "outputs"
        self.ensure_directories()
        
        # Job queue and processing
        self.job_queue = []
        self.active_jobs = {}
        self.max_concurrent_jobs = int(os.getenv("MAX_CONCURRENT_JOBS", "3"))
        
        # Job priorities
        self.job_priorities = {
            'high': 3,
            'medium': 2,
            'low': 1
        }
    
    def ensure_directories(self):
        """Ensure required directories exist"""
        for directory in [self.jobs_dir, self.outputs_dir]:
            directory.mkdir(parents=True, exist_ok=True)
    
    async def create_pipeline(self, channel_id: str, topic: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a new pipeline"""
        if options is None:
            options = {}
            
        try:
            print(f"\nCreating new pipeline for channel {channel_id} on topic: {topic}")
            pipeline_id = str(uuid.uuid4())
            
            pipeline_state = {
                "pipeline_id": pipeline_id,
                "channel_id": channel_id,
                "topic": topic,
                "status": "initializing",
                "created_at": self.get_current_timestamp(),
                "updated_at": self.get_current_timestamp(),
                "steps": {},
                "options": options
            }
            
            await self.save_pipeline_state(pipeline_state)
            
            pipeline_state["status"] = "completed"
            pipeline_state["updated_at"] = self.get_current_timestamp()
            await self.save_pipeline_state(pipeline_state)
            
            print(f"\nPipeline {pipeline_id} completed successfully!")
            return pipeline_state
            
        except Exception as error:
            print(f"Pipeline creation failed: {error}")
            raise error
    
    async def save_pipeline_state(self, pipeline_state: Dict[str, Any]):
        """Save pipeline state to file"""
        try:
            file_path = self.jobs_dir / f"{pipeline_state['pipeline_id']}.json"
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(pipeline_state, f, indent=2, ensure_ascii=False)
            print(f"Saving pipeline state for pipeline {pipeline_state['pipeline_id']}")
        except Exception as error:
            print(f"Failed to save pipeline state: {error}")
            raise error
    
    def get_current_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.now().isoformat()

async def main():
    """Main entry point"""
    orchestrator = PipelineOrchestratorAgent()
    
    # Example usage
    result = await orchestrator.create_pipeline(
        channel_id="test-channel",
        topic="Test Topic",
        options={"priority": "medium"}
    )
    
    print("Pipeline Orchestrator Agent initialized successfully.")
    print(f"Created pipeline: {result['pipeline_id']}")

if __name__ == "__main__":
    asyncio.run(main())