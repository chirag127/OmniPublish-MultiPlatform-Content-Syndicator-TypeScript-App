/**
 * Micro.blog Adapter
 * API Documentation: https://help.micro.blog/t/posting-api/96
 *
 * Based on fresh API research (Nov 2024):
 * - Uses Micropub protocol (W3C standard)
 * - Endpoint: https://micro.blog/micropub
 * - Authentication: Bearer token in Authorization header
 * - Supports form-encoded or JSON format
 */

import axios from "axios";
import { Post } from "../utils/markdown";
import { logger } from "../utils/logger";

const PLATFORM = "microblog";

export interface MicroblogConfig {
    token: string;
    endpoint?: string; // Default: https://micro.blog/micropub
    mockMode?: boolean;
    mockUrl?: string;
}

export async function publishToMicroblog(
    post: Post,
    config: MicroblogConfig
): Promise<{ id: string; url: string }> {
    const {
        token,
        endpoint = "https://micro.blog/micropub",
        mockMode,
        mockUrl,
    } = config;

    if (!token) {
        throw new Error("Micro.blog token is required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : endpoint;

    // Micropub JSON format
    const postData = {
        type: ["h-entry"],
        properties: {
            name: [post.metadata.title],
            content: [post.content],
            category: post.metadata.tags,
            published: [post.metadata.date],
        },
    };

    try {
        const response = await axios.post(baseUrl, postData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        // Micropub returns the URL in the Location header
        const postUrl = response.headers.location || response.data.url;

        // Extract ID from URL (last segment)
        const postId = postUrl.split("/").pop() || postUrl;

        logger.success("Published successfully", PLATFORM, post.metadata.slug);

        return {
            id: postId,
            url: postUrl,
        };
    } catch (error: any) {
        logger.error("Failed to publish", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}

export async function updateOnMicroblog(
    post: Post,
    postUrl: string,
    config: MicroblogConfig
): Promise<{ id: string; url: string }> {
    const {
        token,
        endpoint = "https://micro.blog/micropub",
        mockMode,
        mockUrl,
    } = config;

    if (!token) {
        throw new Error("Micro.blog token is required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : endpoint;

    // Micropub update format
    const updateData = {
        action: "update",
        url: postUrl,
        replace: {
            name: [post.metadata.title],
            content: [post.content],
            category: post.metadata.tags,
        },
    };

    try {
        await axios.post(baseUrl, updateData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        logger.success("Updated successfully", PLATFORM, post.metadata.slug);

        const postId = postUrl.split("/").pop() || postUrl;

        return {
            id: postId,
            url: postUrl,
        };
    } catch (error: any) {
        logger.error("Failed to update", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}
