import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ─── User ─────────────────────────────────────────────────────────────────

  const passwordHash = await bcrypt.hash("12345678", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: { password: passwordHash },
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      emailVerified: new Date(),
      isPro: false,
      password: passwordHash,
    },
  });

  console.log(`User: ${user.email}`);

  // Wipe existing items and collections so re-runs don't duplicate
  await prisma.item.deleteMany({ where: { userId: user.id } });
  await prisma.collection.deleteMany({ where: { userId: user.id } });

  // ─── Item Types ───────────────────────────────────────────────────────────

  const itemTypeDefs = [
    { name: "snippet", slug: "snippet", icon: "Code", color: "#3b82f6" },
    { name: "prompt", slug: "prompt", icon: "Sparkles", color: "#8b5cf6" },
    { name: "command", slug: "command", icon: "Terminal", color: "#f97316" },
    { name: "note", slug: "note", icon: "StickyNote", color: "#fde047" },
    { name: "file", slug: "file", icon: "File", color: "#6b7280" },
    { name: "image", slug: "image", icon: "Image", color: "#ec4899" },
    { name: "link", slug: "link", icon: "Link", color: "#10b981" },
  ];

  const itemTypes: Record<string, string> = {};

  for (const def of itemTypeDefs) {
    const existing = await prisma.itemType.findFirst({
      where: { slug: def.slug, isSystem: true },
    });
    const type = existing
      ? existing
      : await prisma.itemType.create({
          data: { ...def, isSystem: true, userId: null },
        });
    itemTypes[def.slug] = type.id;
    console.log(`ItemType: ${type.name}`);
  }

  // ─── Tags ─────────────────────────────────────────────────────────────────

  const tagNames = [
    "react",
    "hooks",
    "typescript",
    "ai",
    "prompts",
    "docker",
    "git",
    "devops",
    "css",
    "tailwind",
    "design",
    "ui",
    "cli",
    "npm",
  ];

  const tags: Record<string, string> = {};

  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tags[name] = tag.id;
  }

  console.log(`Tags: ${tagNames.length} created`);

  // ─── Collections & Items ──────────────────────────────────────────────────

  // Helper to create an item
  async function createItem(data: {
    title: string;
    contentType: "text" | "file" | "url";
    content?: string;
    url?: string;
    description?: string;
    language?: string;
    isFavorite?: boolean;
    isPinned?: boolean;
    typeSlug: string;
    tagSlugs?: string[];
  }) {
    const item = await prisma.item.create({
      data: {
        title: data.title,
        contentType: data.contentType,
        content: data.content,
        url: data.url,
        description: data.description,
        language: data.language,
        isFavorite: data.isFavorite ?? false,
        isPinned: data.isPinned ?? false,
        userId: user.id,
        itemTypeId: itemTypes[data.typeSlug],
      },
    });

    if (data.tagSlugs?.length) {
      await prisma.tagsOnItems.createMany({
        data: data.tagSlugs.map((t) => ({ itemId: item.id, tagId: tags[t] })),
        skipDuplicates: true,
      });
    }

    return item;
  }

  // ── React Patterns ────────────────────────────────────────────────────────

  const reactPatterns = await prisma.collection.upsert({
    where: { id: "seed-col-react-patterns" },
    update: {},
    create: {
      id: "seed-col-react-patterns",
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      isFavorite: true,
      userId: user.id,
    },
  });

  const reactItems = await Promise.all([
    createItem({
      title: "useDebounce & useLocalStorage hooks",
      contentType: "text",
      language: "typescript",
      isFavorite: true,
      typeSlug: "snippet",
      tagSlugs: ["react", "hooks", "typescript"],
      content: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}`,
    }),
    createItem({
      title: "Context provider + compound component pattern",
      contentType: "text",
      language: "typescript",
      typeSlug: "snippet",
      tagSlugs: ["react", "typescript"],
      content: `import { createContext, useContext, useState, ReactNode } from 'react';

interface AccordionContextValue {
  openId: string | null;
  toggle: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('Must be used within <Accordion>');
  return ctx;
}

function Accordion({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));
  return (
    <AccordionContext.Provider value={{ openId, toggle }}>
      <div>{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const { openId, toggle } = useAccordion();
  return (
    <div>
      <button onClick={() => toggle(id)}>{title}</button>
      {openId === id && <div>{children}</div>}
    </div>
  );
}

Accordion.Item = AccordionItem;
export default Accordion;`,
    }),
    createItem({
      title: "Type-safe fetch utility",
      contentType: "text",
      language: "typescript",
      typeSlug: "snippet",
      tagSlugs: ["typescript"],
      content: `export async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
  }

  return res.json() as Promise<T>;
}

// Usage:
// const data = await fetchJson<{ users: User[] }>('/api/users');`,
    }),
  ]);

  for (const item of reactItems) {
    await prisma.itemCollection.upsert({
      where: { itemId_collectionId: { itemId: item.id, collectionId: reactPatterns.id } },
      update: {},
      create: { itemId: item.id, collectionId: reactPatterns.id },
    });
  }

  console.log(`Collection: ${reactPatterns.name} (${reactItems.length} items)`);

  // ── AI Workflows ──────────────────────────────────────────────────────────

  const aiWorkflows = await prisma.collection.upsert({
    where: { id: "seed-col-ai-workflows" },
    update: {},
    create: {
      id: "seed-col-ai-workflows",
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      isFavorite: true,
      userId: user.id,
    },
  });

  const aiItems = await Promise.all([
    createItem({
      title: "Code review prompt",
      contentType: "text",
      typeSlug: "prompt",
      tagSlugs: ["ai", "prompts"],
      description: "Comprehensive code review covering bugs, security, and style",
      content: `You are an expert code reviewer. Review the following code and provide feedback on:

1. **Bugs & Logic Errors** — anything that could cause incorrect behavior
2. **Security** — vulnerabilities like injection, XSS, unvalidated input
3. **Performance** — unnecessary re-renders, N+1 queries, expensive operations
4. **Readability** — naming, structure, comments where logic isn't obvious
5. **Best Practices** — adherence to language/framework conventions

Format your response as a numbered list grouped by severity: 🔴 Critical, 🟡 Warning, 🟢 Suggestion.

\`\`\`
{PASTE CODE HERE}
\`\`\``,
    }),
    createItem({
      title: "Documentation generation prompt",
      contentType: "text",
      typeSlug: "prompt",
      tagSlugs: ["ai", "prompts"],
      description: "Generate JSDoc/TSDoc documentation for functions and modules",
      content: `Generate comprehensive documentation for the following code. Include:

- A brief description of what the function/module does
- @param annotations with types and descriptions for each parameter
- @returns annotation describing the return value and type
- @throws for any errors that may be thrown
- A short usage example in a @example block

Keep descriptions concise but complete. Do not add obvious comments.

\`\`\`typescript
{PASTE CODE HERE}
\`\`\``,
    }),
    createItem({
      title: "Refactoring assistant prompt",
      contentType: "text",
      typeSlug: "prompt",
      tagSlugs: ["ai", "prompts"],
      description: "Refactor code while preserving behavior",
      content: `Refactor the following code to improve readability and maintainability. Rules:

- Do NOT change the external API or behavior
- Extract repeated logic into well-named helpers
- Replace imperative loops with declarative equivalents where clearer
- Use early returns to reduce nesting
- Apply the single-responsibility principle
- Explain each significant change you make and why

\`\`\`
{PASTE CODE HERE}
\`\`\``,
    }),
  ]);

  for (const item of aiItems) {
    await prisma.itemCollection.upsert({
      where: { itemId_collectionId: { itemId: item.id, collectionId: aiWorkflows.id } },
      update: {},
      create: { itemId: item.id, collectionId: aiWorkflows.id },
    });
  }

  console.log(`Collection: ${aiWorkflows.name} (${aiItems.length} items)`);

  // ── DevOps ────────────────────────────────────────────────────────────────

  const devops = await prisma.collection.upsert({
    where: { id: "seed-col-devops" },
    update: {},
    create: {
      id: "seed-col-devops",
      name: "DevOps",
      description: "Infrastructure and deployment resources",
      userId: user.id,
    },
  });

  const devopsItems = await Promise.all([
    createItem({
      title: "Docker multi-stage build for Node.js",
      contentType: "text",
      language: "dockerfile",
      typeSlug: "snippet",
      tagSlugs: ["docker", "devops"],
      isPinned: true,
      content: `# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]`,
    }),
    createItem({
      title: "Deploy to production",
      contentType: "text",
      typeSlug: "command",
      tagSlugs: ["docker", "devops"],
      content: `# Pull latest, rebuild, and restart with zero downtime
git pull origin main && \\
  docker build -t myapp:latest . && \\
  docker stop myapp || true && \\
  docker rm myapp || true && \\
  docker run -d --name myapp --restart unless-stopped -p 3000:3000 myapp:latest`,
    }),
    createItem({
      title: "Docker documentation",
      contentType: "url",
      typeSlug: "link",
      tagSlugs: ["docker", "devops"],
      url: "https://docs.docker.com/reference/",
      description: "Official Docker reference documentation",
    }),
    createItem({
      title: "GitHub Actions docs",
      contentType: "url",
      typeSlug: "link",
      tagSlugs: ["devops"],
      url: "https://docs.github.com/en/actions",
      description: "GitHub Actions workflow documentation",
    }),
  ]);

  for (const item of devopsItems) {
    await prisma.itemCollection.upsert({
      where: { itemId_collectionId: { itemId: item.id, collectionId: devops.id } },
      update: {},
      create: { itemId: item.id, collectionId: devops.id },
    });
  }

  console.log(`Collection: ${devops.name} (${devopsItems.length} items)`);

  // ── Terminal Commands ─────────────────────────────────────────────────────

  const terminalCmds = await prisma.collection.upsert({
    where: { id: "seed-col-terminal-commands" },
    update: {},
    create: {
      id: "seed-col-terminal-commands",
      name: "Terminal Commands",
      description: "Useful shell commands for everyday development",
      userId: user.id,
    },
  });

  const terminalItems = await Promise.all([
    createItem({
      title: "Git: undo last commit (keep changes)",
      contentType: "text",
      typeSlug: "command",
      tagSlugs: ["git", "cli"],
      content: `git reset --soft HEAD~1`,
    }),
    createItem({
      title: "Docker: remove all stopped containers & unused images",
      contentType: "text",
      typeSlug: "command",
      tagSlugs: ["docker", "cli"],
      content: `docker container prune -f && docker image prune -f`,
    }),
    createItem({
      title: "Find and kill process on port",
      contentType: "text",
      typeSlug: "command",
      tagSlugs: ["cli"],
      description: "Kill whatever is running on a given port (macOS/Linux)",
      content: `lsof -ti tcp:3000 | xargs kill -9`,
    }),
    createItem({
      title: "npm: list outdated packages",
      contentType: "text",
      typeSlug: "command",
      tagSlugs: ["npm", "cli"],
      content: `npm outdated`,
    }),
  ]);

  for (const item of terminalItems) {
    await prisma.itemCollection.upsert({
      where: { itemId_collectionId: { itemId: item.id, collectionId: terminalCmds.id } },
      update: {},
      create: { itemId: item.id, collectionId: terminalCmds.id },
    });
  }

  console.log(`Collection: ${terminalCmds.name} (${terminalItems.length} items)`);

  // ── Design Resources ──────────────────────────────────────────────────────

  const designResources = await prisma.collection.upsert({
    where: { id: "seed-col-design-resources" },
    update: {},
    create: {
      id: "seed-col-design-resources",
      name: "Design Resources",
      description: "UI/UX resources and references",
      userId: user.id,
    },
  });

  const designItems = await Promise.all([
    createItem({
      title: "Tailwind CSS docs",
      contentType: "url",
      typeSlug: "link",
      tagSlugs: ["css", "tailwind", "design"],
      url: "https://tailwindcss.com/docs",
      description: "Official Tailwind CSS documentation",
    }),
    createItem({
      title: "shadcn/ui components",
      contentType: "url",
      typeSlug: "link",
      tagSlugs: ["ui", "design"],
      url: "https://ui.shadcn.com/",
      description: "Beautifully designed components built with Radix UI and Tailwind",
    }),
    createItem({
      title: "Radix UI primitives",
      contentType: "url",
      typeSlug: "link",
      tagSlugs: ["ui", "design"],
      url: "https://www.radix-ui.com/primitives",
      description: "Unstyled, accessible UI primitives for React",
    }),
    createItem({
      title: "Lucide icons",
      contentType: "url",
      typeSlug: "link",
      tagSlugs: ["ui", "design"],
      url: "https://lucide.dev/icons/",
      description: "Open-source icon library with 1000+ icons",
    }),
  ]);

  for (const item of designItems) {
    await prisma.itemCollection.upsert({
      where: { itemId_collectionId: { itemId: item.id, collectionId: designResources.id } },
      update: {},
      create: { itemId: item.id, collectionId: designResources.id },
    });
  }

  console.log(`Collection: ${designResources.name} (${designItems.length} items)`);

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
