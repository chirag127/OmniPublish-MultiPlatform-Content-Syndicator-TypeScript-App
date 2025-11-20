/**
 * Blogger Adapter
 * API Docs: https://developers.google.com/blogger/docs/3.0/using
 */

import axios from "axios";
import { logger } from "../utils/logger.js";

export interface BloggerConfig {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    blogId: string;
}

export interface BloggerPost {
    title: string;
    content: string;
    labels?: string[];
}

export class BloggerAdapter {
    private config: BloggerConfig;
    private baseUrl = "https://www.googleapis.com/blogger/v3";
    private accessToken: string | null = null;

    constructor(config: BloggerConfig) {
        this.config = config;
    }

    private async getAccessToken(): Promise<string> {
        if (this.accessToken) return this.accessToken;

        try {
            const response = await axios.post(
                "https://oauth2.googleapis.com/token",
                {
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    refresh_token: this.config.refreshToken,
                    grant_type: "refresh_token",
                }
            );

            this.accessToken = response.data.access_token;
            return this.accessToken!;
        } catch (error: any) {
            logger.error(
                "Failed to get Blogger access token",
                "blogger",
                undefined,
                error
            );
            throw error;
        }
    }

    async createPost(post: BloggerPost): Promise<{ id: string; url: string }> {
        try {
            const token = await this.getAccessToken();

            const response = await axios.post(
                `${this.baseUrl}/blogs/${this.config.blogId}/posts`,
                {
                    kind: "blogger#post",
                    title: post.title,
                    content: post.content,
                    labels: post.labels,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                id: response.data.id,
                url: response.data.url,
            };
        } catch (error: any) {
            logger.error(
                "Failed to create Blogger post",
                "blogger",
                undefined,
                error
            );
            throw error;
        }
    }

    async updatePost(
        id: string,
        post: BloggerPost
    ): Promise<{ id: string; url: string }> {
        try {
            const token = await this.getAccessToken();

            const response = await axios.put(
                `${this.baseUrl}/blogs/${this.config.blogId}/posts/${id}`,
                {
                    kind: "blogger#post",
                    title: post.title,
                    content: post.content,
                    labels: post.labels,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                id: response.data.id,
                url: response.data.url,
            };
        } catch (error: any) {
            logger.error(
                "Failed to update Blogger post",
                "blogger",
                undefined,
                error
            );
            throw error;
        }
    }
}
