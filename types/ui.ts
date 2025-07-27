

import { ReactNode, ComponentProps, HTMLAttributes, JSX } from 'react';


export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}


export interface ButtonProps extends InteractiveComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  type?: 'button' | 'submit' | 'reset';
  asChild?: boolean;
}


export interface InputProps extends BaseComponentProps {
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface TextareaProps extends InputProps {
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  minHeight?: number;
  maxHeight?: number;
}

export interface PromptInputProps extends BaseComponentProps {
  onSubmit: (value: string) => void;
  loading?: boolean;
  error?: string | null;
  isFollowUpMode?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  autoFocus?: boolean;
}

export interface PromptInputState {
  value: string;
  isFocused: boolean;
  isValid: boolean;
  errorMessage?: string;
}

export interface DialogProps extends BaseComponentProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

export interface DialogContentProps extends BaseComponentProps {
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
}
export interface DropdownMenuProps extends BaseComponentProps {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  onItemSelect?: (item: DropdownMenuItem) => void;
}

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
  onClick?: () => void;
}

export interface SidebarProps extends BaseComponentProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  side?: 'left' | 'right';
  width?: number;
  collapsible?: boolean;
  overlay?: boolean;
}

export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  width: number;
  isAnimating: boolean;
}

export interface SidebarActions {
  setIsOpen: (open: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  setWidth: (width: number) => void;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
}

export interface HeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  navigation?: ReactNode;
  sticky?: boolean;
  transparent?: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  children?: NavigationItem[];
  onClick?: () => void;
}

export interface NavigationProps extends BaseComponentProps {
  items: NavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  onItemClick?: (item: NavigationItem) => void;
}
export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export interface ToastState {
  toasts: ToastProps[];
  maxToasts: number;
}

export interface ToastActions {
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  overlay?: boolean;
}

export interface SkeletonProps extends BaseComponentProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    accent: string;
    destructive: string;
    border: string;
    input: string;
    ring: string;
  };
  fonts: {
    sans: string[];
    mono: string[];
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

export interface ThemeState {
  theme: ThemeConfig['mode'];
  systemTheme: 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
}

export interface ThemeActions {
  setTheme: (theme: ThemeConfig['mode']) => void;
  toggleTheme: () => void;
}


export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  repeat?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate';
}

export interface TransitionProps {
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  transition?: AnimationConfig;
}

export interface Breakpoints {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export interface ResponsiveValue<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-disabled'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  role?: string;
  tabIndex?: number;
}


export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}


export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline';
export type ComponentState = 'idle' | 'loading' | 'success' | 'error' | 'disabled';

export type HTMLElementProps<T extends keyof JSX.IntrinsicElements> = 
  Omit<ComponentProps<T>, keyof BaseComponentProps> & BaseComponentProps;


export function isValidSize(size: unknown): size is ComponentSize {
  return typeof size === 'string' && ['xs', 'sm', 'md', 'lg', 'xl'].includes(size);
}

export function isValidVariant(variant: unknown): variant is ComponentVariant {
  return typeof variant === 'string' && 
    ['primary', 'secondary', 'tertiary', 'ghost', 'outline'].includes(variant);
}