/**
 * Wix Adapter
 * API Docs: https://dev.wix.com/api/rest/wix-blog/blog/introduction
 */

import axios from "axios";
import { logger } from "../utils/logger.js";

export interface WixConfig {
    apiToken: string;
    siteId: string;
}

export interface WixPost {
    title: string;
    content: string;
    excerpt?: string;
    tags?: string[];
    status?: "PUBLISHED" | "DRAFT";
}

export class WixAdapter {
    private token: string;
    private siteId: string;
    private baseUrl = "https://www.wixapis.com/v3";

    constructor(config: WixConfig) {
        this.token = config.apiToken;
        this.siteId = config.siteId;
    }

    async createPost(post: WixPost): Promise<{ id: string; url: string }> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/posts`,
                {
                    post: {
                        title: post.title,
                        content: {
                            html: post.content,
                        },
                        excerpt: post.excerpt,
                        tags: post.tags,
                        status: post.status || "PUBLISHED",
                    },
                },
                {
                    headers: {
                        Authorization: this.token,
                        "wix-site-id": this.siteId,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                id: response.data.post.id,
                url:
                    response.data.post.url ||
                    `https://www.wix.com/blog/${response.data.post.slug}`,
            };
        } catch (error: any) {
            logger.error("Failed to create Wix post", "wix", undefined, error);
            throw error;
        }
    }

    async updatePost(
        id: string,
        post: WixPost
    ): Promise<{ id: string; url: string }> {
        try {
            const response = await axios.patch(
                `${this.baseUrl}/posts/${id}`,
                {
                    post: {
                        title: post.title,
                        content: {
                            html: post.content,
                        },
                        excerpt: post.excerpt,
                        tags: post.tags,
                        status: post.status || "PUBLISHED",
                    },
                },
                {
                    headers: {
                        Authorization: this.token,
                        "wix-site-id": this.siteId,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                id: response.data.post.id,
                url:
                    response.data.post.url ||
                    `https://www.wix.com/blog/${response.data.post.slug}`,
            };
        } catch (error: any) {
            logger.error("Failed to update Wix post", "wix", undefined, error);
            throw error;
        }
    }
}
