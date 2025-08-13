"use client";

import { createCommand, LexicalCommand } from 'lexical';

// Math equation commands
export const INSERT_INLINE_MATH_COMMAND: LexicalCommand<string> = createCommand('INSERT_INLINE_MATH_COMMAND');
export const INSERT_BLOCK_MATH_COMMAND: LexicalCommand<string> = createCommand('INSERT_BLOCK_MATH_COMMAND');

// Code block command
export const INSERT_CODE_BLOCK_COMMAND: LexicalCommand<string> = createCommand('INSERT_CODE_BLOCK_COMMAND');