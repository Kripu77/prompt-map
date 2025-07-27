

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import type { PromptPayload } from '@/types/api';


export const PromptPayloadSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(2000, 'Prompt too long'),
  context: z.object({
    originalPrompt: z.string().optional(),
    existingMindmap: z.string().optional(),
    previousPrompts: z.array(z.string()).optional(),
    isFollowUp: z.boolean().optional(),
    checkTopicShift: z.boolean().optional(),
  }).optional(),
});

export const MindmapOptionsSchema = z.object({
  userExpertise: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  purpose: z.enum(['learning', 'reference', 'teaching', 'planning']).optional(),
  timeConstraint: z.enum(['quick', 'detailed', 'comprehensive']).optional(),
  format: z.enum(['academic', 'practical', 'creative']).optional(),
  useChainOfThought: z.boolean().optional(),
});

export const ThreadCreateSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title too long'),
  content: z.string().min(1, 'Content cannot be empty'),
  metadata: z.object({
    nodeCount: z.number().optional(),
    lastAccessed: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

export const ThreadUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  metadata: z.object({
    nodeCount: z.number().optional(),
    lastAccessed: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

export const AnonymousAnalyticsSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  content: z.string().min(1, 'Content cannot be empty'),
  title: z.string().optional(),
  sessionId: z.string().optional(),
  userAgent: z.string().optional(),
  referrer: z.string().optional(),
});

export const OnboardingUpdateSchema = z.object({
  step: z.number().min(0).optional(),
  completedSteps: z.array(z.string()).optional(),
  isCompleted: z.boolean().optional(),
});

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}


export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
  } catch {
    return {
      success: false,
      errors: ['Invalid JSON in request body'],
    };
  }
}


export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const result = schema.safeParse(params);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
  } catch {
    return {
      success: false,
      errors: ['Invalid query parameters'],
    };
  }
}


export function createValidationErrorResponse(errors: string[]): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: errors,
    },
    { status: 400 }
  );
}


export function createErrorResponse(
  message: string,
  status: number = 500,
  code?: string
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}


export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}


const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}


export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  return ip;
}


export async function requireAuth() {
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      error: createErrorResponse('Unauthorized', 401, 'UNAUTHORIZED'),
      userId: null,
    };
  }
  
  return {
    error: null,
    userId: session.user.id,
  };
}


export function isValidPromptPayload(data: unknown): data is PromptPayload {
  return PromptPayloadSchema.safeParse(data).success;
}