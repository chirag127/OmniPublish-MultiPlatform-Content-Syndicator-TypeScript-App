/**
 * WordPress.com Adapter
 * API Documentation: https://developer.wordpress.com/docs/api/
 */

import axios from "axios";
import { Post } from "../utils/markdown";
import { logger } from "../utils/logger";

const PLATFORM = "wordpress";
const API_BASE = "https://public-api.wordpress.com/rest/v1.1";

export interface WordPressConfig {
    accessToken: string;
    site: string; // e.g., 'yoursite.wordpress.com' or site ID
    mockMode?: boolean;
    mockUrl?: string;
}

export async function publishToWordPress(
    post: Post,
    config: WordPressConfig
): Promise<{ id: string; url: string }> {
    const { accessToken, site, mockMode, mockUrl } = config;

    if (!accessToken || !site) {
        throw new Error("WordPress access token and site are required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;

    const postData = {
        title: post.metadata.title,
        content: post.html,
        excerpt: post.metadata.description,
        tags: post.metadata.tags.join(","),
        status: "publish",
        format: "standard",
    };

    try {
        const response = await axios.post(
            `${baseUrl}/sites/${site}/posts/new`,
            postData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        logger.success("Published successfully", PLATFORM, post.metadata.slug);

        return {
            id: response.data.ID.toString(),
            url: response.data.URL,
        };
    } catch (error: any) {
        logger.error("Failed to publish", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}

export async function updateOnWordPress(
    post: Post,
    postId: string,
    config: WordPressConfig
): Promise<{ id: string; url: string }> {
    const { accessToken, site, mockMode, mockUrl } = config;

    if (!accessToken || !site) {
        throw new Error("WordPress access token and site are required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;

    const postData = {
        title: post.metadata.title,
        content: post.html,
        excerpt: post.metadata.description,
        tags: post.metadata.tags.join(","),
    };

    try {
        const response = await axios.post(
            `${baseUrl}/sites/${site}/posts/${postId}`,
            postData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        logger.success("Updated successfully", PLATFORM, post.metadata.slug);

        return {
            id: response.data.ID.toString(),
            url: response.data.URL,
        };
    } catch (error: any) {
        logger.error("Failed to update", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}
