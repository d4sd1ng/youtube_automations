#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Content Approval Agent
Handles content approval workflows with submission, review, and approval processes
"""

import os
import json
import uuid
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path
from enum import Enum

class ApprovalStatus(Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_REVISION = "needs_revision"

class ContentApprovalAgent:
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent.parent / "data"
        self.approvals_dir = self.base_dir / "content-approvals"
        self.ensure_directories()

    def ensure_directories(self) -> None:
        """Ensure required directories exist"""
        dirs = [self.approvals_dir]
        for directory in dirs:
            directory.mkdir(parents=True, exist_ok=True)

    async def submit_content_for_approval(self, content_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Submit content for approval
        """
        try:
            approval_id = str(uuid.uuid4())
            timestamp = datetime.now().isoformat()

            approval_data = {
                "approvalId": approval_id,
                "status": ApprovalStatus.PENDING.value,
                "submittedAt": timestamp,
                "submittedBy": content_data.get("submittedBy", "unknown"),
                "content": content_data.get("content", {}),
                "contentType": content_data.get("contentType", "general"),
                "priority": content_data.get("priority", "medium"),
                "reviewers": content_data.get("reviewers", []),
                "comments": [],
                "history": [{
                    "action": "submitted",
                    "timestamp": timestamp,
                    "actor": content_data.get("submittedBy", "unknown")
                }]
            }

            # Save approval data
            await self.save_approval_data(approval_id, approval_data)

            print(f"✅ Content submitted for approval: {approval_id}")

            return {
                "success": True,
                "approvalId": approval_id,
                "status": ApprovalStatus.PENDING.value,
                "message": "Content submitted for approval successfully"
            }

        except Exception as error:
            print(f"❌ Failed to submit content for approval: {error}")
            return {
                "success": False,
                "error": str(error),
                "message": "Failed to submit content for approval"
            }

    async def review_content(self, approval_id: str, reviewer_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Review content and provide feedback
        """
        try:
            # Load existing approval data
            approval_data = await self.load_approval_data(approval_id)
            if not approval_data:
                return {
                    "success": False,
                    "error": "Approval not found",
                    "message": f"No approval found with ID: {approval_id}"
                }

            # Update status to under review
            approval_data["status"] = ApprovalStatus.UNDER_REVIEW.value
            approval_data["reviewStartedAt"] = datetime.now().isoformat()
            approval_data["currentReviewer"] = reviewer_data.get("reviewer", "unknown")

            # Add review comment
            comment = {
                "id": str(uuid.uuid4()),
                "reviewer": reviewer_data.get("reviewer", "unknown"),
                "comment": reviewer_data.get("comment", ""),
                "timestamp": datetime.now().isoformat(),
                "type": reviewer_data.get("commentType", "general")
            }
            approval_data["comments"].append(comment)

            # Add to history
            approval_data["history"].append({
                "action": "review_started",
                "timestamp": datetime.now().isoformat(),
                "actor": reviewer_data.get("reviewer", "unknown")
            })

            # Save updated data
            await self.save_approval_data(approval_id, approval_data)

            print(f"✅ Content review started: {approval_id}")

            return {
                "success": True,
                "approvalId": approval_id,
                "status": ApprovalStatus.UNDER_REVIEW.value,
                "message": "Content review started successfully"
            }

        except Exception as error:
            print(f"❌ Failed to start content review: {error}")
            return {
                "success": False,
                "error": str(error),
                "message": "Failed to start content review"
            }

    async def approve_content(self, approval_id: str, approver_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Approve content
        """
        try:
            # Load existing approval data
            approval_data = await self.load_approval_data(approval_id)
            if not approval_data:
                return {
                    "success": False,
                    "error": "Approval not found",
                    "message": f"No approval found with ID: {approval_id}"
                }

            # Update status to approved
            approval_data["status"] = ApprovalStatus.APPROVED.value
            approval_data["approvedAt"] = datetime.now().isoformat()
            approval_data["approvedBy"] = approver_data.get("approver", "unknown")
            approval_data["approvalNotes"] = approver_data.get("notes", "")

            # Add to history
            approval_data["history"].append({
                "action": "approved",
                "timestamp": datetime.now().isoformat(),
                "actor": approver_data.get("approver", "unknown"),
                "notes": approver_data.get("notes", "")
            })

            # Save updated data
            await self.save_approval_data(approval_id, approval_data)

            print(f"✅ Content approved: {approval_id}")

            return {
                "success": True,
                "approvalId": approval_id,
                "status": ApprovalStatus.APPROVED.value,
                "message": "Content approved successfully"
            }

        except Exception as error:
            print(f"❌ Failed to approve content: {error}")
            return {
                "success": False,
                "error": str(error),
                "message": "Failed to approve content"
            }

    async def reject_content(self, approval_id: str, rejecter_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Reject content with reason
        """
        try:
            # Load existing approval data
            approval_data = await self.load_approval_data(approval_id)
            if not approval_data:
                return {
                    "success": False,
                    "error": "Approval not found",
                    "message": f"No approval found with ID: {approval_id}"
                }

            # Update status to rejected
            approval_data["status"] = ApprovalStatus.REJECTED.value
            approval_data["rejectedAt"] = datetime.now().isoformat()
            approval_data["rejectedBy"] = rejecter_data.get("rejecter", "unknown")
            approval_data["rejectionReason"] = rejecter_data.get("reason", "")

            # Add to history
            approval_data["history"].append({
                "action": "rejected",
                "timestamp": datetime.now().isoformat(),
                "actor": rejecter_data.get("rejecter", "unknown"),
                "reason": rejecter_data.get("reason", "")
            })

            # Save updated data
            await self.save_approval_data(approval_id, approval_data)

            print(f"❌ Content rejected: {approval_id}")

            return {
                "success": True,
                "approvalId": approval_id,
                "status": ApprovalStatus.REJECTED.value,
                "message": "Content rejected successfully"
            }

        except Exception as error:
            print(f"❌ Failed to reject content: {error}")
            return {
                "success": False,
                "error": str(error),
                "message": "Failed to reject content"
            }

    async def request_revision(self, approval_id: str, revision_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Request revision for content
        """
        try:
            # Load existing approval data
            approval_data = await self.load_approval_data(approval_id)
            if not approval_data:
                return {
                    "success": False,
                    "error": "Approval not found",
                    "message": f"No approval found with ID: {approval_id}"
                }

            # Update status to needs revision
            approval_data["status"] = ApprovalStatus.NEEDS_REVISION.value
            approval_data["revisionRequestedAt"] = datetime.now().isoformat()
            approval_data["revisionRequestedBy"] = revision_data.get("requester", "unknown")
            approval_data["revisionNotes"] = revision_data.get("notes", "")

            # Add to history
            approval_data["history"].append({
                "action": "revision_requested",
                "timestamp": datetime.now().isoformat(),
                "actor": revision_data.get("requester", "unknown"),
                "notes": revision_data.get("notes", "")
            })

            # Save updated data
            await self.save_approval_data(approval_id, approval_data)

            print(f"🔄 Revision requested for content: {approval_id}")

            return {
                "success": True,
                "approvalId": approval_id,
                "status": ApprovalStatus.NEEDS_REVISION.value,
                "message": "Revision requested successfully"
            }

        except Exception as error:
            print(f"❌ Failed to request revision: {error}")
            return {
                "success": False,
                "error": str(error),
                "message": "Failed to request revision"
            }

    async def get_approval_status(self, approval_id: str) -> Dict[str, Any]:
        """
        Get current status of an approval
        """
        try:
            approval_data = await self.load_approval_data(approval_id)
            if not approval_data:
                return {
                    "success": False,
                    "error": "Approval not found",
                    "message": f"No approval found with ID: {approval_id}"
                }

            return {
                "success": True,
                "approvalId": approval_id,
                "status": approval_data["status"],
                "data": approval_data
            }

        except Exception as error:
            print(f"❌ Failed to get approval status: {error}")
            return {
                "success": False,
                "error": str(error),
                "message": "Failed to get approval status"
            }

    async def list_approvals(self, status: Optional[str] = None, limit: int = 50) -> Dict[str, Any]:
        """
        List approvals with optional status filter
        """
        try:
            approvals = []

            # Get all approval files
            for file_path in self.approvals_dir.glob("*.json"):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        approval_data = json.load(f)

                        # Filter by status if provided
                        if status is None or approval_data.get("status") == status:
                            approvals.append({
                                "approvalId": approval_data.get("approvalId"),
                                "status": approval_data.get("status"),
                                "submittedAt": approval_data.get("submittedAt"),
                                "contentType": approval_data.get("contentType"),
                                "submittedBy": approval_data.get("submittedBy")
                            })
                except Exception:
                    continue

            # Sort by submission date (newest first)
            approvals.sort(key=lambda x: x["submittedAt"], reverse=True)

            # Apply limit
            approvals = approvals[:limit]

            return {
                "success": True,
                "approvals": approvals,
                "count": len(approvals),
                "message": f"Found {len(approvals)} approvals"
            }

        except Exception as error:
            print(f"❌ Failed to list approvals: {error}")
            return {
                "success": False,
                "error": str(error),
                "message": "Failed to list approvals"
            }

    async def save_approval_data(self, approval_id: str, approval_data: Dict[str, Any]) -> None:
        """
        Save approval data to file
        """
        file_path = self.approvals_dir / f"{approval_id}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(approval_data, f, ensure_ascii=False, indent=2)

    async def load_approval_data(self, approval_id: str) -> Optional[Dict[str, Any]]:
        """
        Load approval data from file
        """
        file_path = self.approvals_dir / f"{approval_id}.json"
        if not file_path.exists():
            return None

        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_stats(self) -> Dict[str, Any]:
        """
        Get approval statistics
        """
        try:
            # Count approvals by status
            status_counts = {}
            total_approvals = 0

            for file_path in self.approvals_dir.glob("*.json"):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        approval_data = json.load(f)
                        status = approval_data.get("status", "unknown")
                        status_counts[status] = status_counts.get(status, 0) + 1
                        total_approvals += 1
                except Exception:
                    continue

            return {
                "totalApprovals": total_approvals,
                "statusBreakdown": status_counts,
                "approvalRate": (
                    status_counts.get(ApprovalStatus.APPROVED.value, 0) / total_approvals * 100
                    if total_approvals > 0 else 0
                ),
                "rejectionRate": (
                    status_counts.get(ApprovalStatus.REJECTED.value, 0) / total_approvals * 100
                    if total_approvals > 0 else 0
                ),
                "pendingApprovals": status_counts.get(ApprovalStatus.PENDING.value, 0),
                "timestamp": datetime.now().isoformat()
            }

        except Exception as error:
            print(f"❌ Failed to get approval stats: {error}")
            return {
                "totalApprovals": 0,
                "error": str(error)
            }


# Main execution
if __name__ == "__main__":
    agent = ContentApprovalAgent()
    print("🎬 Content Approval Agent initialized")

    # Show stats
    stats = agent.get_stats()
    print(f"📊 Total approvals: {stats['totalApprovals']}")
    print(f"📈 Approval rate: {stats['approvalRate']:.1f}%")
    print(f"📉 Rejection rate: {stats['rejectionRate']:.1f}%")