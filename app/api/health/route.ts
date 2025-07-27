import { mindmapService } from '@/lib/api/services/mindmap-service';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/middleware/validation';

export async function GET() {
  try {
    const serviceHealth = mindmapService.getServiceHealth();
    
    const envCheck = {
      openRouterApiKey: !!process.env.OPENROUTER_API_KEY,
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      databaseUrl: !!process.env.DATABASE_URL,
    };
    
    const isHealthy = serviceHealth.status === 'healthy' && 
                     envCheck.openRouterApiKey && 
                     envCheck.nextAuthSecret && 
                     envCheck.databaseUrl;
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        mindmap: serviceHealth,
        environment: envCheck,
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
    
    return createSuccessResponse(
      healthData,
      isHealthy ? 'All systems operational' : 'Some services degraded',
      isHealthy ? 200 : 503
    );
    
  } catch (error) {
    console.error('Health check error:', error);
    return createErrorResponse('Health check failed', 500, 'HEALTH_CHECK_FAILED');
  }
}