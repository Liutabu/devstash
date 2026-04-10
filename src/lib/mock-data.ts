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
