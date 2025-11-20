/**
 * Wix Adapter
 * API Documentation: https://dev.wix.com/api/rest/wix-blog/blog/introduction
 */

import axios from "axios";
import { Post } from "../utils/markdown";
import { logger } from "../utils/logger";

const PLATFORM = "wix";
const API_BASE = "https://www.wixapis.com/v3";

export interface WixConfig {
    apiToken: string;
    siteId: string;
    mockMode?: boolean;
    mockUrl?: string;
}

export async function publishToWix(
    post: Post,
    config: WixConfig
): Promise<{ id: string; url: string }> {
    const { apiToken, siteId, mockMode, mockUrl } = config;

    if (!apiToken || !siteId) {
        throw new Error("Wix API token and site ID are required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;

    const postData = {
        post: {
            title: post.metadata.title,
            content: {
                html: post.html,
            },
            excerpt: post.metadata.description,
            tags: post.metadata.tags,
            status: "PUBLISHED",
        },
    };

    try {
        const response = await axios.post(`${baseUrl}/posts`, postData, {
            headers: {
                Authorization: apiToken,
                "wix-site-id": siteId,
                "Content-Type": "application/json",
            },
        });

        logger.success("Published successfully", PLATFORM, post.metadata.slug);

        return {
            id: response.data.post.id,
            url:
                response.data.post.url ||
                `https://www.wix.com/blog/${response.data.post.slug}`,
        };
    } catch (error: any) {
        logger.error("Failed to publish", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}

export async function updateOnWix(
    post: Post,
    postId: string,
    config: WixConfig
): Promise<{ id: string; url: string }> {
    const { apiToken, siteId, mockMode, mockUrl } = config;

    if (!apiToken || !siteId) {
        throw new Error("Wix API token and site ID are required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;

    const postData = {
        post: {
            title: post.metadata.title,
            content: {
                html: post.html,
            },
            excerpt: post.metadata.description,
            tags: post.metadata.tags,
        },
    };

    try {
        const response = await axios.patch(
            `${baseUrl}/posts/${postId}`,
            postData,
            {
                headers: {
                    Authorization: apiToken,
                    "wix-site-id": siteId,
                    "Content-Type": "application/json",
                },
            }
        );

        logger.success("Updated successfully", PLATFORM, post.metadata.slug);

        return {
            id: response.data.post.id,
            url:
                response.data.post.url ||
                `https://www.wix.com/blog/${response.data.post.slug}`,
        };
    } catch (error: any) {
        logger.error("Failed to update", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}
