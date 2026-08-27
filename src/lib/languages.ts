/**
 * Languages offered in the code editor's language dropdown.
 * `value` must be a Monaco language id so syntax highlighting works.
 */
export interface LanguageOption {
  value: string;
  label: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'css', label: 'CSS' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'go', label: 'Go' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'html', label: 'HTML' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'lua', label: 'Lua' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'objective-c', label: 'Objective-C' },
  { value: 'php', label: 'PHP' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'python', label: 'Python' },
  { value: 'r', label: 'R' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'rust', label: 'Rust' },
  { value: 'scss', label: 'SCSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'swift', label: 'Swift' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
];

const LANGUAGE_LABELS = new Map(LANGUAGE_OPTIONS.map((o) => [o.value, o.label]));

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  md: 'markdown',
  'c++': 'cpp',
  'c#': 'csharp',
  cs: 'csharp',
  golang: 'go',
  rb: 'ruby',
  rs: 'rust',
  ps1: 'powershell',
  postgres: 'sql',
  postgresql: 'sql',
  psql: 'sql',
  text: 'plaintext',
  plain: 'plaintext',
};

/**
 * Normalizes a stored language string to a Monaco language id.
 * Falls back to `plaintext` for unknown values so highlighting never breaks.
 */
export function normalizeLanguage(language: string | null | undefined): string {
  if (!language) return 'plaintext';
  const lower = language.toLowerCase().trim();
  if (LANGUAGE_LABELS.has(lower)) return lower;
  return LANGUAGE_ALIASES[lower] ?? 'plaintext';
}

export function getLanguageLabel(language: string | null | undefined): string {
  return LANGUAGE_LABELS.get(normalizeLanguage(language)) ?? 'Plain Text';
}
