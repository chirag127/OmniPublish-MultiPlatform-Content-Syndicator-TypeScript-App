/**
 * Blogger Adapter
 * API Documentation: https://developers.google.com/blogger/docs/3.0/using
 * Uses OAuth2 with refresh token
 */

import axios from "axios";
import { Post } from "../utils/markdown";
import { logger } from "../utils/logger";

const PLATFORM = "blogger";
const API_BASE = "https://www.googleapis.com/blogger/v3";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export interface BloggerConfig {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    blogId: string;
    mockMode?: boolean;
    mockUrl?: string;
}

async function getAccessToken(config: BloggerConfig): Promise<string> {
    const { clientId, clientSecret, refreshToken } = config;

    try {
        const response = await axios.post(TOKEN_URL, {
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        });

        return response.data.access_token;
    } catch (error: any) {
        logger.error("Failed to refresh access token", PLATFORM, undefined, {
            error: error.message,
        });
        throw error;
    }
}

export async function publishToBlogger(
    post: Post,
    config: BloggerConfig
): Promise<{ id: string; url: string }> {
    const { blogId, mockMode, mockUrl } = config;

    if (
        !config.clientId ||
        !config.clientSecret ||
        !config.refreshToken ||
        !blogId
    ) {
        throw new Error("Blogger OAuth credentials and blog ID are required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;
    const accessToken = await getAccessToken(config);

    const postData = {
        kind: "blogger#post",
        title: post.metadata.title,
        content: post.html,
        labels: post.metadata.tags,
    };

    try {
        const response = await axios.post(
            `${baseUrl}/blogs/${blogId}/posts`,
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
            id: response.data.id,
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

export async function updateOnBlogger(
    post: Post,
    postId: string,
    config: BloggerConfig
): Promise<{ id: string; url: string }> {
    const { blogId, mockMode, mockUrl } = config;

    if (
        !config.clientId ||
        !config.clientSecret ||
        !config.refreshToken ||
        !blogId
    ) {
        throw new Error("Blogger OAuth credentials and blog ID are required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;
    const accessToken = await getAccessToken(config);

    const postData = {
        kind: "blogger#post",
        title: post.metadata.title,
        content: post.html,
        labels: post.metadata.tags,
    };

    try {
        const response = await axios.put(
            `${baseUrl}/blogs/${blogId}/posts/${postId}`,
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
            id: response.data.id,
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
