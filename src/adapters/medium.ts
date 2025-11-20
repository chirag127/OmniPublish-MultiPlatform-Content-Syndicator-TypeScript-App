/**
 * Medium Adapter
 * API Docs: https://github.com/Medium/medium-api-docs
 */

import axios from "axios";
import { logger } from "../utils/logger.js";

export interface MediumConfig {
    integrationToken: string;
}

export interface MediumPost {
    title: string;
    contentFormat: "html" | "markdown";
    content: string;
    tags?: string[];
    canonicalUrl?: string;
    publishStatus?: "public" | "draft" | "unlisted";
}

export class MediumAdapter {
    private token: string;
    private baseUrl = "https://api.medium.com/v1";
    private userId: string | null = null;

    constructor(config: MediumConfig) {
        this.token = config.integrationToken;
    }

    private async getUserId(): Promise<string> {
        if (this.userId) return this.userId;

        try {
            const response = await axios.get(`${this.baseUrl}/me`, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                },
            });

            this.userId = response.data.data.id;
            return this.userId!;
        } catch (error: any) {
            logger.error(
                "Failed to get Medium user ID",
                "medium",
                undefined,
                error
            );
            throw error;
        }
    }

    async createPost(post: MediumPost): Promise<{ id: string; url: string }> {
        try {
            const userId = await this.getUserId();

            const response = await axios.post(
                `${this.baseUrl}/users/${userId}/posts`,
                {
                    title: post.title,
                    contentFormat: post.contentFormat,
                    content: post.content,
                    tags: post.tags,
                    canonicalUrl: post.canonicalUrl,
                    publishStatus: post.publishStatus || "public",
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                id: response.data.data.id,
                url: response.data.data.url,
            };
        } catch (error: any) {
            logger.error(
                "Failed to create Medium post",
                "medium",
                undefined,
                error
            );
            throw error;
        }
    }

    // Note: Medium API doesn't support updating posts
    async updatePost(
        id: string,
        post: MediumPost
    ): Promise<{ id: string; url: string }> {
        logger.warn(
            "Medium API does not support updating posts, creating new post instead",
            "medium"
        );
        return this.createPost(post);
    }
}
