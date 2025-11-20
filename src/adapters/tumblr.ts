/**
 * Tumblr Adapter
 * API Docs: https://www.tumblr.com/docs/en/api/v2
 */

// @ts-ignore
import { OAuth } from "oauth";
import { logger } from "../utils/logger.js";

export interface TumblrConfig {
    consumerKey: string;
    consumerSecret: string;
    token: string;
    tokenSecret: string;
    blogIdentifier: string;
}

export interface TumblrPost {
    title: string;
    body: string;
    tags?: string[];
    state?: "published" | "draft";
}

export class TumblrAdapter {
    private config: TumblrConfig;
    private oauth: OAuth;
    private baseUrl = "https://api.tumblr.com/v2";

    constructor(config: TumblrConfig) {
        this.config = config;
        this.oauth = new OAuth(
            "https://www.tumblr.com/oauth/request_token",
            "https://www.tumblr.com/oauth/access_token",
            config.consumerKey,
            config.consumerSecret,
            "1.0A",
            null,
            "HMAC-SHA1"
        );
    }

    private async makeRequest(
        method: string,
        url: string,
        data: any
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            const fullUrl = `${this.baseUrl}${url}`;

            if (method === "POST") {
                this.oauth.post(
                    fullUrl,
                    this.config.token,
                    this.config.tokenSecret,
                    data,
                    "application/json",
                    (error: any, data: any) => {
                        if (error) reject(error);
                        else resolve(JSON.parse(data as string));
                    }
                );
            } else {
                this.oauth.get(
                    fullUrl,
                    this.config.token,
                    this.config.tokenSecret,
                    (error: any, data: any) => {
                        if (error) reject(error);
                        else resolve(JSON.parse(data as string));
                    }
                );
            }
        });
    }

    async createPost(post: TumblrPost): Promise<{ id: string; url: string }> {
        try {
            const response = await this.makeRequest(
                "POST",
                `/blog/${this.config.blogIdentifier}/post`,
                {
                    type: "text",
                    title: post.title,
                    body: post.body,
                    tags: post.tags?.join(","),
                    state: post.state || "published",
                }
            );

            return {
                id: response.response.id.toString(),
                url: `https://${this.config.blogIdentifier}/post/${response.response.id}`,
            };
        } catch (error: any) {
            logger.error(
                "Failed to create Tumblr post",
                "tumblr",
                undefined,
                error
            );
            throw error;
        }
    }

    async updatePost(
        id: string,
        post: TumblrPost
    ): Promise<{ id: string; url: string }> {
        try {
            const response = await this.makeRequest(
                "POST",
                `/blog/${this.config.blogIdentifier}/post/edit`,
                {
                    id,
                    type: "text",
                    title: post.title,
                    body: post.body,
                    tags: post.tags?.join(","),
                    state: post.state || "published",
                }
            );

            return {
                id: response.response.id.toString(),
                url: `https://${this.config.blogIdentifier}/post/${response.response.id}`,
            };
        } catch (error: any) {
            logger.error(
                "Failed to update Tumblr post",
                "tumblr",
                undefined,
                error
            );
            throw error;
        }
    }
}
