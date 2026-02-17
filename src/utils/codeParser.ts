import { CodeBlock } from '@/types';

export function extractCodeBlocks(content: string): CodeBlock[] {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeBlocks: CodeBlock[] = [];
  let match;
  let index = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlocks.push({
      id: `code-${Date.now()}-${index}`,
      language: match[1] || 'text',
      content: match[2].trim(),
      valid: true,
      saved: false,
    });
    index++;
  }

  return codeBlocks;
}

export function replaceCodeBlocks(
  content: string,
  replacer: (match: string, language: string, code: string) => string
): string {
  return content.replace(/```(\w+)?\n([\s\S]*?)```/g, replacer);
}