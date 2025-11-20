#!/usr/bin/env node
/**
 * Multi-platform content publisher with idempotency, retries, and concurrency control
 */

import * as dotenv from "dotenv";
import { getAllPosts, Post } from "./utils/markdown";
import { logger } from "./utils/logger";
import {
    loadState,
    saveState,
    isPublished,
    getPlatformPost,
    recordPublish,
    StateMap,
} from "./utils/state";

// Import all adapters
import { publishToDevTo, updateOnDevTo } from "./adapters/devto";
import { publishToHashnode, updateOnHashnode } from "./adapters/hashnode";
import { publishToMedium } from "./adapters/medium";
import { publishToWordPress, updateOnWordPress } from "./adapters/wordpress";
import { publishToBlogger, updateOnBlogger } from "./adapters/blogger";
import { publishToTumblr, updateOnTumblr } from "./adapters/tumblr";
import { publishToWix, updateOnWix } from "./adapters/wix";
import { publishToWriteAs, updateOnWriteAs } from "./adapters/writeas";
import { publishToTelegraph, updateOnTelegraph } from "./adapters/telegraph";
import { publishToMicroblog, updateOnMicroblog } from "./adapters/microblog";
import { publishToSubstack } from "./adapters/substack";

dotenv.config();

// CLI flags
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const MOCK_MODE = args.includes("--mock");
const CONCURRENCY = parseInt(
    args.find((arg) => arg.startsWith("--concurrency="))?.split("=")[1] ||
        process.env.PUBLISH_CONCURRENCY ||
        "2"
);

interface PlatformAdapter {
    name: string;
    publish: (post: Post, config: any) => Promise<{ id: string; url: string }>;
    update?: (
        post: Post,
        postId: string,
        config: any
    ) => Promise<{ id: string; url: string }>;
    config: any;
    enabled: boolean;
}

/**
 * Initialize platform adapters with environment variables
 */
