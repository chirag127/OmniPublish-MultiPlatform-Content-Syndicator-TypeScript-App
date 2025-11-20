/**
 * Write.as Adapter
 * API Docs: https://developers.write.as/docs/api/
 * Based on fresh API research (Nov 2024)
 */

import axios from "axios";
import { logger } from "../utils/logger.js";

export interface WriteAsConfig {
    apiToken: string;
}

export interface WriteAsPost {
    title?: string;
    body: string;
    font?: "sans" | "serif" | "mono" | "wrap" | "code";
}

export class WriteAsAdapter {
    private token: string;
    private baseUrl = "https://write.as/api";

    constructor(config: WriteAsConfig) {
        this.token = config.apiToken;
    }

    async createPost(post: WriteAsPost): Promise<{ id: string; url: string }> {
        try {
            // Write.as API accepts markdown in body
            const response = await axios.post(
                `${this.baseUrl}/posts`,
                {
                    body: post.body,
                    title: post.title,
                    font: post.font || "sans",
                },
                {
                    headers: {
                        Authorization: `Token ${this.token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                id: response.data.data.id,
                url: `https://write.as/${response.data.data.id}`,
            };
        } catch (error: any) {
            logger.error(
                "Failed to create Write.as post",
                "writeas",
                undefined,
                error
            );
            throw error;
        }
    }

    async updatePost(
        id: string,
        post: WriteAsPost
    ): Promise<{ id: string; url: string }> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/posts/${id}`,
                {
                    body: post.body,
                    title: post.title,
                    font: post.font || "sans",
                },
                {
                    headers: {
                        Authorization: `Token ${this.token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                id: response.data.data.id,
                url: `https://write.as/${response.data.data.id}`,
            };
        } catch (error: any) {
            logger.error(
                "Failed to update Write.as post",
                "writeas",
                undefined,
                error
            );
            throw error;
        }
    }
}
