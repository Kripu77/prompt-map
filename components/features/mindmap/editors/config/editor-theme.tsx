"use client";

// Lexical editor theme configuration
export const editorTheme = {
  ltr: 'ltr',
  rtl: 'rtl',
  placeholder: 'text-muted-foreground',
  paragraph: 'mb-3 leading-relaxed text-foreground',
  quote: 'border-l-4 border-border pl-4 italic my-4 text-muted-foreground',
  heading: {
    h1: 'text-2xl font-bold mb-4 mt-6 border-b border-border pb-2 text-foreground',
    h2: 'text-xl font-bold mb-3 mt-5 text-foreground',
    h3: 'text-lg font-semibold mb-2 mt-4 text-foreground',
    h4: 'text-md font-semibold mb-2 mt-3 text-foreground',
    h5: 'text-sm font-semibold mb-1 mt-2 text-foreground',
    h6: 'text-xs font-semibold mb-1 mt-2 text-foreground',
  },
  list: {
    nested: {
      listitem: 'list-none',
    },
    ol: 'list-decimal ml-6 mb-3 space-y-1 text-foreground',
    ul: 'list-disc ml-6 mb-3 space-y-1 text-foreground',
    listitem: 'leading-relaxed text-foreground',
  },
  link: 'text-primary hover:text-primary/80 underline cursor-pointer',
  text: {
    bold: 'font-semibold text-foreground',
    italic: 'italic text-foreground',
    underline: 'underline text-foreground',
    strikethrough: 'line-through text-foreground',
    underlineStrikethrough: 'underline line-through text-foreground',
    code: 'bg-muted px-2 py-1 rounded text-sm font-mono text-foreground whitespace-nowrap',
  },
  code: 'bg-muted p-4 rounded-lg font-mono text-sm border border-border my-4 overflow-x-auto whitespace-pre-wrap block text-foreground',
  codeHighlight: {
    atrule: 'text-purple-600 dark:text-purple-400',
    attr: 'text-blue-600 dark:text-blue-400',
    boolean: 'text-red-600 dark:text-red-400',
    builtin: 'text-purple-600 dark:text-purple-400',
    cdata: 'text-muted-foreground',
    char: 'text-green-600 dark:text-green-400',
    class: 'text-blue-600 dark:text-blue-400',
    'class-name': 'text-blue-600 dark:text-blue-400',
    comment: 'text-muted-foreground',
    constant: 'text-red-600 dark:text-red-400',
    deleted: 'text-red-600 dark:text-red-400',
    doctype: 'text-muted-foreground',
    entity: 'text-orange-600 dark:text-orange-400',
    function: 'text-purple-600 dark:text-purple-400',
    important: 'text-red-600 dark:text-red-400',
    inserted: 'text-green-600 dark:text-green-400',
    keyword: 'text-purple-600 dark:text-purple-400',
    namespace: 'text-blue-600 dark:text-blue-400',
    number: 'text-red-600 dark:text-red-400',
    operator: 'text-foreground',
    prolog: 'text-muted-foreground',
    property: 'text-blue-600 dark:text-blue-400',
    punctuation: 'text-foreground',
    regex: 'text-green-600 dark:text-green-400',
    selector: 'text-green-600 dark:text-green-400',
    string: 'text-green-600 dark:text-green-400',
    symbol: 'text-red-600 dark:text-red-400',
    tag: 'text-red-600 dark:text-red-400',
    url: 'text-blue-600 dark:text-blue-400',
    variable: 'text-orange-600 dark:text-orange-400',
  },
  // Equation-specific styles
  equationInline: 'inline-block align-baseline text-foreground',
  equationBlock: 'block text-center my-4 overflow-x-auto text-foreground',
  equationError: 'text-destructive font-mono text-sm bg-destructive/10 px-2 py-1 rounded',
  equationPlaceholder: 'text-muted-foreground font-mono text-sm bg-muted px-2 py-1 rounded border-dashed border-border',
};

// Error handler for Lexical
export function onError(error: Error) {
  console.error('Lexical error:', error);
}