export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'
}

export interface ErrorContext {
  operation: string;
  userId?: string;
  prompt?: string;
  timestamp: Date;
  metadata?: Record<string, string | number | boolean | null>;
}

export class MindmapError extends Error {
  public readonly type: ErrorType;
  public readonly context: ErrorContext;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    type: ErrorType,
    context: ErrorContext,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'MindmapError';
    this.type = type;
    this.context = context;
    this.isRetryable = isRetryable;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      context: this.context,
      isRetryable: this.isRetryable,
      stack: this.stack
    };
  }
}

export class ErrorHandler {
  static createValidationError(message: string, context: Partial<ErrorContext>): MindmapError {
    return new MindmapError(
      message,
      ErrorType.VALIDATION_ERROR,
      { operation: 'validation', timestamp: new Date(), ...context },
      false
    );
  }

  static createApiError(message: string, context: Partial<ErrorContext>): MindmapError {
    return new MindmapError(
      message,
      ErrorType.API_ERROR,
      { operation: 'api_call', timestamp: new Date(), ...context },
      true
    );
  }

  static createNetworkError(message: string, context: Partial<ErrorContext>): MindmapError {
    return new MindmapError(
      message,
      ErrorType.NETWORK_ERROR,
      { operation: 'network_request', timestamp: new Date(), ...context },
      true
    );
  }

  static createConfigurationError(message: string, context: Partial<ErrorContext>): MindmapError {
    return new MindmapError(
      message,
      ErrorType.CONFIGURATION_ERROR,
      { operation: 'configuration', timestamp: new Date(), ...context },
      false
    );
  }

  static createProcessingError(message: string, context: Partial<ErrorContext>): MindmapError {
    return new MindmapError(
      message,
      ErrorType.PROCESSING_ERROR,
      { operation: 'processing', timestamp: new Date(), ...context },
      false
    );
  }

  static createTimeoutError(message: string, context: Partial<ErrorContext>): MindmapError {
    return new MindmapError(
      message,
      ErrorType.TIMEOUT_ERROR,
      { operation: 'timeout', timestamp: new Date(), ...context },
      true
    );
  }

  static handleError(error: unknown, context: Partial<ErrorContext> = {}): MindmapError {
    if (error instanceof MindmapError) {
      return error;
    }

    if (error instanceof Error) {
      // Classify common error patterns
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        return this.createTimeoutError(error.message, context);
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return this.createNetworkError(error.message, context);
      }
      if (error.message.includes('validation') || error.message.includes('invalid')) {
        return this.createValidationError(error.message, context);
      }
      
      return this.createProcessingError(error.message, context);
    }

    return this.createProcessingError(
      typeof error === 'string' ? error : 'Unknown error occurred',
      context
    );
  }

  static logError(error: MindmapError): void {
    console.error('MindmapError:', {
      type: error.type,
      message: error.message,
      context: error.context,
      isRetryable: error.isRetryable,
      timestamp: new Date().toISOString()
    });
  }

  static shouldRetry(error: MindmapError, attemptCount: number, maxRetries: number = 3): boolean {
    return error.isRetryable && attemptCount < maxRetries;
  }
}