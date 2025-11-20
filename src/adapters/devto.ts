/**
 * Dev.to Adapter
 * API Documentation: https://developers.forem.com/api/v1
 */

import axios from "axios";
import { Post } from "../utils/markdown";
import { logger } from "../utils/logger";

const PLATFORM = "devto";
const API_BASE = "https://dev.to/api";

export interface DevToConfig {
    apiKey: string;
    mockMode?: boolean;
    mockUrl?: string;
}

export async function publishToDevTo(
    post: Post,
    config: DevToConfig
): Promise<{ id: string; url: string }> {
    const { apiKey, mockMode, mockUrl } = config;

    if (!apiKey) {
        throw new Error("Dev.to API key is required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;

    const article = {
        article: {
            title: post.metadata.title,
            published: true,
            body_markdown: post.content,
            tags: post.metadata.tags.slice(0, 4), // Dev.to allows max 4 tags
            description: post.metadata.description,
            canonical_url: post.metadata.canonical_url || undefined,
        },
    };

    try {
        const response = await axios.post(`${baseUrl}/articles`, article, {
            headers: {
                "api-key": apiKey,
                "Content-Type": "application/json",
            },
        });

        logger.success("Published successfully", PLATFORM, post.metadata.slug);

        return {
            id: response.data.id.toString(),
            url: response.data.url,
        };
    } catch (error: any) {
        logger.error("Failed to publish", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}

export async function updateOnDevTo(
    post: Post,
    articleId: string,
    config: DevToConfig
): Promise<{ id: string; url: string }> {
    const { apiKey, mockMode, mockUrl } = config;

    if (!apiKey) {
        throw new Error("Dev.to API key is required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;

    const article = {
        article: {
            title: post.metadata.title,
            body_markdown: post.content,
            tags: post.metadata.tags.slice(0, 4),
            description: post.metadata.description,
        },
    };

    try {
        const response = await axios.put(
            `${baseUrl}/articles/${articleId}`,
            article,
            {
                headers: {
                    "api-key": apiKey,
                    "Content-Type": "application/json",
                },
            }
        );

        logger.success("Updated successfully", PLATFORM, post.metadata.slug);

        return {
            id: response.data.id.toString(),
            url: response.data.url,
        };
    } catch (error: any) {
        logger.error("Failed to update", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}
