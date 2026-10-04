export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

/**
 * UI display types assembled from the product fields in the supplied prompt.
 * They are not a claim about the unprovided FastAPI schema. Map backend DTOs at
 * the API boundary after confirming API.md/OpenAPI.
 */
export interface ModelRecord {
  modelId: string;
  name?: string;
  creator?: string;
  owner?: string;
  modelHash?: string;
  currentVersion?: string;
  registeredAt?: string;
  metadata?: Record<string, JsonValue>;
  integrityStatus?: string;
  verificationStatus?: string;
  lifecycleStatus?: string;
  updatedAt?: string;
}

export interface ModelVersion {
  version: string;
  modelHash?: string;
  createdAt?: string;
  createdBy?: string;
  changeSummary?: string;
  propertyChanges?: Array<{ property: string; previousValue?: JsonValue; newValue?: JsonValue }>;
  integrityStatus?: string;
}

export interface ArtifactRecord {
  artifactId: string;
  modelId?: string;
  modelVersion?: string;
  name: string;
  mediaType?: string;
  hash?: string;
  createdAt?: string;
  integrityStatus?: string;
  verificationStatus?: string;
}

export interface EvidenceItem {
  type: 'trust' | 'provenance' | 'blockchain' | 'ai' | string;
  label: string;
  status?: string;
  description?: string;
  value?: string | number;
  reference?: string;
}

export interface VerificationRecord {
  verificationId: string;
  modelId?: string;
  artifactId?: string;
  version?: string;
  result?: string;
  checkedAt?: string;
  evidence?: EvidenceItem[];
}

export interface TestingRecord {
  testId: string;
  modelId: string;
  modelVersion?: string;
  testType: string;
  testedAt?: string;
  result?: string;
  status?: string;
  qualityMetrics?: Record<string, number | string>;
  riskMetrics?: Record<string, number | string>;
  decision?: string;
}

export interface LifecycleEvent {
  eventId: string;
  modelId: string;
  version?: string;
  status: string;
  occurredAt?: string;
  summary?: string;
  actor?: string;
}

export interface VersionHistoryEvent {
  eventId: string;
  modelId: string;
  version?: string;
  eventType: string;
  occurredAt?: string;
  summary?: string;
  propertyChanges?: Array<{ property: string; previousValue?: JsonValue; newValue?: JsonValue }>;
}

export interface ActivityEvent {
  eventId: string;
  type: string;
  occurredAt?: string;
  modelId?: string;
  version?: string;
  summary: string;
  actor?: string;
  evidenceType?: string;
}

export interface BlockchainEvidence {
  network?: string;
  transactionHash?: string;
  block?: string | number;
  contract?: string;
  timestamp?: string;
  transactionStatus?: string;
  verificationResult?: string;
}

export interface ProvenanceNode {
  id: string;
  label: string;
  kind: 'model' | 'artifact' | 'system' | string;
  modelId?: string;
  version?: string;
  hash?: string;
  occurredAt?: string;
  trustStatus?: string;
  details?: string;
}

export interface ProvenanceEdge {
  id?: string;
  source: string;
  target: string;
  label?: string;
}

export interface ProvenanceGraph {
  nodes: ProvenanceNode[];
  edges: ProvenanceEdge[];
}

export interface DashboardMetrics {
  totalArtifacts?: number;
  trustedOrVerified?: number;
  selfAsserted?: number;
  unverifiable?: number;
  tamperedOrConflict?: number;
  verifiedPercentage?: number;
  totalModels?: number;
  trustedModels?: number;
  modelsRequiringAttention?: number;
  testingPending?: number;
  approvedModels?: number;
  rejectedModels?: number;
}

export interface DashboardPayload {
  /** Provisional frontend view fields; map to the confirmed FastAPI DTO at the API boundary. */
  metrics?: DashboardMetrics;
  recentArtifacts?: ArtifactRecord[];
  recentModelRegistrations?: ModelRecord[];
  recentTests?: TestingRecord[];
  recentVerifications?: VerificationRecord[];
  recentVerificationActivity?: ActivityEvent[];
  blockchainActivity?: BlockchainEvidence[];
  provenanceActivity?: ActivityEvent[];
}

export interface TestingPayload {
  records: TestingRecord[];
  riskDistribution?: Array<{ label: string; value: number }>;
  qualityMetrics?: Array<{ label: string; value: number | string }>;
}

export interface ModelDetailPayload {
  model: ModelRecord;
  versions?: ModelVersion[];
  relatedArtifacts?: ArtifactRecord[];
  tests?: TestingRecord[];
  provenance?: ProvenanceGraph;
  blockchainEvidence?: BlockchainEvidence[];
}

export interface ArtifactDetailPayload {
  artifact: ArtifactRecord;
  model?: ModelRecord;
  versions?: ModelVersion[];
  provenance?: ProvenanceGraph;
  blockchainEvidence?: BlockchainEvidence[];
  verification?: VerificationRecord;
}

export type ListPayload<T> = T[] | { items: T[]; total?: number; nextCursor?: string | null };

export type ApiResourceKey =
  | 'dashboard'
  | 'models'
  | 'modelDetail'
  | 'artifacts'
  | 'artifactDetail'
  | 'verifications'
  | 'provenance'
  | 'testing'
  | 'lifecycle'
  | 'history'
  | 'activity';
