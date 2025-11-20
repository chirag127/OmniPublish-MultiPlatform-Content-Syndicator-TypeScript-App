#!/usr/bin/env node
/**
 * Static site generator
 * Builds index page and individual post pages from markdown content
 */

import * as fs from "fs";
import * as path from "path";
import { getAllPosts, Post } from "./utils/markdown";
import { logger } from "./utils/logger";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const POSTS_DIR = path.join(PUBLIC_DIR, "posts");
const POSTS_PER_PAGE = 10;

/**
 * Ensure directories exist
 */
function ensureDirectories() {
    if (!fs.existsSync(PUBLIC_DIR)) {
        fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }
    if (!fs.existsSync(POSTS_DIR)) {
        fs.mkdirSync(POSTS_DIR, { recursive: true });
    }
}

/**
 * Generate HTML layout
 */
function generateLayout(title: string, content: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Omni-Publisher</title>
    <link rel="stylesheet" href="/assets/styles.css">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-6">
            <h1 class="text-3xl font-bold text-gray-900">
                <a href="/" class="hover:text-blue-600">Omni-Publisher Blog</a>
            </h1>
            <p class="text-gray-600 mt-2">Write Once, Publish Everywhere</p>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-8">
        ${content}
    </main>

    <footer class="bg-white border-t mt-12">
        <div class="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
            <p>Powered by Omni-Publisher Content Ecosystem</p>
            <p class="text-sm mt-2">Multi-platform content publishing automation</p>
        </div>
    </footer>
</body>
</html>`;
}

/**
 * Generate post card HTML
 */
function generatePostCard(post: Post): string {
    const date = new Date(post.metadata.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const tags = post.metadata.tags
        .slice(0, 3)
        .map(
            (tag) =>
                `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${tag}</span>`
        )
        .join(" ");

    return `
    <article class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h2 class="text-2xl font-bold mb-2">
            <a href="/posts/${
                post.metadata.slug
            }.html" class="text-gray-900 hover:text-blue-600">
                ${post.metadata.title}
            </a>
        </h2>
        <div class="text-sm text-gray-500 mb-3">
            <time datetime="${post.metadata.date}">${date}</time>
            ${
                post.metadata.author
                    ? `<span class="mx-2">•</span><span>By ${post.metadata.author}</span>`
                    : ""
            }
        </div>
        <p class="text-gray-700 mb-4">${post.metadata.description}</p>
        <div class="flex items-center justify-between">
            <div class="space-x-2">${tags}</div>
            <a href="/posts/${
                post.metadata.slug
            }.html" class="text-blue-600 hover:text-blue-800 font-medium">
                Read more →
            </a>
        </div>
    </article>
  `;
}

/**
 * Generate pagination HTML
 */
function generatePagination(currentPage: number, totalPages: number): string {
    if (totalPages <= 1) return "";

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        const href = i === 1 ? "/index.html" : `/page-${i}.html`;
        pages.push(`
      <a href="${href}" class="px-4 py-2 ${
            isActive
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
        } rounded">
        ${i}
      </a>
    `);
    }

    return `
    <nav class="flex justify-center space-x-2 mt-8">
      ${pages.join("")}
    </nav>
  `;
}

/**
 * Build index page
 */
function buildIndexPage(posts: Post[]) {
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

    for (let page = 1; page <= totalPages; page++) {
        const start = (page - 1) * POSTS_PER_PAGE;
        const end = start + POSTS_PER_PAGE;
        const pagePosts = posts.slice(start, end);

        const postsHtml = pagePosts.map(generatePostCard).join("\n");
        const pagination = generatePagination(page, totalPages);

        const content = `
      <div class="space-y-6">
        ${postsHtml}
      </div>
      ${pagination}
    `;

        const html = generateLayout("Home", content);
        const filename = page === 1 ? "index.html" : `page-${page}.html`;
        fs.writeFileSync(path.join(PUBLIC_DIR, filename), html);

        logger.info(`Generated ${filename}`);
    }
}

/**
 * Build individual post page
 */
function buildPostPage(post: Post) {
    const date = new Date(post.metadata.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const tags = post.metadata.tags
        .map(
            (tag) =>
                `<span class="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">${tag}</span>`
        )
        .join(" ");

    const content = `
    <article class="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
        <header class="mb-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-4">${
                post.metadata.title
            }</h1>
            <div class="text-gray-600 mb-4">
                <time datetime="${post.metadata.date}">${date}</time>
                ${
                    post.metadata.author
                        ? `<span class="mx-2">•</span><span>By ${post.metadata.author}</span>`
                        : ""
                }
            </div>
            <div class="space-x-2 mb-6">${tags}</div>
            <p class="text-xl text-gray-700 italic">${
                post.metadata.description
            }</p>
        </header>

        <div class="prose prose-lg max-w-none">
            ${post.html}
        </div>

        <footer class="mt-12 pt-6 border-t">
            <a href="/" class="text-blue-600 hover:text-blue-800 font-medium">
                ← Back to all posts
            </a>
        </footer>
    </article>
  `;

    const html = generateLayout(post.metadata.title, content);
    const filename = `${post.metadata.slug}.html`;
    fs.writeFileSync(path.join(POSTS_DIR, filename), html);

    logger.info(`Generated post: ${filename}`);
}

/**
 * Copy assets
 */
function copyAssets() {
    const assetsDir = path.join(PUBLIC_DIR, "assets");
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Create basic CSS file if it doesn't exist
    const cssPath = path.join(assetsDir, "styles.css");
    if (!fs.existsSync(cssPath)) {
        const css = `
/* Additional custom styles */
.prose {
  color: #374151;
}

.prose h1, .prose h2, .prose h3 {
  color: #111827;
  font-weight: 700;
}

.prose a {
  color: #2563eb;
  text-decoration: none;
}

.prose a:hover {
  text-decoration: underline;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.prose img {
  border-radius: 0.5rem;
  margin: 2rem auto;
}
    `.trim();

        fs.writeFileSync(cssPath, css);
        logger.info("Generated styles.css");
    }
}

/**
 * Main build function
 */
async function main() {
    logger.info("Starting static site build");

    // Ensure directories
    ensureDirectories();

    // Get all posts
    const posts = getAllPosts();
    logger.info(`Found ${posts.length} posts`);

    if (posts.length === 0) {
        logger.warn(
            "No posts found. Please add markdown files to content/posts/"
        );
        return;
    }

    // Build pages
    buildIndexPage(posts);

    posts.forEach((post) => {
        buildPostPage(post);
    });

    // Copy assets
    copyAssets();

    logger.success(`Site built successfully! ${posts.length} posts generated.`);
    logger.info(`Output directory: ${PUBLIC_DIR}`);
}

// Run
main().catch((error) => {
    logger.error("Build failed", undefined, undefined, {
        error: error.message,
    });
    process.exit(1);
});
