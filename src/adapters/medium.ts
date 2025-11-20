/**
 * Medium Adapter
 * API Documentation: https://github.com/Medium/medium-api-docs
 */

import axios from "axios";
import { Post } from "../utils/markdown";
import { logger } from "../utils/logger";

const PLATFORM = "medium";
const API_BASE = "https://api.medium.com/v1";

export interface MediumConfig {
    integrationToken: string;
    mockMode?: boolean;
    mockUrl?: string;
}

export async function publishToMedium(
    post: Post,
    config: MediumConfig
): Promise<{ id: string; url: string }> {
    const { integrationToken, mockMode, mockUrl } = config;

    if (!integrationToken) {
        throw new Error("Medium integration token is required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;

    try {
        // First, get the user ID
        const userResponse = await axios.get(`${baseUrl}/me`, {
            headers: {
                Authorization: `Bearer ${integrationToken}`,
                "Content-Type": "application/json",
            },
        });

        const userId = userResponse.data.data.id;

        // Create the post
        const postData = {
            title: post.metadata.title,
            contentFormat: "markdown",
            content: post.content,
            tags: post.metadata.tags.slice(0, 5), // Medium allows max 5 tags
            publishStatus: "public",
            canonicalUrl: post.metadata.canonical_url || undefined,
        };

        const response = await axios.post(
            `${baseUrl}/users/${userId}/posts`,
            postData,
            {
                headers: {
                    Authorization: `Bearer ${integrationToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        logger.success("Published successfully", PLATFORM, post.metadata.slug);

        return {
            id: response.data.data.id,
            url: response.data.data.url,
        };
    } catch (error: any) {
        logger.error("Failed to publish", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}

// Note: Medium API doesn't support updating posts
// Once published, posts can only be edited through the Medium website
