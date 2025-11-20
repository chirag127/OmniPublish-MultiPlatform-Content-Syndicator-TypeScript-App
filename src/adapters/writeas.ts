/**
 * Write.as Adapter
 * API Documentation: https://developers.write.as/docs/api/
 *
 * Based on fresh API research (Nov 2024):
 * - Endpoint: https://write.as/api/posts
 * - Authentication: Bearer token in Authorization header
 * - Supports markdown content
 */

import axios from "axios";
import { Post } from "../utils/markdown";
import { logger } from "../utils/logger";

const PLATFORM = "writeas";
const API_BASE = "https://write.as/api";

export interface WriteAsConfig {
    apiToken: string;
    mockMode?: boolean;
    mockUrl?: string;
}

export async function publishToWriteAs(
    post: Post,
    config: WriteAsConfig
): Promise<{ id: string; url: string }> {
    const { apiToken, mockMode, mockUrl } = config;

    if (!apiToken) {
        throw new Error("Write.as API token is required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;

    const postData = {
        body: post.content,
        title: post.metadata.title,
        font: "norm", // Options: 'norm', 'sans', 'mono', 'wrap'
        lang: "en",
    };

    try {
        const response = await axios.post(`${baseUrl}/posts`, postData, {
            headers: {
                Authorization: `Token ${apiToken}`,
                "Content-Type": "application/json",
            },
        });

        logger.success("Published successfully", PLATFORM, post.metadata.slug);

        // Write.as returns the post data with id and slug
        const postId = response.data.data.id;
        const postSlug = response.data.data.slug;

        return {
            id: postId,
            url: `https://write.as/${postSlug}`,
        };
    } catch (error: any) {
        logger.error("Failed to publish", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}

export async function updateOnWriteAs(
    post: Post,
    postId: string,
    config: WriteAsConfig
): Promise<{ id: string; url: string }> {
    const { apiToken, mockMode, mockUrl } = config;

    if (!apiToken) {
        throw new Error("Write.as API token is required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;

    const postData = {
        body: post.content,
        title: post.metadata.title,
        font: "norm",
    };

    try {
        const response = await axios.post(
            `${baseUrl}/posts/${postId}`,
            postData,
            {
                headers: {
                    Authorization: `Token ${apiToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        logger.success("Updated successfully", PLATFORM, post.metadata.slug);

        const postSlug = response.data.data.slug;

        return {
            id: postId,
            url: `https://write.as/${postSlug}`,
        };
    } catch (error: any) {
        logger.error("Failed to update", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}
