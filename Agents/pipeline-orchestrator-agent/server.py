#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Pipeline Orchestrator Agent Server
WebSocket server for real-time pipeline updates
"""

import asyncio
import websockets
import json
from pathlib import Path
import sys

# Add parent directory to path to import app modules
sys.path.append(str(Path(__file__).parent))

from app import PipelineOrchestratorAgent

class PipelineOrchestratorServer:
    def __init__(self, host="localhost", port=8765):
        self.host = host
        self.port = port
        self.orchestrator = PipelineOrchestratorAgent()
        self.clients = set()

    async def register_client(self, websocket):
        """Register a new WebSocket client"""
        self.clients.add(websocket)
        print(f"🔌 WebSocket client connected. Total clients: {len(self.clients)}")

    async def unregister_client(self, websocket):
        """Unregister a WebSocket client"""
        self.clients.discard(websocket)
        print(f"🔌 WebSocket client disconnected. Total clients: {len(self.clients)}")

    async def send_update(self, update_data):
        """Send real-time update to all connected clients"""
        if not self.clients:
            return

        message = json.dumps(update_data)
        # Send to all connected clients
        await asyncio.gather(
            *[client.send(message) for client in self.clients if client.open],
            return_exceptions=True
        )

    async def handle_client(self, websocket, path):
        """Handle WebSocket client connection"""
        await self.register_client(websocket)
        try:
            async for message in websocket:
                # Handle incoming messages from clients if needed
                pass
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            await self.unregister_client(websocket)

    async def start_server(self):
        """Start the WebSocket server"""
        server = await websockets.serve(
            self.handle_client,
            self.host,
            self.port
        )
        print(f"🌐 WebSocket server initialized on {self.host}:{self.port}")
        await server.wait_closed()

async def main():
    """Main entry point for the server"""
    server = PipelineOrchestratorServer()
    await server.start_server()

if __name__ == "__main__":
    asyncio.run(main())