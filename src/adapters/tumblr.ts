/**
 * Tumblr Adapter
 * API Documentation: https://www.tumblr.com/docs/en/api/v2
 * Uses OAuth 1.0a
 */

import axios from "axios";
import OAuth from "oauth-1.0a";
import crypto from "crypto";
import { Post } from "../utils/markdown";
import { logger } from "../utils/logger";

const PLATFORM = "tumblr";
const API_BASE = "https://api.tumblr.com/v2";

export interface TumblrConfig {
    consumerKey: string;
    consumerSecret: string;
    token: string;
    tokenSecret: string;
    blogIdentifier: string; // e.g., 'yourblog.tumblr.com'
    mockMode?: boolean;
    mockUrl?: string;
}

function createOAuthClient(config: TumblrConfig): OAuth {
    return new OAuth({
        consumer: {
            key: config.consumerKey,
            secret: config.consumerSecret,
        },
        signature_method: "HMAC-SHA1",
        hash_function(base_string, key) {
            return crypto
                .createHmac("sha1", key)
                .update(base_string)
                .digest("base64");
        },
    });
}

export async function publishToTumblr(
    post: Post,
    config: TumblrConfig
): Promise<{ id: string; url: string }> {
    const { blogIdentifier, token, tokenSecret, mockMode, mockUrl } = config;

    if (
        !config.consumerKey ||
        !config.consumerSecret ||
        !token ||
        !tokenSecret ||
        !blogIdentifier
    ) {
        throw new Error(
            "Tumblr OAuth credentials and blog identifier are required"
        );
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;
    const oauth = createOAuthClient(config);

    const requestData = {
        url: `${baseUrl}/blog/${blogIdentifier}/post`,
        method: "POST",
        data: {
            type: "text",
            title: post.metadata.title,
            body: post.html,
            tags: post.metadata.tags.join(","),
            state: "published",
        },
    };

    const authHeader = oauth.toHeader(
        oauth.authorize(requestData, {
            key: token,
            secret: tokenSecret,
        })
    );

    try {
        const response = await axios.post(requestData.url, requestData.data, {
            headers: {
                ...authHeader,
                "Content-Type": "application/json",
            },
        });

        logger.success("Published successfully", PLATFORM, post.metadata.slug);

        return {
            id: response.data.response.id.toString(),
            url: `https://${blogIdentifier}/post/${response.data.response.id}`,
        };
    } catch (error: any) {
        logger.error("Failed to publish", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}

export async function updateOnTumblr(
    post: Post,
    postId: string,
    config: TumblrConfig
): Promise<{ id: string; url: string }> {
    const { blogIdentifier, token, tokenSecret, mockMode, mockUrl } = config;

    if (
        !config.consumerKey ||
        !config.consumerSecret ||
        !token ||
        !tokenSecret ||
        !blogIdentifier
    ) {
        throw new Error(
            "Tumblr OAuth credentials and blog identifier are required"
        );
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;
    const oauth = createOAuthClient(config);

    const requestData = {
        url: `${baseUrl}/blog/${blogIdentifier}/post/edit`,
        method: "POST",
        data: {
            id: postId,
            type: "text",
            title: post.metadata.title,
            body: post.html,
            tags: post.metadata.tags.join(","),
        },
    };

    const authHeader = oauth.toHeader(
        oauth.authorize(requestData, {
            key: token,
            secret: tokenSecret,
        })
    );

    try {
        const response = await axios.post(requestData.url, requestData.data, {
            headers: {
                ...authHeader,
                "Content-Type": "application/json",
            },
        });

        logger.success("Updated successfully", PLATFORM, post.metadata.slug);

        return {
            id: postId,
            url: `https://${blogIdentifier}/post/${postId}`,
        };
    } catch (error: any) {
        logger.error("Failed to update", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}
