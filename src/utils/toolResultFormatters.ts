/**
 * ToolResultFormatters — v17
 * 
 * Rich formatting utilities for different tool result types.
 * Extracts structured data from raw tool result text.
 */

// ============================================================
// Types
// ============================================================
export interface FormattedBashResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  truncated: boolean;
}

export interface FormattedEditResult {
  success: boolean;
  filePath: string;
  filename: string;
  action: string;
}

export interface FormattedViewResult {
  language: string;
  filename: string;
  code: string;
  lineCount: number;
}

export interface FormattedCreateFileResult {
  success: boolean;
  filePath: string;
  filename: string;
}

export interface FormattedPresentFilesResult {
  fileCount: number;
  files: string[];
}

export interface FormattedSearchResult {
  matchCount: number;
  fileCount: number;
  query: string;
}

export interface FormattedFetchResult {
  url: string;
  title: string;
  contentLength: number;
}

export interface FormattedTestResult {
  passed: number;
  failed: number;
  total: number;
  duration: number;
  errors: number;
}

export interface FormattedDiffResult {
  added: number;
  removed: number;
  files: number;
}

export interface FormattedGenericResult {
  text: string;
  truncated: boolean;
  lines: number;
}

// ============================================================
// formatBashResult
// ============================================================
export function formatBashResult(text: string): FormattedBashResult {
  try {
    const parsed = JSON.parse(text);
    return {
      success: (typeof parsed.returncode === 'number' ? parsed.returncode : -1) === 0,
      exitCode: typeof parsed.returncode === 'number' ? parsed.returncode : -1,
      stdout: parsed.stdout || '',
      stderr: parsed.stderr || '',
      truncated: (parsed.stdout || '').length > 10000,
    };
  } catch {
    return {
      success: true, // Assume success if not JSON
      exitCode: 0,
      stdout: text,
      stderr: '',
      truncated: text.length > 10000,
    };
  }
}

// ============================================================
// formatEditResult (rich version)
// ============================================================
export function formatEditResult(text: string): FormattedEditResult {
  const success = text.startsWith('Successfully');
  const pathMatch = text.match(/(?:in |exists: |Created |Wrote )(\/\S+)/);
  const filePath = pathMatch ? pathMatch[1] : '';
  const filename = filePath ? filePath.split('/').pop() || '' : '';
  const action = success ? 'replaced' : 'failed';
  return { success, filePath, filename, action };
}

// ============================================================
// formatViewResult
// ============================================================
export function formatViewResult(jsonStr: string): FormattedViewResult {
  try {
    const parsed = JSON.parse(jsonStr);
    const code = parsed.code || '';
    const filename = parsed.filename || '';
    return {
      language: parsed.language || '',
      filename: filename.split('/').pop() || filename,
      code,
      lineCount: code.split('\n').length,
    };
  } catch {
    return { language: '', filename: '', code: jsonStr, lineCount: jsonStr.split('\n').length };
  }
}

// ============================================================
// formatCreateFileResult
// ============================================================
export function formatCreateFileResult(text: string): FormattedCreateFileResult {
  const pathMatch = text.match(/(\/\S+)/);
  const filePath = pathMatch ? pathMatch[1] : '';
  const filename = filePath ? filePath.split('/').pop() || '' : '';
  return {
    success: text.toLowerCase().includes('creat') || !text.toLowerCase().includes('error'),
    filePath,
    filename,
  };
}

// ============================================================
// formatPresentFilesResult
// ============================================================
export function formatPresentFilesResult(text: string): FormattedPresentFilesResult {
  const countMatch = text.match(/(\d+)\s*files?/i);
  const fileCount = countMatch ? parseInt(countMatch[1], 10) : 1;
  return { fileCount, files: [] };
}

// ============================================================
// formatSearchResult
// ============================================================
export function formatSearchResult(text: string): FormattedSearchResult {
  const matchCountMatch = text.match(/(\d+)\s*match/i);
  const fileCountMatch = text.match(/(\d+)\s*files?/i);
  return {
    matchCount: matchCountMatch ? parseInt(matchCountMatch[1], 10) : 0,
    fileCount: fileCountMatch ? parseInt(fileCountMatch[1], 10) : 0,
    query: '',
  };
}

// ============================================================
// formatFetchResult
// ============================================================
export function formatFetchResult(text: string): FormattedFetchResult {
  return {
    url: '',
    title: text.slice(0, 100),
    contentLength: text.length,
  };
}

// ============================================================
// formatTestResult — parses pytest/jest output
// ============================================================
export function formatTestResult(text: string): FormattedTestResult {
  let passed = 0, failed = 0, errors = 0, duration = 0;

  // pytest: "89 passed, 11 failed in 23.96s"
  const pytestMatch = text.match(/(\d+)\s*passed/i);
  if (pytestMatch) passed = parseInt(pytestMatch[1], 10);
  
  const failedMatch = text.match(/(\d+)\s*failed/i);
  if (failedMatch) failed = parseInt(failedMatch[1], 10);
  
  const errorMatch = text.match(/(\d+)\s*error/i);
  if (errorMatch) errors = parseInt(errorMatch[1], 10);

  const durationMatch = text.match(/in\s*([\d.]+)s/i);
  if (durationMatch) duration = parseFloat(durationMatch[1]);

  return {
    passed,
    failed,
    total: passed + failed + errors,
    duration,
    errors,
  };
}

// ============================================================
// formatDiffResult
// ============================================================
export function formatDiffResult(text: string): FormattedDiffResult {
  let added = 0, removed = 0;
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) added++;
    else if (line.startsWith('-') && !line.startsWith('---')) removed++;
  }
  return { added, removed, files: 1 };
}

// ============================================================
// formatGenericToolResult
// ============================================================
export function formatGenericToolResult(text: string): FormattedGenericResult {
  return {
    text,
    truncated: text.length > 5000,
    lines: text.split('\n').length,
  };
}
