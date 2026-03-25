/**
 * Markdown Engine — code block extraction, thinking blocks, section splitting, sanitization
 * v21 Module 9
 */

export interface CodeBlock {
  language: string;
  code: string;
  startLine: number;
}

export interface MarkdownMeta {
  headingCount: number;
  codeBlockCount: number;
  linkCount: number;
  wordCount: number;
  hasThinking: boolean;
}

export interface MarkdownSection {
  title: string;
  level: number;
  content: string;
}

export interface MarkdownLink {
  text: string;
  url: string;
}

export interface ThinkingBlock {
  content: string;
  index: number;
}

// --- Code Block Extraction ---

export function extractCodeBlocks(md: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const regex = /```(\S*)[^\n]*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(md)) !== null) {
    const lang = match[1] || '';
    const code = match[2].replace(/\n$/, ''); // trim trailing newline only
    const startLine = md.slice(0, match.index).split('\n').length;
    blocks.push({ language: lang, code, startLine });
  }
  return blocks;
}

// --- Language Detection ---

export function detectCodeLanguage(code: string): string | null {
  if (/^#!/.test(code) || /\b(cd |ls |mkdir |chmod |grep |echo |apt |sudo )\b/.test(code)) return 'bash';
  if (/^\s*\{[\s\S]*\}\s*$/.test(code) && /"[\w]+"\s*:/.test(code)) return 'json';
  if (/\b(import |from |def |class |async def |print\(|raise |try:|except )\b/.test(code)) return 'python';
  if (/\b(const |let |var |function |=>|export |import |require\(|console\.)\b/.test(code)) return 'javascript';
  if (/\b(SELECT |FROM |WHERE |INSERT |CREATE TABLE)\b/i.test(code)) return 'sql';
  if (/^<(!DOCTYPE|html|div|span|head|body)\b/im.test(code)) return 'html';
  if (/\b(body|margin|padding|display|flex|grid)\s*\{/.test(code)) return 'css';
  return null;
}

// --- Markdown Meta ---

export function parseMarkdownMeta(md: string): MarkdownMeta {
  const headingCount = (md.match(/^#{1,6}\s/gm) || []).length;
  const codeBlockCount = (md.match(/```/g) || []).length / 2 | 0;
  const linkCount = (md.match(/\[[^\]]+\]\([^)]+\)/g) || []).length;
  const hasThinking = /<thinking>/.test(md);
  const wordCount = countWords(md);
  return { headingCount, codeBlockCount, linkCount, wordCount, hasThinking };
}

// --- Inline Code ---

export function formatInlineCode(text: string): string {
  if (text.startsWith('`') && text.endsWith('`')) return text;
  return `\`${text}\``;
}

// --- Section Splitting ---

export function splitMarkdownSections(md: string): MarkdownSection[] {
  const lines = md.split('\n');
  const sections: MarkdownSection[] = [];
  let currentTitle = '';
  let currentLevel = 0;
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      if (currentTitle || currentContent.length > 0) {
        sections.push({ title: currentTitle, level: currentLevel, content: currentContent.join('\n').trim() });
      }
      currentLevel = headingMatch[1].length;
      currentTitle = headingMatch[2];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Flush last section
  if (currentTitle || currentContent.length > 0) {
    sections.push({ title: currentTitle, level: currentLevel, content: currentContent.join('\n').trim() });
  }

  return sections;
}

// --- Link Extraction ---

export function extractLinks(md: string): MarkdownLink[] {
  const links: MarkdownLink[] = [];

  // Markdown links [text](url)
  const mdRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = mdRegex.exec(md)) !== null) {
    links.push({ text: match[1], url: match[2] });
  }

  // Bare URLs (only if not already captured inside markdown links)
  const bareRegex = /(?<!\]\()https?:\/\/[^\s)]+/g;
  while ((match = bareRegex.exec(md)) !== null) {
    // Check if this URL is part of a markdown link already
    const alreadyCaptured = links.some((l) => l.url === match![0]);
    if (!alreadyCaptured) {
      links.push({ text: match[0], url: match[0] });
    }
  }

  return links;
}

// --- Thinking Blocks ---

export function processThinkingBlocks(md: string): { thinkingBlocks: ThinkingBlock[]; cleanContent: string } {
  const blocks: ThinkingBlock[] = [];
  const regex = /<thinking>([\s\S]*?)<\/thinking>/g;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = regex.exec(md)) !== null) {
    blocks.push({ content: match[1].trim(), index: index++ });
  }
  const cleanContent = md.replace(/<thinking>[\s\S]*?<\/thinking>\s*/g, '').trim();
  return { thinkingBlocks: blocks, cleanContent };
}

// --- Utilities ---

export function countWords(text: string): number {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/#{1,6}\s/g, '')       // remove heading markers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // extract link text
    .replace(/<[^>]+>/g, '')         // remove HTML tags
    .trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter((w) => w.length > 0).length;
}

export function estimateReadTime(text: string): number {
  const words = countWords(text);
  if (words === 0) return 0;
  return Math.round(words / 200 * 10) / 10; // ~200 wpm
}

export function sanitizeMarkdown(md: string): string {
  // Protect code blocks first
  const codeBlocks: string[] = [];
  let protected_ = md.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Remove dangerous HTML outside code blocks
  protected_ = protected_.replace(/<script[\s\S]*?<\/script>/gi, '');
  protected_ = protected_.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  protected_ = protected_.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
  protected_ = protected_.replace(/on\w+\s*=\s*'[^']*'/gi, '');

  // Restore code blocks
  for (let i = 0; i < codeBlocks.length; i++) {
    protected_ = protected_.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i]);
  }

  return protected_;
}
