// ─── Item Types ────────────────────────────────────────────────────────────

export const mockItemTypes = [
  { id: "it_snippet", name: "Snippet",  slug: "snippets", icon: "Code",       color: "#3b82f6", isSystem: true },
  { id: "it_prompt",  name: "Prompt",   slug: "prompts",  icon: "Sparkles",   color: "#8b5cf6", isSystem: true },
  { id: "it_command", name: "Command",  slug: "commands", icon: "Terminal",   color: "#f97316", isSystem: true },
  { id: "it_note",    name: "Note",     slug: "notes",    icon: "StickyNote", color: "#fde047", isSystem: true },
  { id: "it_file",    name: "File",     slug: "files",    icon: "File",       color: "#6b7280", isSystem: true },
  { id: "it_image",   name: "Image",    slug: "images",   icon: "Image",      color: "#ec4899", isSystem: true },
  { id: "it_link",    name: "Link",     slug: "links",    icon: "Link",       color: "#10b981", isSystem: true },
] as const;

// ─── Current User ──────────────────────────────────────────────────────────

export const mockUser = {
  id: "user_1",
  name: "John Doe",
  email: "demo@devstash.io",
  image: null,
  isPro: false,
};

// ─── Collections ──────────────────────────────────────────────────────────

export const mockCollections = [
  {
    id: "col_1",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    isFavorite: true,
    itemCount: 12,
    dominantColor: "#3b82f6", // blue (snippet)
    icons: ["Code", "Code", "Link"],
  },
  {
    id: "col_2",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    isFavorite: false,
    itemCount: 8,
    dominantColor: "#3b82f6",
    icons: ["Code", "Terminal"],
  },
  {
    id: "col_3",
    name: "Context Files",
    description: "AI context files for projects",
    isFavorite: true,
    itemCount: 5,
    dominantColor: "#6b7280", // gray (file)
    icons: ["File", "StickyNote"],
  },
  {
    id: "col_4",
    name: "Interview Prep",
    description: "Technical interview preparation",
    isFavorite: true,
    itemCount: 24,
    dominantColor: "#3b82f6",
    icons: ["Code", "Link", "StickyNote"],
  },
  {
    id: "col_5",
    name: "Git Commands",
    description: "Frequently used git commands",
    isFavorite: true,
    itemCount: 15,
    dominantColor: "#f97316", // orange (command)
    icons: ["Terminal", "Code"],
  },
  {
    id: "col_6",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    isFavorite: false,
    itemCount: 18,
    dominantColor: "#8b5cf6", // purple (prompt)
    icons: ["Sparkles", "Code"],
  },
] as const;

// ─── Items ────────────────────────────────────────────────────────────────

export const mockItems = [
  {
    id: "item_1",
    title: "useAuth Hook",
    contentType: "text",
    content: `import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}`,
    description: "Custom authentication hook for React applications",
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    tags: ["react", "auth", "hooks"],
    itemTypeId: "it_snippet",
    itemType: { id: "it_snippet", name: "Snippet", color: "#3b82f6", icon: "Code" },
    createdAt: new Date("2026-01-15"),
    collectionIds: ["col_1", "col_4"],
  },
  {
    id: "item_2",
    title: "API Error Handling Pattern",
    contentType: "text",
    content: `async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2 ** i * 1000));
    }
  }
  throw new Error("Unreachable");
}`,
    description: "Fetch wrapper with exponential backoff retry logic",
    language: "typescript",
    isFavorite: false,
    isPinned: true,
    tags: ["api", "error-handling", "typescript"],
    itemTypeId: "it_snippet",
    itemType: { id: "it_snippet", name: "Snippet", color: "#3b82f6", icon: "Code" },
    createdAt: new Date("2026-01-15"),
    collectionIds: ["col_1"],
  },
  {
    id: "item_3",
    title: "Git force push safe",
    contentType: "text",
    content: "git push --force-with-lease origin HEAD",
    description: "Force push that fails if remote has new commits",
    language: null,
    isFavorite: false,
    isPinned: false,
    tags: ["git"],
    itemTypeId: "it_command",
    itemType: { id: "it_command", name: "Command", color: "#f97316", icon: "Terminal" },
    createdAt: new Date("2026-01-10"),
    collectionIds: ["col_5"],
  },
  {
    id: "item_4",
    title: "Code Review Prompt",
    contentType: "text",
    content: "Review the following code for bugs, security issues, and performance problems. Be concise. Format as a numbered list.",
    description: "General purpose code review prompt",
    language: null,
    isFavorite: true,
    isPinned: false,
    tags: ["review", "ai"],
    itemTypeId: "it_prompt",
    itemType: { id: "it_prompt", name: "Prompt", color: "#8b5cf6", icon: "Sparkles" },
    createdAt: new Date("2026-01-08"),
    collectionIds: ["col_6"],
  },
  {
    id: "item_5",
    title: "Next.js Boilerplate Links",
    contentType: "url",
    content: null,
    url: "https://nextjs.org/docs",
    description: "Next.js official documentation",
    language: null,
    isFavorite: false,
    isPinned: false,
    tags: ["nextjs", "docs"],
    itemTypeId: "it_link",
    itemType: { id: "it_link", name: "Link", color: "#10b981", icon: "Link" },
    createdAt: new Date("2026-01-05"),
    collectionIds: ["col_1"],
  },
] as const;

// ─── Type counts for the sidebar ──────────────────────────────────────────

export const mockItemTypeCounts: Record<string, number> = {
  it_snippet: 24,
  it_prompt:  18,
  it_command: 15,
  it_note:    12,
  it_file:     5,
  it_image:    3,
  it_link:     8,
};