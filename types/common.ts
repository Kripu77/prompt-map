

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & globalThis.Required<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];



export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum ComponentSize {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
}

export enum ComponentVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
  GHOST = 'ghost',
  OUTLINE = 'outline',
}


export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimestampedEntity extends BaseEntity {
  createdBy?: string;
  updatedBy?: string;
}

export interface SoftDeletableEntity extends TimestampedEntity {
  deletedAt?: string;
  deletedBy?: string;
  isDeleted: boolean;
}

export interface Metadata {
  [key: string]: unknown;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: unknown;
}

export interface SearchOptions {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
}



export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  stack?: string;
}

export interface ValidationError extends AppError {
  field: string;
  value: unknown;
  constraint: string;
}

export interface NetworkError extends AppError {
  status: number;
  statusText: string;
  url: string;
  method: string;
}

export type ErrorType = 'validation' | 'network' | 'authentication' | 'authorization' | 'not_found' | 'server' | 'unknown';



export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  lastFetch: number | null;
}

export interface AsyncActions<T> {
  setData: (data: T) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
  reset: () => void;
}

export type AsyncStore<T> = AsyncState<T> & AsyncActions<T>;



export interface BaseEvent {
  type: string;
  timestamp: number;
  source?: string;
}

export interface UserEvent extends BaseEvent {
  userId?: string;
  sessionId: string;
  data: Record<string, unknown>;
}

export interface SystemEvent extends BaseEvent {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, unknown>;
}



export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    [key: string]: boolean;
  };
  analytics: {
    enabled: boolean;
    trackingId?: string;
  };
  sentry: {
    enabled: boolean;
    dsn?: string;
  };
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  conditions?: Record<string, unknown>;
}



export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle extends Point, Size {}

export interface Bounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Viewport extends Rectangle {
  scale: number;
}



export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSLA extends HSL {
  a: number;
}

export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla';



export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUpload extends FileInfo {
  file: File;
  progress: UploadProgress;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}


export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
}

export interface DeviceInfo {
  type: DeviceType;
  screen: Size;
  pixelRatio: number;
  touchSupport: boolean;
  orientation: 'portrait' | 'landscape';
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
}



export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
  validator?: (value: unknown) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FormValidation {
  [field: string]: ValidationRule[];
}



export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isNonEmptyArray<T>(value: unknown): value is NonEmptyArray<T> {
  return Array.isArray(value) && value.length > 0;
}

export function isNullable<T>(value: T | null): value is T {
  return value !== null;
}

export function isMaybe<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isPoint(value: unknown): value is Point {
  return (
    isObject(value) &&
    'x' in value &&
    'y' in value &&
    isNumber(value.x) &&
    isNumber(value.y)
  );
}

export function isSize(value: unknown): value is Size {
  return (
    isObject(value) &&
    'width' in value &&
    'height' in value &&
    isNumber(value.width) &&
    isNumber(value.height)
  );
}

export function isRectangle(value: unknown): value is Rectangle {
  return isPoint(value) && isSize(value);
}

export function isAppError(value: unknown): value is AppError {
  return (
    isObject(value) &&
    'code' in value &&
    'message' in value &&
    'timestamp' in value &&
    isString(value.code) &&
    isString(value.message) &&
    isString(value.timestamp)
  );
}


export function createId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function createTimestamp(): string {
  return new Date().toISOString();
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}