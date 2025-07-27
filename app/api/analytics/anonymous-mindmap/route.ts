import { NextRequest } from 'next/server';
import { analyticsService } from '@/lib/api/services/analytics-service';
import {
  validateRequestBody,
  createValidationErrorResponse,
  createErrorResponse,
  createSuccessResponse,
  checkRateLimit,
  getClientIdentifier,
  AnonymousAnalyticsSchema,
} from '@/lib/api/middleware/validation';

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    if (!checkRateLimit(clientId, 100, 60000)) {
      return createErrorResponse('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    }

    const validation = await validateRequestBody(request, AnonymousAnalyticsSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const data = validation.data!;
    
    // Enhance with request headers if not provided
    const enhancedData = {
      ...data,
      title: data.title || 'Untitled',
      sessionId: data.sessionId || crypto.randomUUID(),
      userAgent: data.userAgent || request.headers.get('user-agent') || '',
      referrer: data.referrer || request.headers.get('referer') || '',
    };

    await analyticsService.recordAnonymousMindmap(enhancedData);
    return createSuccessResponse({ recorded: true });
  } catch (error) {
    console.error('Error saving analytics data:', error);
    return createErrorResponse('Failed to save analytics data', 500, 'ANALYTICS_FAILED');
  }
} 