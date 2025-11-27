# Content Approval Python Agent

## Description
The Content Approval Python Agent is a service for managing content approval workflows. It handles submission, review, and approval of generated content with a complete audit trail.

## Features
- Content submission for approval
- Approval and rejection workflows
- Status tracking for all content
- Pending approvals management
- Approved and rejected content lists
- Complete audit trail with timestamps and reviewer information

## Endpoints

### Health Check
```
GET /health
```

### Submit Content for Approval
```
POST /submit-for-approval
```
Payload:
```json
{
  "content": {
    "title": "Content Title",
    "body": "Content body text",
    "type": "script|video|image"
  },
  "submitter": "User Name",
  "priority": "normal|high|urgent"
}
```

### Approve Content
```
POST /approve-content
```
Payload:
```json
{
  "approvalId": "approval-1234567890ab",
  "reviewer": "Reviewer Name",
  "reviewNotes": ["Note 1", "Note 2"]
}
```

### Reject Content
```
POST /reject-content
```
Payload:
```json
{
  "approvalId": "approval-1234567890ab",
  "reviewer": "Reviewer Name",
  "reviewNotes": ["Issue 1", "Issue 2"]
}
```

### Get Approval Status
```
GET /approval-status/<approval_id>
```

### List Pending Approvals
```
GET /pending-approvals
```

### List Approved Content
```
GET /approved-content
```

### List Rejected Content
```
GET /rejected-content
```

### Get Agent Status
```
GET /agent-status
```

## Installation
1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the agent:
   ```
   python app.py
   ```

## Usage
The agent runs on port 5000 by default.