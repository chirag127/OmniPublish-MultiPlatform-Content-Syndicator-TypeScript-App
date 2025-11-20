/**
 * Micro.blog Adapter
 * API Docs: https://help.micro.blog/t/posting-api/96
 * Uses Micropub protocol (W3C standard)
 * Based on fresh API research (Nov 2024)
 */

import axios from "axios";
import { logger } from "../utils/logger.js";

export interface MicroblogConfig {
    token: string;
    endpoint?: string;
}

export interface MicroblogPost {
    name?: string; // Title (optional for microblog posts)
    content: string;
    category?: string[]; // Tags
    "mp-slug"?: string; // Custom slug
}

export class MicroblogAdapter {
    private token: string;
    private endpoint: string;

    constructor(config: MicroblogConfig) {
        this.token = config.token;
        this.endpoint = config.endpoint || "https://micro.blog/micropub";
    }

    async createPost(
        post: MicroblogPost
    ): Promise<{ id: string; url: string }> {
        try {
            // Micropub uses form-encoded format
            const formData = new URLSearchParams();
            formData.append("h", "entry");
            formData.append("content", post.content);

            if (post.name) {
                formData.append("name", post.name);
            }

            if (post.category) {
                post.category.forEach((cat) =>
                    formData.append("category[]", cat)
                );
            }

            if (post["mp-slug"]) {
                formData.append("mp-slug", post["mp-slug"]);
            }

            const response = await axios.post(this.endpoint, formData, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                maxRedirects: 0,
                validateStatus: (status) => status === 201 || status === 202,
            });

            // Micropub returns Location header with the created post URL
            const url =
                response.headers.location || response.headers.Location || "";
            const id = url.split("/").pop() || "";

            return {
                id,
                url,
            };
        } catch (error: any) {
            logger.error(
                "Failed to create Micro.blog post",
                "microblog",
                undefined,
                error
            );
            throw error;
        }
    }

    async updatePost(
        url: string,
        post: MicroblogPost
    ): Promise<{ id: string; url: string }> {
        try {
            // Micropub update uses JSON format
            const response = await axios.post(
                this.endpoint,
                {
                    action: "update",
                    url: url,
                    replace: {
                        content: [post.content],
                        ...(post.name && { name: [post.name] }),
                        ...(post.category && { category: post.category }),
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        "Content-Type": "application/json",
                    },
                    validateStatus: (status) =>
                        status === 200 || status === 201 || status === 204,
                }
            );

            return {
                id: url.split("/").pop() || "",
                url,
            };
        } catch (error: any) {
            logger.error(
                "Failed to update Micro.blog post",
                "microblog",
                undefined,
                error
            );
            throw error;
        }
    }
}
