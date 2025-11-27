#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Token Cost Calculator
Calculates estimated and actual costs for LLM usage
"""

import json
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

class TokenCostCalculator:
    def __init__(self):
        # Token costs per 1K tokens (in USD) - Updated as of 2024
        self.provider_costs = {
            "openai": {
                "gpt-4": {"input": 0.03, "output": 0.06},
                "gpt-4-turbo": {"input": 0.01, "output": 0.03},
                "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
                "whisper-1": {"audio": 0.006}  # per minute
            },
            "anthropic": {
                "claude-3-opus": {"input": 0.015, "output": 0.075},
                "claude-3-sonnet": {"input": 0.003, "output": 0.015},
                "claude-3-haiku": {"input": 0.00025, "output": 0.00125}
            },
            "ollama": {
                "llama2:7b": {"input": 0, "output": 0},  # Local, no cost
                "codellama:7b": {"input": 0, "output": 0},
                "mistral:7b": {"input": 0, "output": 0}
            }
        }

        # Estimated token usage per content type and workflow step
        self.content_type_estimates = {
            # Politik Content
            "political_content": {
                "research": {"input": 500, "output": 1500, "ai_required": True},
                "outline": {"input": 800, "output": 1200, "ai_required": True},
                "script_generation": {"input": 1200, "output": 3000, "ai_required": True},
                "fact_checking": {"input": 2000, "output": 800, "ai_required": True},
                "tone_adjustment": {"input": 1500, "output": 1500, "ai_required": True},
                "verification": {"input": 0, "output": 0, "ai_required": False},
                "thumbnail": {"input": 300, "output": 100, "ai_required": True},
                "description": {"input": 600, "output": 400, "ai_required": True},
                "tags": {"input": 200, "output": 150, "ai_required": True}
            },

            # AI Content
            "ai_content": {
                "research": {"input": 600, "output": 2000, "ai_required": True},
                "technical_analysis": {"input": 1000, "output": 2500, "ai_required": True},
                "script_generation": {"input": 1500, "output": 4000, "ai_required": True},
                "code_examples": {"input": 800, "output": 1500, "ai_required": True},
                "explanation": {"input": 1200, "output": 2000, "ai_required": True},
                "verification": {"input": 0, "output": 0, "ai_required": False},
                "thumbnail": {"input": 400, "output": 150, "ai_required": True},
                "description": {"input": 700, "output": 500, "ai_required": True},
                "tags": {"input": 250, "output": 200, "ai_required": True}
            },

            # Viral Shorts
            "viral_shorts": {
                "trend_analysis": {"input": 400, "output": 800, "ai_required": True},
                "hook_generation": {"input": 300, "output": 600, "ai_required": True},
                "script_generation": {"input": 500, "output": 800, "ai_required": True},
                "viral_optimization": {"input": 600, "output": 400, "ai_required": True},
                "verification": {"input": 0, "output": 0, "ai_required": False},
                "thumbnail": {"input": 200, "output": 100, "ai_required": True},
                "description": {"input": 300, "output": 200, "ai_required": True},
                "hashtags": {"input": 150, "output": 100, "ai_required": True}
            },

            # Educational Content
            "educational": {
                "curriculum_planning": {"input": 800, "output": 1500, "ai_required": True},
                "content_structuring": {"input": 1000, "output": 2000, "ai_required": True},
                "script_generation": {"input": 1500, "output": 3500, "ai_required": True},
                "examples_generation": {"input": 700, "output": 1200, "ai_required": True},
                "quiz_creation": {"input": 500, "output": 800, "ai_required": True},
                "verification": {"input": 0, "output": 0, "ai_required": False},
                "thumbnail": {"input": 350, "output": 120, "ai_required": True},
                "description": {"input": 600, "output": 400, "ai_required": True},
                "tags": {"input": 200, "output": 150, "ai_required": True}
            },

            # Audio Analysis
            "audio_analysis": {
                "transcription": {"input": 0, "output": 0, "ai_required": False, "audio_minutes": 1},  # Whisper cost
                "text_analysis": {"input": 2000, "output": 1500, "ai_required": True},
                "key_points": {"input": 1500, "output": 1000, "ai_required": True},
                "summarization": {"input": 1200, "output": 800, "ai_required": True},
                "categorization": {"input": 800, "output": 500, "ai_required": True},
                "action_items": {"input": 600, "output": 400, "ai_required": True},
                "verification": {"input": 0, "output": 0, "ai_required": False}
            },

            # Multi-Media Analysis
            "multimedia_analysis": {
                "image_ocr": {"input": 0, "output": 500, "ai_required": False},
                "image_analysis": {"input": 1000, "output": 800, "ai_required": True},
                "video_analysis": {"input": 1500, "output": 1200, "ai_required": True},
                "content_extraction": {"input": 800, "output": 1000, "ai_required": True},
                "cross_media_synthesis": {"input": 2000, "output": 1500, "ai_required": True},
                "verification": {"input": 0, "output": 0, "ai_required": False}
            }
        }

    def calculate_estimated_cost(self, content_type: str, provider: str = "ollama", model: str = "llama2:7b", options: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Calculate estimated cost for a content type
        """
        estimates = self.content_type_estimates.get(content_type)
        if not estimates:
            raise Exception(f"Unknown content type: {content_type}")

        model_costs = self.provider_costs.get(provider, {}).get(model)
        if not model_costs:
            raise Exception(f"Unknown provider/model: {provider}/{model}")

        breakdown = {}
        total_input_tokens = 0
        total_output_tokens = 0
        total_input_cost = 0
        total_output_cost = 0
        total_audio_minutes = 0
        total_audio_cost = 0

        # Calculate cost for each step
        for step, estimate in estimates.items():
            step_cost = {
                "step": step,
                "ai_required": estimate["ai_required"],
                "input_tokens": estimate.get("input", 0),
                "output_tokens": estimate.get("output", 0),
                "audio_minutes": estimate.get("audio_minutes", 0),
                "input_cost": 0,
                "output_cost": 0,
                "audio_cost": 0,
                "total_cost": 0
            }

            if estimate["ai_required"]:
                # Calculate token costs
                if model_costs.get("input") and model_costs.get("output"):
                    step_cost["input_cost"] = (estimate.get("input", 0) / 1000) * model_costs["input"]
                    step_cost["output_cost"] = (estimate.get("output", 0) / 1000) * model_costs["output"]
                    total_input_tokens += estimate.get("input", 0)
                    total_output_tokens += estimate.get("output", 0)
                    total_input_cost += step_cost["input_cost"]
                    total_output_cost += step_cost["output_cost"]

            # Calculate audio costs (for Whisper)
            if estimate.get("audio_minutes") and model_costs.get("audio"):
                audio_minutes = options.get("audio_duration", estimate.get("audio_minutes", 0))
                step_cost["audio_cost"] = audio_minutes * model_costs["audio"]
                total_audio_minutes += audio_minutes
                total_audio_cost += step_cost["audio_cost"]

            step_cost["total_cost"] = step_cost["input_cost"] + step_cost["output_cost"] + step_cost["audio_cost"]
            breakdown[step] = step_cost

        total_cost = total_input_cost + total_output_cost + total_audio_cost

        return {
            "contentType": content_type,
            "provider": provider,
            "model": model,
            "summary": {
                "total_steps": len(estimates),
                "ai_required_steps": len([e for e in estimates.values() if e["ai_required"]]),
                "total_input_tokens": total_input_tokens,
                "total_output_tokens": total_output_tokens,
                "total_tokens": total_input_tokens + total_output_tokens,
                "total_audio_minutes": total_audio_minutes,
                "total_input_cost": round(total_input_cost * 10000) / 10000,
                "total_output_cost": round(total_output_cost * 10000) / 10000,
                "total_audio_cost": round(total_audio_cost * 10000) / 10000,
                "total_cost": round(total_cost * 10000) / 10000
            },
            "breakdown": breakdown,
            "timestamp": datetime.now().isoformat()
        }

    def calculate_actual_cost(self, usage_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate actual cost from token usage data
        """
        cost_by_provider = {}
        total_cost = 0

        for record in usage_data:
            provider = record.get("provider", "")
            model = record.get("model", "")
            input_tokens = record.get("input_tokens", 0)
            output_tokens = record.get("output_tokens", 0)
            audio_minutes = record.get("audio_minutes", 0)

            if provider not in cost_by_provider:
                cost_by_provider[provider] = {}

            if model not in cost_by_provider[provider]:
                cost_by_provider[provider][model] = {
                    "input_tokens": 0,
                    "output_tokens": 0,
                    "audio_minutes": 0,
                    "input_cost": 0,
                    "output_cost": 0,
                    "audio_cost": 0,
                    "total_cost": 0,
                    "requests": 0
                }

            model_data = cost_by_provider[provider][model]
            model_costs = self.provider_costs.get(provider, {}).get(model, {})

            # Accumulate usage
            model_data["input_tokens"] += input_tokens
            model_data["output_tokens"] += output_tokens
            model_data["audio_minutes"] += audio_minutes
            model_data["requests"] += 1

            # Calculate costs
            if model_costs.get("input") and input_tokens:
                model_data["input_cost"] += (input_tokens / 1000) * model_costs["input"]
            if model_costs.get("output") and output_tokens:
                model_data["output_cost"] += (output_tokens / 1000) * model_costs["output"]
            if model_costs.get("audio") and audio_minutes:
                model_data["audio_cost"] += audio_minutes * model_costs["audio"]

            model_data["total_cost"] = model_data["input_cost"] + model_data["output_cost"] + model_data["audio_cost"]
            total_cost += model_data["input_cost"] + model_data["output_cost"] + model_data["audio_cost"]

        return {
            "total_cost": round(total_cost * 10000) / 10000,
            "breakdown": cost_by_provider,
            "timestamp": datetime.now().isoformat()
        }

    def get_provider_comparison(self, content_type: str, options: Dict[str, Any] = {}) -> Dict[str, Any]:
        """
        Get cost comparison between different providers for same content
        """
        comparisons = {}

        # Compare major providers
        providers_to_compare = [
            {"provider": "ollama", "model": "llama2:7b"},
            {"provider": "openai", "model": "gpt-3.5-turbo"},
            {"provider": "openai", "model": "gpt-4-turbo"},
            {"provider": "anthropic", "model": "claude-3-haiku"},
            {"provider": "anthropic", "model": "claude-3-sonnet"}
        ]

        for provider_model in providers_to_compare:
            provider = provider_model["provider"]
            model = provider_model["model"]
            try:
                cost = self.calculate_estimated_cost(content_type, provider, model, options)
                comparisons[f"{provider}/{model}"] = {
                    "total_cost": cost["summary"]["total_cost"],
                    "total_tokens": cost["summary"]["total_tokens"],
                    "cost_per_token": cost["summary"]["total_tokens"] > 0 and
                                    cost["summary"]["total_cost"] / cost["summary"]["total_tokens"] * 1000 or 0
                }
            except Exception as error:
                # Skip if provider/model not available
                pass

        # Sort by total cost
        sorted_comparisons = dict(sorted(comparisons.items(), key=lambda x: x[1]["total_cost"]))

        return {
            "content_type": content_type,
            "options": options,
            "comparison": sorted_comparisons,
            "cheapest": list(sorted_comparisons.keys())[0] if sorted_comparisons else None,
            "timestamp": datetime.now().isoformat()
        }

    def get_monthly_projection(self, content_type: str, videos_per_week: int, provider: str = "ollama", model: str = "llama2:7b") -> Dict[str, Any]:
        """
        Get monthly cost projection based on usage patterns
        """
        cost_per_video = self.calculate_estimated_cost(content_type, provider, model)
        videos_per_month = videos_per_week * 4.33  # Average weeks per month

        return {
            "content_type": content_type,
            "provider": provider,
            "model": model,
            "videos_per_week": videos_per_week,
            "videos_per_month": round(videos_per_month * 100) / 100,
            "cost_per_video": cost_per_video["summary"]["total_cost"],
            "monthly_total": round(cost_per_video["summary"]["total_cost"] * videos_per_month * 100) / 100,
            "breakdown": {
                "input_tokens_per_month": cost_per_video["summary"]["total_input_tokens"] * videos_per_month,
                "output_tokens_per_month": cost_per_video["summary"]["total_output_tokens"] * videos_per_month,
                "total_tokens_per_month": cost_per_video["summary"]["total_tokens"] * videos_per_month
            },
            "timestamp": datetime.now().isoformat()
        }

    def get_available_content_types(self) -> Dict[str, Any]:
        """Get available content types with descriptions"""
        return {
            "political_content": {
                "description": "Political analysis and commentary videos",
                "steps": len(self.content_type_estimates["political_content"]),
                "avg_tokens": self.calculate_estimated_cost("political_content")["summary"]["total_tokens"]
            },
            "ai_content": {
                "description": "AI and technology focused content",
                "steps": len(self.content_type_estimates["ai_content"]),
                "avg_tokens": self.calculate_estimated_cost("ai_content")["summary"]["total_tokens"]
            },
            "viral_shorts": {
                "description": "Short-form viral content",
                "steps": len(self.content_type_estimates["viral_shorts"]),
                "avg_tokens": self.calculate_estimated_cost("viral_shorts")["summary"]["total_tokens"]
            },
            "educational": {
                "description": "Educational and instructional content",
                "steps": len(self.content_type_estimates["educational"]),
                "avg_tokens": self.calculate_estimated_cost("educational")["summary"]["total_tokens"]
            },
            "audio_analysis": {
                "description": "Audio transcription and analysis",
                "steps": len(self.content_type_estimates["audio_analysis"]),
                "avg_tokens": self.calculate_estimated_cost("audio_analysis")["summary"]["total_tokens"]
            },
            "multimedia_analysis": {
                "description": "Multi-media content analysis",
                "steps": len(self.content_type_estimates["multimedia_analysis"]),
                "avg_tokens": self.calculate_estimated_cost("multimedia_analysis")["summary"]["total_tokens"]
            }
        }

    def update_provider_costs(self, provider: str, model: str, costs: Dict[str, float]) -> None:
        """Update provider costs (for dynamic pricing)"""
        if provider not in self.provider_costs:
            self.provider_costs[provider] = {}
        self.provider_costs[provider][model] = costs

    def get_provider_costs(self) -> Dict[str, Any]:
        """Get current provider costs"""
        return self.provider_costs


# Main execution
if __name__ == "__main__":
    calculator = TokenCostCalculator()
    print("🎬 Token Cost Calculator initialized")

    # Example usage
    content_types = calculator.get_available_content_types()
    print(f"📊 Available content types: {len(content_types)}")
    for content_type, info in list(content_types.items())[:3]:  # Show first 3
        print(f"  - {content_type}: {info['description']}")