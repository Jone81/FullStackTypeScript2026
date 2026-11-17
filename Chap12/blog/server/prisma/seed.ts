import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { hashPassword } from "../src/lib/utils/PasswordHash.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Seed Topics
  const topicNames = [
    "Technology",
    "React",
    "TypeScript",
    "Node.js",
    "Web Development",
    "Programming",
    "Design",
    "Architecture",
  ];

  const topics: Record<string, bigint> = {};
  for (const name of topicNames) {
    const existing = await prisma.topic.findFirst({ where: { name } });
    if (existing) {
      topics[name] = existing.id;
    } else {
      const created = await prisma.topic.create({ data: { name } });
      topics[name] = created.id;
    }
  }
  console.log(`Seeded ${Object.keys(topics).length} topics.`);

  // 2. Seed Profiles
  const defaultPasswordHash = await hashPassword("salasana1234");

  const profilesData = [
    {
      userName: "jouni123",
      fullName: "Jouni Kurki",
      description: "Full-Stack Developer & Software Architect",
      socialLinkPrimary: "https://github.com",
      socialLinkSecondary: "https://linkedin.com",
    },
    {
      userName: "matti123",
      fullName: "Matti Meikäläinen",
      description: "TypeScript and React Enthusiast",
      socialLinkPrimary: "https://twitter.com",
      socialLinkSecondary: "https://github.com",
    },
    {
      userName: "anna_dev",
      fullName: "Anna Virtanen",
      description: "UI/UX Designer and Frontend Specialist",
      socialLinkPrimary: "https://dribbble.com",
      socialLinkSecondary: "https://github.com",
    },
  ];

  const profileIds: Record<string, bigint> = {};
  for (const p of profilesData) {
    const existing = await prisma.profile.findFirst({ where: { userName: p.userName } });
    if (existing) {
      profileIds[p.userName] = existing.id;
      // Update password hash if needed
      await prisma.profile.update({
        where: { id: existing.id },
        data: { password: defaultPasswordHash, fullName: p.fullName, description: p.description },
      });
    } else {
      const created = await prisma.profile.create({
        data: {
          userName: p.userName,
          password: defaultPasswordHash,
          fullName: p.fullName,
          description: p.description,
          socialLinkPrimary: p.socialLinkPrimary,
          socialLinkSecondary: p.socialLinkSecondary,
        },
      });
      profileIds[p.userName] = created.id;
    }
  }
  console.log(`Seeded profiles: ${Object.keys(profileIds).join(", ")}.`);

  // 3. Seed Follows
  const jouniId = profileIds["jouni123"];
  const mattiId = profileIds["matti123"];
  const annaId = profileIds["anna_dev"];

  if (jouniId && mattiId) {
    const exists = await prisma.follow.findFirst({ where: { followedId: mattiId, followerId: jouniId } });
    if (!exists) {
      await prisma.follow.create({ data: { followedId: mattiId, followerId: jouniId } });
    }
    const reverseExists = await prisma.follow.findFirst({ where: { followedId: jouniId, followerId: mattiId } });
    if (!reverseExists) {
      await prisma.follow.create({ data: { followedId: jouniId, followerId: mattiId } });
    }
  }
  if (jouniId && annaId) {
    const exists = await prisma.follow.findFirst({ where: { followedId: annaId, followerId: jouniId } });
    if (!exists) {
      await prisma.follow.create({ data: { followedId: annaId, followerId: jouniId } });
    }
  }

  // 4. Seed Works (Stories)
  const stories = [
    {
      authorKey: "jouni123",
      title: "Mastering React 19: Server Actions and Modern State Patterns",
      description: "A comprehensive guide to React 19 features including Server Actions, useActionState, and optimistic updates.",
      content: `# Mastering React 19: Server Actions and Modern State Patterns

React 19 brings exciting new primitives to web development. In this article, we explore how Server Actions, \`useActionState\`, and \`useOptimistic\` simplify asynchronous state management.

## 1. Actions in React 19
By allowing async functions directly in form handlers, React 19 eliminates boilerplate code for managing loading and pending states.

\`\`\`tsx
const [state, formAction, isPending] = useActionState(async (prev, formData) => {
  return await submitForm(formData);
}, null);
\`\`\`

## 2. Native Promises in Components
With the new \`use\` hook, resolving promises within component renders becomes second nature without boilerplate useEffect calls.

## Conclusion
React 19 makes code cleaner, reduces dependencies, and improves performance across modern full-stack web applications.`,
      topics: ["React", "Web Development", "Technology"],
    },
    {
      authorKey: "matti123",
      title: "Building Scalable Backends with Express 5 and Prisma ORM",
      description: "Learn how to structure enterprise-ready backend services using TypeScript, Prisma ORM, and Express 5.",
      content: `# Building Scalable Backends with Express 5 and Prisma ORM

Designing modern Node.js backends requires strong typing, robust error handling, and clean database abstraction.

## Type-Safe Database Queries with Prisma
Prisma ORM provides automatic TypeScript types derived from your database schema:

\`\`\`ts
const user = await prisma.profile.findUnique({
  where: { userName: "jouni123" }
});
\`\`\`

## Authentication with JWT and HTTP-Only Cookies
Protecting APIs requires stateless authentication with rotating refresh tokens stored securely in HTTP-only cookies.

Express 5 natively supports async route handlers and promise rejection handling, eliminating try-catch wrappers for simple controllers.`,
      topics: ["Node.js", "TypeScript", "Technology"],
    },
    {
      authorKey: "jouni123",
      title: "Full-Stack TypeScript Architecture in Practice",
      description: "Best practices for full-stack monorepos, shared packages, and end-to-end type safety.",
      content: `# Full-Stack TypeScript Architecture in Practice

Monorepo architectures with npm workspaces, shared validation schemas, and unified TypeScript configurations empower modern teams to ship faster.

## Workspace Strategy
- \`lib\`: Shared domain types, Zod schemas, utility functions.
- \`server\`: Express 5 REST API, Prisma repository pattern.
- \`client\`: Vite + React 19 single page application with Redux Toolkit.

By sharing validation schemas between client and server, validation logic remains strictly DRY (Don't Repeat Yourself).`,
      topics: ["Architecture", "Programming", "Technology"],
    },
    {
      authorKey: "anna_dev",
      title: "Designing Accessible and Beautiful Web Applications",
      description: "Creating accessible, responsive components with modern CSS variables and flexbox/grid layouts.",
      content: `# Designing Accessible and Beautiful Web Applications

User experience is at the core of every successful digital product. Combining modern CSS color schemes with responsive typography creates seamless user journeys.

## Key Principles
1. Contrast and color accessibility (WCAG 2.1 standards).
2. Keyboard navigation and screen reader support.
3. Fluid typography using CSS clamp.
4. Minimalist visual hierarchy.`,
      topics: ["Design", "Web Development"],
    },
  ];

  for (const story of stories) {
    const authorId = profileIds[story.authorKey];
    if (!authorId) continue;

    const existingWork = await prisma.work.findFirst({ where: { title: story.title } });
    let workId: bigint;
    if (existingWork) {
      workId = existingWork.id;
    } else {
      const created = await prisma.work.create({
        data: {
          authorId,
          title: story.title,
          description: story.description,
          content: story.content,
        },
      });
      workId = created.id;

      // Link topics
      for (const tName of story.topics) {
        const topicId = topics[tName];
        if (topicId) {
          await prisma.workTopic.create({
            data: {
              workId,
              topicId,
            },
          });
        }
      }

      // Add likes
      for (const likerKey of Object.keys(profileIds)) {
        await prisma.workLike.create({
          data: {
            workId,
            likerId: profileIds[likerKey],
          },
        });
      }

      // Add sample response
      await prisma.workResponse.create({
        data: {
          workId,
          responderId: mattiId,
          response: "Great article! Really enjoyed the clear explanations and code examples.",
        },
      });
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
