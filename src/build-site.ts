/**
 * Static Site Generator
 * Builds HTML pages from markdown posts
 */

import fs from "fs/promises";
import path from "path";
import { getAllPosts } from "./utils/markdown.js";

const POSTS_PER_PAGE = 10;

async function ensureDir(dir: string) {
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (error) {
        // Directory already exists
    }
}

async function buildSite() {
    console.log("Building static site...");

    const posts = await getAllPosts();
    const publicDir = path.join(process.cwd(), "public");
    const postsDir = path.join(publicDir, "posts");

    await ensureDir(postsDir);

    // Generate individual post pages
    for (const { post } of posts) {
        const postHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${post.frontmatter.description}">
  <meta name="keywords" content="${post.frontmatter.tags.join(", ")}">
  <title>${post.frontmatter.title} | Omni-Publisher</title>
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
  <header>
    <nav>
      <a href="/">← Back to Home</a>
    </nav>
  </header>
  <main class="post-content">
    <article>
      <h1>${post.frontmatter.title}</h1>
      <div class="post-meta">
        <span class="author">By ${post.frontmatter.author}</span>
        <span class="date">${new Date(
            post.frontmatter.date
        ).toLocaleDateString()}</span>
      </div>
      <div class="tags">
        ${post.frontmatter.tags
            .map((tag) => `<span class="tag">${tag}</span>`)
            .join("")}
      </div>
      <div class="content">
        ${post.html}
      </div>
    </article>
  </main>
  <footer>
    <p>&copy; 2024 Omni-Publisher. All rights reserved.</p>
  </footer>
</body>
</html>
    `.trim();

        await fs.writeFile(
            path.join(postsDir, `${post.frontmatter.slug}.html`),
            postHtml,
            "utf-8"
        );
    }

    // Generate index page with pagination
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

    for (let page = 1; page <= totalPages; page++) {
        const startIdx = (page - 1) * POSTS_PER_PAGE;
        const endIdx = startIdx + POSTS_PER_PAGE;
        const pagePosts = posts.slice(startIdx, endIdx);

        const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Omni-Publisher - Write Once, Publish Everywhere">
  <title>Omni-Publisher | Multi-Platform Blog Publishing</title>
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
  <header>
    <h1>Omni-Publisher</h1>
    <p class="tagline">Write Once, Publish Everywhere</p>
  </header>
  <main>
    <div class="posts-grid">
      ${pagePosts
          .map(
              ({ post }) => `
        <article class="post-card">
          <h2><a href="/posts/${post.frontmatter.slug}.html">${
                  post.frontmatter.title
              }</a></h2>
          <div class="post-meta">
            <span class="date">${new Date(
                post.frontmatter.date
            ).toLocaleDateString()}</span>
          </div>
          <p class="excerpt">${post.excerpt}</p>
          <div class="tags">
            ${post.frontmatter.tags
                .slice(0, 3)
                .map((tag) => `<span class="tag">${tag}</span>`)
                .join("")}
          </div>
          <a href="/posts/${
              post.frontmatter.slug
          }.html" class="read-more">Read More →</a>
        </article>
      `
          )
          .join("")}
    </div>

    ${
        totalPages > 1
            ? `
    <div class="pagination">
      ${
          page > 1
              ? `<a href="${
                    page === 2 ? "/index.html" : `/page-${page - 1}.html`
                }">← Previous</a>`
              : ""
      }
      <span>Page ${page} of ${totalPages}</span>
      ${page < totalPages ? `<a href="/page-${page + 1}.html">Next →</a>` : ""}
    </div>
    `
            : ""
    }
  </main>
  <footer>
    <p>&copy; 2024 Omni-Publisher. All rights reserved.</p>
    <p>Built with ❤️ using TypeScript and Markdown</p>
  </footer>
</body>
</html>
    `.trim();

        const filename = page === 1 ? "index.html" : `page-${page}.html`;
        await fs.writeFile(path.join(publicDir, filename), indexHtml, "utf-8");
    }

    console.log(`✓ Built ${posts.length} post pages`);
    console.log(`✓ Built ${totalPages} index pages`);
    console.log("✓ Site build complete!");
}

buildSite().catch(console.error);
