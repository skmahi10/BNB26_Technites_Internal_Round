# ModelLedger API Contract

## Purpose

This document defines the shared API contract between the ModelLedger
frontend, backend, AI engine, and blockchain layer.

**Rule:** Do not change request/response fields, endpoint names, or
meanings without informing the team first.

------------------------------------------------------------------------

## Base URL

Local backend:

`http://localhost:8000`

All API responses use JSON unless stated otherwise.

------------------------------------------------------------------------

# 1. Artifacts

## POST `/api/artifacts`

Upload and register an artifact.

### Request

`multipart/form-data`

Fields:

-   `file` --- artifact file
-   `claimed_model` --- optional model name/identifier
-   `artifact_type` --- optional type such as image, video, audio,
    document

### Response

``` json
{
  "artifactId": "art_123",
  "filename": "sample.jpg",
  "artifactType": "image",
  "sha256Hash": "abc123...",
  "status": "REGISTERED"
}
```

------------------------------------------------------------------------

## GET `/api/artifacts`

Return registered artifacts.

### Response

``` json
{
  "artifacts": [
    {
      "artifactId": "art_123",
      "filename": "sample.jpg",
      "artifactType": "image",
      "sha256Hash": "abc123...",
      "claimedModel": "Model-A",
      "status": "REGISTERED",
      "createdAt": "2026-10-03T12:00:00Z"
    }
  ]
}
```

------------------------------------------------------------------------

## GET `/api/artifacts/{artifact_id}`

Return complete artifact information.

------------------------------------------------------------------------

# 2. Provenance

## POST `/api/provenance`

Create a provenance event for an artifact.

### Request

``` json
{
  "artifactId": "art_123",
  "parentArtifactId": "art_001",
  "parentHash": "parent_hash...",
  "modelId": "model-b",
  "action": "TRANSFORM",
  "timestamp": "2026-10-03T12:00:00Z"
}
```

### Response

``` json
{
  "provenanceId": "prov_123",
  "artifactId": "art_123",
  "status": "CREATED"
}
```

------------------------------------------------------------------------

## GET `/api/provenance/{artifact_id}`

Return the provenance history of an artifact.

### Response

``` json
{
  "artifactId": "art_123",
  "events": [
    {
      "id": "prov_001",
      "modelId": "model-a",
      "action": "CREATE",
      "timestamp": "2026-10-03T10:00:00Z",
      "artifactHash": "abc123...",
      "parentHash": null,
      "blockchainTx": "0x..."
    }
  ]
}
```

------------------------------------------------------------------------

## GET `/api/provenance/{artifact_id}/graph`

Return provenance relationships for the frontend graph.

### Response

``` json
{
  "nodes": [],
  "edges": []
}
```

The exact node/edge presentation is owned by the frontend, but the
backend must provide stable artifact/provenance identifiers.

------------------------------------------------------------------------

# 3. Verification

## POST `/api/verify`

Main verification endpoint.

### Request

``` json
{
  "artifactId": "art_123"
}
```

### Response

``` json
{
  "artifactId": "art_123",
  "status": "VERIFIED",
  "trustLevel": "TRUSTED",

  "hashMatch": true,
  "blockchainVerified": true,
  "provenanceValid": true,

  "aiConsistency": 0.91,
  "tamperDetected": false,

  "evidence": [
    "SHA-256 hash matches registered artifact",
    "Blockchain provenance record verified",
    "Provenance chain is valid",
    "AI analysis found no significant conflict"
  ],

  "blockchainTx": "0x..."
}
```

### Allowed final statuses

-   `VERIFIED`
-   `SELF_ASSERTED`
-   `UNVERIFIABLE`
-   `TAMPERED_CONFLICT`

The frontend must display these statuses exactly unless the team agrees
to change them.

------------------------------------------------------------------------

# 4. AI Engine

## POST `/api/ai/analyze`

Internal backend-to-AI-engine interface.

### Request

``` json
{
  "artifactPath": "/storage/art_123.jpg",
  "artifactHash": "abc123...",
  "claimedModel": "Model-A",
  "provenance": {
    "artifactId": "art_123",
    "parentHash": "parent_hash...",
    "modelId": "Model-A",
    "action": "CREATE"
  }
}
```

### Response

``` json
{
  "consistencyScore": 0.91,
  "tamperingDetected": false,
  "classification": "CONSISTENT",
  "confidence": 0.88,
  "evidence": [
    "Artifact is consistent with supplied provenance"
  ]
}
```

### Important

AI analysis is an evidence source. It does **not** independently decide
the final verification status.

------------------------------------------------------------------------

# 5. Blockchain

## POST `/api/blockchain/register`

Register a provenance event on the blockchain.

### Request

``` json
{
  "artifactId": "art_123",
  "artifactHash": "abc123...",
  "parentHash": "parent_hash...",
  "modelId": "Model-A",
  "action": "CREATE",
  "timestamp": "2026-10-03T12:00:00Z"
}
```

### Response

``` json
{
  "success": true,
  "transactionHash": "0x...",
  "artifactId": "art_123"
}
```

------------------------------------------------------------------------

## GET `/api/blockchain/{artifact_id}`

Return the blockchain provenance record.

------------------------------------------------------------------------

## POST `/api/blockchain/verify`

Verify whether the supplied provenance data matches the blockchain
record.

### Response

``` json
{
  "verified": true,
  "transactionHash": "0x..."
}
```

------------------------------------------------------------------------

## GET `/api/blockchain/tx/{tx_hash}`

Return transaction information.

------------------------------------------------------------------------

# 6. Error Format

All API errors should follow:

``` json
{
  "error": {
    "code": "ARTIFACT_NOT_FOUND",
    "message": "Artifact was not found"
  }
}
```

Use meaningful HTTP status codes.

Examples:

-   `400` --- invalid request
-   `404` --- resource not found
-   `409` --- provenance/integrity conflict
-   `500` --- server error

------------------------------------------------------------------------

# 7. Shared Naming Rules

Use:

-   `artifactId`
-   `artifactHash`
-   `parentArtifactId`
-   `parentHash`
-   `modelId`
-   `provenanceId`
-   `transactionHash`

Python internal variable naming may use `snake_case`, but API JSON
fields remain as defined above.

------------------------------------------------------------------------

# 8. API Change Rule

Before changing:

-   endpoint names
-   request fields
-   response fields
-   status values
-   field meanings

inform the team and update this file first.
