export interface WebSearchConfig {
  enableWebSearch?: boolean;
  hasExaKey: boolean;
}

export interface WebSearchDetectionResult {
  shouldEnableWebSearch: boolean;
  hasExaKey: boolean;
  detectionReason: 'explicit' | 'keywords' | 'default';
}

export class WebSearchDetector {
  private static readonly CURRENT_KEYWORDS = [
    'latest', 'recent', 'current', 'today', 'now', 'breaking', 'update',
    'trending', '2025', 'news', 'weather', 'stock', 'market'
  ];

  static detect(prompt: string, options: WebSearchConfig): WebSearchDetectionResult {
    const promptText = prompt.toLowerCase();
    const hasCurrentKeywords = this.CURRENT_KEYWORDS.some(keyword => 
      promptText.includes(keyword)
    );

    let shouldEnableWebSearch: boolean;
    let detectionReason: 'explicit' | 'keywords' | 'default';

    if (options.enableWebSearch !== undefined) {
      shouldEnableWebSearch = options.enableWebSearch;
      detectionReason = 'explicit';
    } else if (hasCurrentKeywords) {
      shouldEnableWebSearch = true;
      detectionReason = 'keywords';
    } else {
      shouldEnableWebSearch = true;
      detectionReason = 'default';
    }

    return {
      shouldEnableWebSearch,
      hasExaKey: options.hasExaKey,
      detectionReason
    };
  }

  static validateConfiguration(result: WebSearchDetectionResult): void {
    if (result.shouldEnableWebSearch && !result.hasExaKey) {
      console.warn('Web search requested but EXA_API_KEY not configured. Add EXA_API_KEY to environment variables.');
    }
  }
}