#!/usr/bin/env node
/**
 * Omni-Publisher - Main Publishing Engine
 * Publishes markdown posts to multiple platforms with idempotency and retry logic
 */

import "dotenv/config";
import { getAllPosts } from "./utils/markdown.js";
import {
    loadState,
    saveState,
    isPublished,
    getPublishedId,
    recordPublication,
} from "./utils/state.js";
import { logger } from "./utils/logger.js";

// Import all adapters
import { DevToAdapter } from "./adapters/devto.js";
import { HashnodeAdapter } from "./adapters/hashnode.js";
import { MediumAdapter } from "./adapters/medium.js";
import { WordPressAdapter } from "./adapters/wordpress.js";
import { BloggerAdapter } from "./adapters/blogger.js";
import { TumblrAdapter } from "./adapters/tumblr.js";
import { WixAdapter } from "./adapters/wix.js";
import { WriteAsAdapter } from "./adapters/writeas.js";
import { TelegraphAdapter } from "./adapters/telegraph.js";
import { MicroblogAdapter } from "./adapters/microblog.js";
import { SubstackAdapter } from "./adapters/substack.js";

interface PublishOptions {
    dryRun: boolean;
    mock: boolean;
    concurrency: number;
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxRetries - 1) throw error;

            const delay = baseDelay * Math.pow(2, attempt);
            logger.warn(
                `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw new Error("Max retries exceeded");
}

/**
 * Initialize platform adapters based on environment variables
 */
function initializeAdapters() {
    const adapters: { [key: string]: any } = {};

    // Dev.to
    if (process.env.DEVTO_API_KEY) {
        adapters.devto = new DevToAdapter({
            apiKey: process.env.DEVTO_API_KEY,
        });
    }

    // Hashnode
    if (process.env.HASHNODE_TOKEN && process.env.HASHNODE_PUBLICATION_ID) {
        adapters.hashnode = new HashnodeAdapter({
            token: process.env.HASHNODE_TOKEN,
            publicationId: process.env.HASHNODE_PUBLICATION_ID,
        });
    }

    // Medium
    if (process.env.MEDIUM_INTEGRATION_TOKEN) {
        adapters.medium = new MediumAdapter({
            integrationToken: process.env.MEDIUM_INTEGRATION_TOKEN,
        });
    }

    // WordPress
    if (process.env.WP_ACCESS_TOKEN && process.env.WP_SITE) {
        adapters.wordpress = new WordPressAdapter({
            accessToken: process.env.WP_ACCESS_TOKEN,
            site: process.env.WP_SITE,
        });
    }

    // Blogger
    if (
        process.env.BLOGGER_CLIENT_ID &&
        process.env.BLOGGER_CLIENT_SECRET &&
        process.env.BLOGGER_REFRESH_TOKEN &&
        process.env.BLOGGER_BLOG_ID
    ) {
        adapters.blogger = new BloggerAdapter({
            clientId: process.env.BLOGGER_CLIENT_ID,
            clientSecret: process.env.BLOGGER_CLIENT_SECRET,
            refreshToken: process.env.BLOGGER_REFRESH_TOKEN,
            blogId: process.env.BLOGGER_BLOG_ID,
        });
    }

    // Tumblr
    if (
        process.env.TUMBLR_CONSUMER_KEY &&
        process.env.TUMBLR_CONSUMER_SECRET &&
        process.env.TUMBLR_TOKEN &&
        process.env.TUMBLR_TOKEN_SECRET &&
        process.env.TUMBLR_BLOG_IDENTIFIER
    ) {
        adapters.tumblr = new TumblrAdapter({
            consumerKey: process.env.TUMBLR_CONSUMER_KEY,
            consumerSecret: process.env.TUMBLR_CONSUMER_SECRET,
            token: process.env.TUMBLR_TOKEN,
            tokenSecret: process.env.TUMBLR_TOKEN_SECRET,
            blogIdentifier: process.env.TUMBLR_BLOG_IDENTIFIER,
        });
    }

    // Wix
    if (process.env.WIX_API_TOKEN && process.env.WIX_SITE_ID) {
        adapters.wix = new WixAdapter({
            apiToken: process.env.WIX_API_TOKEN,
            siteId: process.env.WIX_SITE_ID,
        });
    }

    // Write.as
    if (process.env.WRITEAS_API_TOKEN) {
        adapters.writeas = new WriteAsAdapter({
            apiToken: process.env.WRITEAS_API_TOKEN,
        });
    }

    // Telegraph
    if (process.env.TELEGRAPH_ACCESS_TOKEN) {
        adapters.telegraph = new TelegraphAdapter({
            accessToken: process.env.TELEGRAPH_ACCESS_TOKEN,
        });
    }

    // Micro.blog
    if (process.env.MICROBLOG_TOKEN) {
        adapters.microblog = new MicroblogAdapter({
            token: process.env.MICROBLOG_TOKEN,
            endpoint: process.env.MICROBLOG_ENDPOINT,
        });
    }

    // Substack (optional/unofficial)
    if (process.env.SUBSTACK_API_TOKEN) {
        adapters.substack = new SubstackAdapter({
            apiToken: process.env.SUBSTACK_API_TOKEN,
            publicationId: process.env.SUBSTACK_PUBLICATION_ID,
        });
    }

    return adapters;
}

/**
 * Publish a single post to a single platform
 */
async function publishToPlatform(
    platform: string,
    adapter: any,
    post: any,
    state: any,
    options: PublishOptions
): Promise<void> {
    const slug = post.frontmatter.slug;

    try {
        if (options.dryRun) {
            logger.info(
                `[DRY RUN] Would publish to ${platform}`,
                platform,
                slug
            );
            return;
        }

        const alreadyPublished = isPublished(state, slug, platform);
        const existingId = getPublishedId(state, slug, platform);

        let result: { id: string; url: string };

        if (alreadyPublished && existingId) {
            logger.info(
                `Updating existing post on ${platform}`,
                platform,
                slug
            );

            // Platform-specific update logic
            if (platform === "devto") {
                result = await retryWithBackoff(() =>
                    adapter.updateArticle(existingId, {
                        title: post.frontmatter.title,
                        body_markdown: post.content,
                        published: true,
                        tags: post.frontmatter.tags?.slice(0, 4),
                        description: post.frontmatter.description,
                    })
                );
            } else if (platform === "hashnode") {
                result = await retryWithBackoff(() =>
                    adapter.updatePost(existingId, {
                        title: post.frontmatter.title,
                        contentMarkdown: post.content,
                        tags: post.frontmatter.tags,
                        subtitle: post.frontmatter.description,
                    })
                );
            } else if (platform === "medium") {
                // Medium doesn't support updates, create new
                result = await retryWithBackoff(() =>
                    adapter.createPost({
                        title: post.frontmatter.title,
                        contentFormat: "markdown",
                        content: post.content,
                        tags: post.frontmatter.tags?.slice(0, 5),
                    })
                );
            } else if (platform === "wordpress") {
                result = await retryWithBackoff(() =>
                    adapter.updatePost(existingId, {
                        title: post.frontmatter.title,
                        content: post.html,
                        status: "publish",
                        tags: post.frontmatter.tags,
                    })
                );
            } else if (platform === "blogger") {
                result = await retryWithBackoff(() =>
                    adapter.updatePost(existingId, {
                        title: post.frontmatter.title,
                        content: post.html,
                        labels: post.frontmatter.tags,
                    })
                );
            } else if (platform === "tumblr") {
                result = await retryWithBackoff(() =>
                    adapter.updatePost(existingId, {
                        title: post.frontmatter.title,
                        body: post.html,
                        tags: post.frontmatter.tags,
                        state: "published",
                    })
                );
            } else if (platform === "wix") {
                result = await retryWithBackoff(() =>
                    adapter.updatePost(existingId, {
                        title: post.frontmatter.title,
                        content: post.html,
                        excerpt: post.frontmatter.description,
                        tags: post.frontmatter.tags,
                        status: "PUBLISHED",
                    })
                );
            } else if (platform === "writeas") {
                result = await retryWithBackoff(() =>
                    adapter.updatePost(existingId, {
                        title: post.frontmatter.title,
                        body: post.content,
                    })
                );
            } else if (platform === "telegraph") {
                result = await retryWithBackoff(() =>
                    adapter.updatePage(existingId, {
                        title: post.frontmatter.title,
                        author_name: post.frontmatter.author,
                        content: [{ tag: "p", children: [post.html] }],
                    })
                );
            } else if (platform === "microblog") {
                result = await retryWithBackoff(() =>
                    adapter.updatePost(state[slug].platforms[platform].url, {
                        name: post.frontmatter.title,
                        content: post.content,
                        category: post.frontmatter.tags,
                    })
                );
            } else {
                throw new Error(`Update not implemented for ${platform}`);
            }
        } else {
            logger.info(`Creating new post on ${platform}`, platform, slug);

            // Platform-specific create logic
            if (platform === "devto") {
                result = await retryWithBackoff(() =>
                    adapter.createArticle({
                        title: post.frontmatter.title,
                        body_markdown: post.content,
                        published: true,
                        tags: post.frontmatter.tags?.slice(0, 4),
                        description: post.frontmatter.description,
                    })
                );
            } else if (platform === "hashnode") {
                result = await retryWithBackoff(() =>
                    adapter.createPost({
                        title: post.frontmatter.title,
                        contentMarkdown: post.content,
                        tags: post.frontmatter.tags,
                        subtitle: post.frontmatter.description,
                    })
                );
            } else if (platform === "medium") {
                result = await retryWithBackoff(() =>
                    adapter.createPost({
                        title: post.frontmatter.title,
                        contentFormat: "markdown",
                        content: post.content,
                        tags: post.frontmatter.tags?.slice(0, 5),
                    })
                );
            } else if (platform === "wordpress") {
                result = await retryWithBackoff(() =>
                    adapter.createPost({
                        title: post.frontmatter.title,
                        content: post.html,
                        status: "publish",
                        tags: post.frontmatter.tags,
                    })
                );
            } else if (platform === "blogger") {
                result = await retryWithBackoff(() =>
                    adapter.createPost({
                        title: post.frontmatter.title,
                        content: post.html,
                        labels: post.frontmatter.tags,
                    })
                );
            } else if (platform === "tumblr") {
                result = await retryWithBackoff(() =>
                    adapter.createPost({
                        title: post.frontmatter.title,
                        body: post.html,
                        tags: post.frontmatter.tags,
                        state: "published",
                    })
                );
            } else if (platform === "wix") {
                result = await retryWithBackoff(() =>
                    adapter.createPost({
                        title: post.frontmatter.title,
                        content: post.html,
                        excerpt: post.frontmatter.description,
                        tags: post.frontmatter.tags,
                        status: "PUBLISHED",
                    })
                );
            } else if (platform === "writeas") {
                result = await retryWithBackoff(() =>
                    adapter.createPost({
                        title: post.frontmatter.title,
                        body: post.content,
                    })
                );
            } else if (platform === "telegraph") {
                result = await retryWithBackoff(() =>
                    adapter.createPage({
                        title: post.frontmatter.title,
                        author_name: post.frontmatter.author,
                        content: [{ tag: "p", children: [post.html] }],
                    })
                );
            } else if (platform === "microblog") {
                result = await retryWithBackoff(() =>
                    adapter.createPost({
                        name: post.frontmatter.title,
                        content: post.content,
                        category: post.frontmatter.tags,
                    })
                );
            } else if (platform === "substack") {
                result = await retryWithBackoff(() =>
                    adapter.createPost({
                        title: post.frontmatter.title,
                        subtitle: post.frontmatter.description,
                        body: post.html,
                        status: "published",
                    })
                );
            } else {
                throw new Error(`Create not implemented for ${platform}`);
            }
        }

        recordPublication(state, slug, platform, result.id, result.url);
        logger.success(`Published to ${platform}`, platform, slug, {
            url: result.url,
        });
    } catch (error: any) {
        logger.error(`Failed to publish to ${platform}`, platform, slug, error);
    }
}

/**
 * Publish with concurrency control
 */
async function publishWithConcurrency<T>(
    items: T[],
    concurrency: number,
    fn: (item: T) => Promise<void>
): Promise<void> {
    const queue = [...items];
    const workers: Promise<void>[] = [];

    for (let i = 0; i < Math.min(concurrency, items.length); i++) {
        workers.push(
            (async () => {
                while (queue.length > 0) {
                    const item = queue.shift();
                    if (item) await fn(item);
                }
            })()
        );
    }

    await Promise.all(workers);
}

/**
 * Main publish function
 */
async function main() {
    const args = process.argv.slice(2);
    const options: PublishOptions = {
        dryRun: args.includes("--dry-run"),
        mock: process.env.MOCK_MODE === "true",
        concurrency: parseInt(process.env.PUBLISH_CONCURRENCY || "2"),
    };

    logger.info("Starting Omni-Publisher", undefined, undefined, { options });

    // Load state
    const state = await loadState();

    // Initialize adapters
    const adapters = initializeAdapters();
    const platformNames = Object.keys(adapters);

    if (platformNames.length === 0) {
        logger.warn(
            "No platform credentials configured. Skipping all platforms."
        );
        return;
    }

    logger.info(
        `Initialized ${platformNames.length} platforms`,
        undefined,
        undefined,
        {
            platforms: platformNames,
        }
    );

    // Get all posts
    const posts = await getAllPosts();
    logger.info(`Found ${posts.length} posts to publish`);

    // Publish to all platforms
    for (const { post } of posts) {
        const slug = post.frontmatter.slug;
        logger.info(
            `Processing post: ${post.frontmatter.title}`,
            undefined,
            slug
        );

        // Publish to each platform with concurrency control
        await publishWithConcurrency(
            platformNames,
            options.concurrency,
            async (platform) => {
                await publishToPlatform(
                    platform,
                    adapters[platform],
                    post,
                    state,
                    options
                );
            }
        );
    }

    // Save state
    if (!options.dryRun) {
        await saveState(state);
        logger.info("State saved to .postmap.json");
    }

    // Print summary
    const summary = logger.getSummary();
    console.log("\n=== PUBLISH SUMMARY ===");
    console.log(`Total operations: ${summary.total}`);
    console.log(`Successful: ${summary.success}`);
    console.log(`Errors: ${summary.errors}`);
    console.log(`Warnings: ${summary.warnings}`);
}

main().catch((error) => {
    logger.error("Fatal error", undefined, undefined, error);
    process.exit(1);
});