function initializePlatforms(): PlatformAdapter[] {
    const mockUrl = process.env.MOCK_SERVER_URL;

    return [
        {
            name: "devto",
            publish: publishToDevTo,
            update: updateOnDevTo,
            config: {
                apiKey: process.env.DEVTO_API_KEY,
                mockMode: MOCK_MODE,
                mockUrl,
            },
            enabled: !!process.env.DEVTO_API_KEY,
        },
        {
            name: "hashnode",
            publish: publishToHashnode,
            update: updateOnHashnode,
            config: {
                token: process.env.HASHNODE_TOKEN,
                publicationId: process.env.HASHNODE_PUBLICATION_ID,
                mockMode: MOCK_MODE,
                mockUrl,
            },
            enabled: !!(
                process.env.HASHNODE_TOKEN &&
                process.env.HASHNODE_PUBLICATION_ID
            ),
        },
        {
            name: "medium",
            publish: publishToMedium,
            config: {
                integrationToken: process.env.MEDIUM_INTEGRATION_TOKEN,
                mockMode: MOCK_MODE,
                mockUrl,
            },
            enabled: !!process.env.MEDIUM_INTEGRATION_TOKEN,
        },
        {
            name: "wordpress",
            publish: publishToWordPress,
            update: updateOnWordPress,
            config: {
                accessToken: process.env.WP_ACCESS_TOKEN,
                site: process.env.WP_SITE,
                mockMode: MOCK_MODE,
                mockUrl,
            },
            enabled: !!(process.env.WP_ACCESS_TOKEN && process.env.WP_SITE),
        },
        {
            name: "blogger",
            publish: publishToBlogger,
            update: updateOnBlogger,
            config: {
                clientId: process.env.BLOGGER_CLIENT_ID,
                clientSecret: process.env.BLOGGER_CLIENT_SECRET,
                refreshToken: process.env.BLOGGER_REFRESH_TOKEN,
                blogId: process.env.BLOGGER_BLOG_ID,
                mockMode: MOCK_MODE,
                mockUrl,
            },
            enabled: !!(
                process.env.BLOGGER_CLIENT_ID &&
                process.env.BLOGGER_CLIENT_SECRET &&
                process.env.BLOGGER_REFRESH_TOKEN &&
                process.env.BLOGGER_BLOG_ID
            ),
        },
        {
            name: "tumblr",
            publish: publishToTumblr,
            update: updateOnTumblr,
            config: {
                consumerKey: process.env.TUMBLR_CONSUMER_KEY,
                consumerSecret: process.env.TUMBLR_CONSUMER_SECRET,
                token: process.env.TUMBLR_TOKEN,
                tokenSecret: process.env.TUMBLR_TOKEN_SECRET,
                blogIdentifier: process.env.TUMBLR_BLOG_IDENTIFIER,
                mockMode: MOCK_MODE,
                mockUrl,
            },
            enabled: !!(
                process.env.TUMBLR_CONSUMER_KEY &&
                process.env.TUMBLR_CONSUMER_SECRET &&
                process.env.TUMBLR_TOKEN &&
                process.env.TUMBLR_TOKEN_SECRET &&
                process.env.TUMBLR_BLOG_IDENTIFIER
            ),
        },
        {
            name: "wix",
            publish: publishToWix,
            update: updateOnWix,
            config: {
                apiToken: process.env.WIX_API_TOKEN,
                siteId: process.env.WIX_SITE_ID,
                mockMode: MOCK_MODE,
                mockUrl,
            },
            enabled: !!(process.env.WIX_API_TOKEN && process.env.WIX_SITE_ID),
        },
        {
            name: "writeas",
            publish: publishToWriteAs,
            update: updateOnWriteAs,
            config: {
                apiToken: process.env.WRITEAS_API_TOKEN,
                mockMode: MOCK_MODE,
                mockUrl,
            },
            enabled: !!process.env.WRITEAS_API_TOKEN,
        },
        {
            name: "telegraph",
            publish: publishToTelegraph,
            update: updateOnTelegraph,
            config: {
                accessToken: process.env.TELEGRAPH_ACCESS_TOKEN,
                mockMode: MOCK_MODE,
                mockUrl,
            },
            enabled: true, // Telegraph can work without token (creates account automatically)
        },
        {
            name: "microblog",
            publish: publishToMicroblog,
            update: updateOnMicroblog,
            config: {
                token: process.env.MICROBLOG_TOKEN,
                mockMode: process.env.MICROBLOG_ENDPOINT,
                mockMode: MOCK_MODE,
                mockUrl,
            },
            enabled: !!process.env.MICROBLOG_TOKEN,
        },
        {
            name: "substack",
            publish: publishToSubstack,
            config: {
                apiToken: process.env.SUBSTACK_API_TOKEN,
                publicationId: process.env.SUBSTACK_PUBLICATION_ID,
                mockMode: MOCK_MODE,
                mockUrl,
            },
            enabled: false, // Disabled by default - unofficial API
        },
    ];
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
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
 * Publish a single post to a single platform
 */
async function publishPostToPlatform(
    post: Post,
    platform: PlatformAdapter,
    state: StateMap
): Promise<void> {
    const slug = post.metadata.slug;

    try {
        // Check if already published
        const existingPost = getPlatformPost(slug, platform.name, state);

        if (existingPost && platform.update) {
            // Update existing post
            logger.info(`Updating existing post`, platform.name, slug);

            if (DRY_RUN) {
                logger.info("DRY RUN: Would update post", platform.name, slug);
                return;
            }

            const result = await retryWithBackoff(() =>
                platform.update!(post, existingPost.id, platform.config)
            );

            recordPublish(slug, platform.name, result.id, result.url, state);
        } else if (existingPost) {
            // Platform doesn't support updates
            logger.info(
                `Post already published (no update support)`,
                platform.name,
                slug
            );
        } else {
            // Create new post
            logger.info(`Publishing new post`, platform.name, slug);

            if (DRY_RUN) {
                logger.info("DRY RUN: Would publish post", platform.name, slug);
                return;
            }

            const result = await retryWithBackoff(() =>
                platform.publish(post, platform.config)
            );

            recordPublish(slug, platform.name, result.id, result.url, state);
        }
    } catch (error: any) {
        logger.error(`Failed to publish after retries`, platform.name, slug, {
            error: error.message,
        });
        throw error;
    }
}

/**
 * Process posts with concurrency control
 */
async function publishWithConcurrency(
    posts: Post[],
    platforms: PlatformAdapter[],
    state: StateMap,
    concurrency: number
): Promise<void> {
    const tasks: Array<() => Promise<void>> = [];

    // Create all tasks
    for (const post of posts) {
        for (const platform of platforms) {
            if (!platform.enabled) {
                logger.warn(
                    `Platform disabled (missing credentials)`,
                    platform.name
                );
                continue;
            }

            tasks.push(async () => {
                try {
                    await publishPostToPlatform(post, platform, state);
                } catch (error) {
                    // Error already logged, continue with other tasks
                }
            });
        }
    }

    // Execute tasks with concurrency limit
    const executing: Promise<void>[] = [];

    for (const task of tasks) {
        const promise = task().then(() => {
            executing.splice(executing.indexOf(promise), 1);
        });

        executing.push(promise);

        if (executing.length >= concurrency) {
            await Promise.race(executing);
        }
    }

    await Promise.all(executing);
}

/**
 * Main execution
 */
async function main() {
    logger.info("Starting Omni-Publisher");
    logger.info(`Mode: ${DRY_RUN ? "DRY RUN" : MOCK_MODE ? "MOCK" : "LIVE"}`);
    logger.info(`Concurrency: ${CONCURRENCY}`);

    // Load posts
    const posts = getAllPosts();
    logger.info(`Found ${posts.length} posts`);

    if (posts.length === 0) {
        logger.warn("No posts found in content/posts directory");
        return;
    }

    // Initialize platforms
    const platforms = initializePlatforms();
    const enabledPlatforms = platforms.filter((p) => p.enabled);

    logger.info(
        `Enabled platforms: ${enabledPlatforms.map((p) => p.name).join(", ")}`
    );

    if (enabledPlatforms.length === 0) {
        logger.warn(
            "No platforms enabled. Please configure API keys in .env file"
        );
        return;
    }

    // Load state
    const state = loadState();

    // Publish posts
    await publishWithConcurrency(posts, enabledPlatforms, state, CONCURRENCY);

    // Save state
    if (!DRY_RUN) {
        saveState(state);
        logger.success("State saved to .postmap.json");
    }

    // Summary
    const totalPosts = posts.length;
    const totalPlatforms = enabledPlatforms.length;
    const totalOperations = totalPosts * totalPlatforms;

    logger.success(`Publishing complete!`);
    logger.info(
        `Processed ${totalPosts} posts across ${totalPlatforms} platforms (${totalOperations} operations)`
    );
    logger.info(`Log file: ${logger.getLogFilePath()}`);
}

// Run
main().catch((error) => {
    logger.error("Fatal error", undefined, undefined, { error: error.message });
    process.exit(1);
});
