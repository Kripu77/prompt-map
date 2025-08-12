
import { ReactFlowInstance } from '@xyflow/react';

export interface MindmapState {
  prompt: string;
  isLoading: boolean;
  mindmapData: string;
  mindmapRef: ReactFlowInstance | null;
  isUserGenerated: boolean;
  isFollowUpMode: boolean;
  error: string | null;
  lastGeneratedAt: number | null;
  promptHistory: PromptHistoryItem[];
}

export interface MindmapActions {
  setPrompt: (prompt: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setMindmapData: (data: string) => void;
  setMindmapRef: (ref: ReactFlowInstance) => void;
  setIsUserGenerated: (isGenerated: boolean) => void;
  setIsFollowUpMode: (isFollowUp: boolean) => void;
  setError: (error: string | null) => void;
  addToHistory: (item: PromptHistoryItem) => void;
  clearHistory: () => void;
  reset: () => void;
}

export type MindmapStore = MindmapState & MindmapActions;

export interface PromptHistoryItem {
  prompt: string;
  timestamp: number;
  isFollowUp: boolean;
  response?: string;
  metadata?: {
    processingTime?: number;
    tokenCount?: number;
    topicShiftDetected?: boolean;
  };
}


export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  width: number;
  isAnimating: boolean;
  lastToggleTime: number;
}

export interface SidebarActions {
  setIsOpen: (isOpen: boolean) => void;
  setIsCollapsed: (isCollapsed: boolean) => void;
  setWidth: (width: number) => void;
  setIsAnimating: (isAnimating: boolean) => void;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
  reset: () => void;
}

export type SidebarStore = SidebarState & SidebarActions;


export interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  systemTheme: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
  isSystemThemeDetected: boolean;
}

export interface ThemeActions {
  setTheme: (theme: ThemeState['theme']) => void;
  setSystemTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  detectSystemTheme: () => void;
}

export type ThemeStore = ThemeState & ThemeActions;

export interface OnboardingState {
  currentStep: number;
  completedSteps: string[];
  isCompleted: boolean;
  isVisible: boolean;
  lastUpdated: number;
  userId?: string;
}

export interface OnboardingActions {
  setCurrentStep: (step: number) => void;
  addCompletedStep: (step: string) => void;
  setIsCompleted: (completed: boolean) => void;
  setIsVisible: (visible: boolean) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeOnboarding: () => void;
  reset: () => void;
}

export type OnboardingStore = OnboardingState & OnboardingActions;


export interface ToolbarPosition {
  x: number;
  y: number;
  isDragging: boolean;
}

export interface ToolbarState {
  position: ToolbarPosition;
  isVisible: boolean;
  isFullscreen: boolean;
  size: {
    width: number;
    height: number;
  };
  isFirstTime: boolean;
  lastInteraction: number;
}

export interface ToolbarActions {
  setPosition: (position: Partial<ToolbarPosition>) => void;
  setIsVisible: (visible: boolean) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  setSize: (size: Partial<ToolbarState['size']>) => void;
  setIsFirstTime: (isFirstTime: boolean) => void;
  updateLastInteraction: () => void;
  resetPosition: () => void;
  reset: () => void;
}

export type ToolbarStore = ToolbarState & ToolbarActions;


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

export interface ThreadsState {
  threads: Thread[];
  currentThread: Thread | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  searchQuery: string;
  filteredThreads: Thread[];
}

export interface ThreadsActions {
  setThreads: (threads: Thread[]) => void;
  addThread: (thread: Thread) => void;
  updateThread: (id: string, updates: Partial<Thread>) => void;
  removeThread: (id: string) => void;
  setCurrentThread: (thread: Thread | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  filterThreads: () => void;
  reset: () => void;
}

export type ThreadsStore = ThreadsState & ThreadsActions;


export interface AnalyticsState {
  sessionId: string;
  isEnabled: boolean;
  events: AnalyticsEvent[];
  lastEventTime: number | null;
}

export interface AnalyticsActions {
  setSessionId: (sessionId: string) => void;
  setIsEnabled: (enabled: boolean) => void;
  addEvent: (event: Omit<AnalyticsEvent, 'timestamp'>) => void;
  clearEvents: () => void;
  reset: () => void;
}

export type AnalyticsStore = AnalyticsState & AnalyticsActions;

export interface AnalyticsEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}


export interface AppState {
  isInitialized: boolean;
  isOnline: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  screenSize: {
    width: number;
    height: number;
  };
  lastActivity: number;
}

export interface AppActions {
  setIsInitialized: (initialized: boolean) => void;
  setIsOnline: (online: boolean) => void;
  setDeviceType: (type: AppState['deviceType']) => void;
  setScreenSize: (size: AppState['screenSize']) => void;
  updateLastActivity: () => void;
  initialize: () => void;
}

export type AppStore = AppState & AppActions;


export interface RootStore {
  mindmap: MindmapStore;
  sidebar: SidebarStore;
  theme: ThemeStore;
  onboarding: OnboardingStore;
  toolbar: ToolbarStore;
  threads: ThreadsStore;
  analytics: AnalyticsStore;
  app: AppStore;
}

export interface StoreConfig {
  persist?: {
    enabled: boolean;
    key: string;
    storage?: 'localStorage' | 'sessionStorage';
    partialize?: (state: unknown) => unknown;
  };
  devtools?: {
    enabled: boolean;
    name?: string;
  };
  middleware?: unknown[];
}

export interface StoreSlice<T> {
  name: string;
  initialState: T;
  actions: Record<string, (...args: unknown[]) => void>;
  selectors?: Record<string, (state: T) => unknown>;
}


export type StoreSelector<T, R> = (state: T) => R;
export type StoreSubscriber<T> = (state: T, prevState: T) => void;

export interface UseStoreOptions<T> {
  selector?: StoreSelector<T, unknown>;
  equalityFn?: (a: unknown, b: unknown) => boolean;
  fireImmediately?: boolean;
}

export interface StoreAction<T = unknown> {
  type: string;
  payload?: T;
  meta?: {
    timestamp: number;
    source?: string;
  };
}

export interface StoreMiddleware<T> {
  (config: T): T;
}

export interface StorePersistOptions {
  name: string;
  storage?: Storage;
  partialize?: (state: unknown) => unknown;
  onRehydrateStorage?: (state: unknown) => void;
  version?: number;
  migrate?: (persistedState: unknown, version: number) => unknown;
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

export function isPromptHistoryItem(item: unknown): item is PromptHistoryItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'prompt' in item &&
    'timestamp' in item &&
    'isFollowUp' in item &&
    typeof (item as PromptHistoryItem).prompt === 'string' &&
    typeof (item as PromptHistoryItem).timestamp === 'number' &&
    typeof (item as PromptHistoryItem).isFollowUp === 'boolean'
  );
}

export function isAnalyticsEvent(event: unknown): event is AnalyticsEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    'type' in event &&
    'data' in event &&
    'timestamp' in event &&
    'sessionId' in event &&
    typeof (event as AnalyticsEvent).type === 'string' &&
    typeof (event as AnalyticsEvent).timestamp === 'number' &&
    typeof (event as AnalyticsEvent).sessionId === 'string'
  );
}