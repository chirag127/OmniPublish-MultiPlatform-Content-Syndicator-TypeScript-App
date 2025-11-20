/**
 * WordPress.com Adapter
 * API Docs: https://developer.wordpress.com/docs/api/
 */

import axios from "axios";
import { logger } from "../utils/logger.js";

export interface WordPressConfig {
    accessToken: string;
    site: string;
}

export interface WordPressPost {
    title: string;
    content: string;
    status?: "publish" | "draft";
    tags?: string[];
    categories?: string[];
}

export class WordPressAdapter {
    private token: string;
    private site: string;
    private baseUrl = "https://public-api.wordpress.com/rest/v1.1";

    constructor(config: WordPressConfig) {
        this.token = config.accessToken;
        this.site = config.site;
    }

    async createPost(
        post: WordPressPost
    ): Promise<{ id: string; url: string }> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/sites/${this.site}/posts/new`,
                {
                    title: post.title,
                    content: post.content,
                    status: post.status || "publish",
                    tags: post.tags?.join(","),
                    categories: post.categories,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                id: response.data.ID.toString(),
                url: response.data.URL,
            };
        } catch (error: any) {
            logger.error(
                "Failed to create WordPress post",
                "wordpress",
                undefined,
                error
            );
            throw error;
        }
    }

    async updatePost(
        id: string,
        post: WordPressPost
    ): Promise<{ id: string; url: string }> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/sites/${this.site}/posts/${id}`,
                {
                    title: post.title,
                    content: post.content,
                    status: post.status || "publish",
                    tags: post.tags?.join(","),
                    categories: post.categories,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                id: response.data.ID.toString(),
                url: response.data.URL,
            };
        } catch (error: any) {
            logger.error(
                "Failed to update WordPress post",
                "wordpress",
                undefined,
                error
            );
            throw error;
        }
    }
}
