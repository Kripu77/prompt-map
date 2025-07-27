
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error?: string;
  message?: string;
  status?: number;
}


export interface PromptPayload {
  prompt: string;
  context?: {
    originalPrompt?: string;
    existingMindmap?: string;
    previousPrompts?: string[];
    isFollowUp?: boolean;
    checkTopicShift?: boolean;
  };
}

export interface TopicShiftResponse {
  isTopicShift: boolean;
  confidence?: number;
  reason?: string;
}

export interface MindmapResponse {
  content: string;
  title?: string;
  metadata?: {
    nodeCount?: number;
    depth?: number;
    generatedAt?: string;
  };
}

export interface MindmapGenerationRequest extends PromptPayload {}

export interface TopicShiftCheckRequest extends PromptPayload {}


export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  userId: string;
  metadata?: {
    nodeCount?: number;
    lastAccessed?: string;
    tags?: string[];
  };
}

export interface ThreadCreateRequest {
  title: string;
  content: string;
  metadata?: Thread['metadata'];
}

export interface ThreadUpdateRequest {
  title?: string;
  content?: string;
  metadata?: Partial<Thread['metadata']>;
}

export interface ThreadsResponse {
  threads: Thread[];
  total?: number;
  hasMore?: boolean;
}

export interface ThreadResponse {
  thread: Thread;
}

export interface ThreadDeleteResponse {
  success: boolean;
  deletedId: string;
}


export interface AnonymousMindmapData {
  prompt: string;
  content: string;
  title: string;
  sessionId: string;
  userAgent: string;
  referrer: string;
  metadata?: {
    nodeCount?: number;
    generationTime?: number;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
  };
}

export interface AnalyticsResponse {
  recorded: boolean;
  sessionId?: string;
}


export interface OnboardingState {
  currentStep: number;
  completedSteps: string[];
  isCompleted: boolean;
  lastUpdated: string;
}

export interface OnboardingUpdateRequest {
  step?: number;
  completedSteps?: string[];
  isCompleted?: boolean;
}

export interface OnboardingResponse {
  state: OnboardingState;
  success: boolean;
}


export interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthSession {
  user: UserProfile;
  expires: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestConfig {
  method: ApiMethod;
  headers?: Record<string, string>;
  body?: unknown;
}

export type ApiEndpoint = 
  | '/api/chat'
  | '/api/check-topic-shift'
  | '/api/threads'
  | `/api/threads/${string}`
  | '/api/analytics/anonymous-mindmap'
  | '/api/user/onboarding';


export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    ('error' in response || 'message' in response)
  );
}

export function isValidThread(data: unknown): data is Thread {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'title' in data &&
    'content' in data &&
    'userId' in data &&
    'createdAt' in data &&
    'updatedAt' in data
  );
}

export function isValidMindmapResponse(data: unknown): data is MindmapResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'content' in data &&
    typeof (data as MindmapResponse).content === 'string'
  );
}