/**
 * Markdown parsing and HTML conversion utilities
 */

import { marked } from "marked";
import matter from "gray-matter";
import fs from "fs/promises";
import path from "path";

export interface PostFrontmatter {
    title: string;
    date: string;
    description: string;
    tags: string[];
    slug: string;
    author: string;
    [key: string]: any;
}

export interface ParsedPost {
    frontmatter: PostFrontmatter;
    content: string;
    html: string;
    excerpt: string;
}

/**
 * Parse markdown file with frontmatter
 */
export async function parseMarkdownFile(filePath: string): Promise<ParsedPost> {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const html = marked.parse(content) as string;
    const excerpt =
        content.substring(0, 200).replace(/[#*`]/g, "").trim() + "...";

    return {
        frontmatter: data as PostFrontmatter,
        content,
        html,
        excerpt,
    };
}

/**
 * Get all markdown posts from content directory
 */
export async function getAllPosts(): Promise<
    { filePath: string; post: ParsedPost }[]
> {
    const postsDir = path.join(process.cwd(), "content", "posts");
    const files = await fs.readdir(postsDir);
    const markdownFiles = files.filter((f) => f.endsWith(".md"));

    const posts = await Promise.all(
        markdownFiles.map(async (file) => {
            const filePath = path.join(postsDir, file);
            const post = await parseMarkdownFile(filePath);
            return { filePath, post };
        })
    );

    // Sort by date descending
    return posts.sort(
        (a, b) =>
            new Date(b.post.frontmatter.date).getTime() -
            new Date(a.post.frontmatter.date).getTime()
    );
}

/**
 * Convert markdown to plain text (strip formatting)
 */
export function markdownToPlainText(markdown: string): string {
    return markdown
        .replace(/#{1,6}\s/g, "") // Remove headers
        .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold
        .replace(/\*(.+?)\*/g, "$1") // Remove italic
        .replace(/\[(.+?)\]\(.+?\)/g, "$1") // Remove links
        .replace(/`(.+?)`/g, "$1") // Remove code
        .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
        .trim();
}

/**
 * Extract first image from markdown
 */
export function extractFirstImage(markdown: string): string | null {
    const imageRegex = /!\[.*?\]\((.*?)\)/;
    const match = markdown.match(imageRegex);
    return match ? match[1] : null;
}
