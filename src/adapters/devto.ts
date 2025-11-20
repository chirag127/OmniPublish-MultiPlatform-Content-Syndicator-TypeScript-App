/**
 * Dev.to Adapter
 * API Docs: https://developers.forem.com/api/v1
 */

import axios from "axios";
import { logger } from "../utils/logger.js";

export interface DevToConfig {
    apiKey: string;
}

export interface DevToArticle {
    title: string;
    body_markdown: string;
    published: boolean;
    tags?: string[];
    canonical_url?: string;
    description?: string;
}

export class DevToAdapter {
    private apiKey: string;
    private baseUrl = "https://dev.to/api";

    constructor(config: DevToConfig) {
        this.apiKey = config.apiKey;
    }

    async createArticle(
        article: DevToArticle
    ): Promise<{ id: string; url: string }> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/articles`,
                { article },
                {
                    headers: {
                        "api-key": this.apiKey,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                id: response.data.id.toString(),
                url: response.data.url,
            };
        } catch (error: any) {
            logger.error(
                "Failed to create Dev.to article",
                "devto",
                undefined,
                error
            );
            throw error;
        }
    }

    async updateArticle(
        id: string,
        article: DevToArticle
    ): Promise<{ id: string; url: string }> {
        try {
            const response = await axios.put(
                `${this.baseUrl}/articles/${id}`,
                { article },
                {
                    headers: {
                        "api-key": this.apiKey,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                id: response.data.id.toString(),
                url: response.data.url,
            };
        } catch (error: any) {
            logger.error(
                "Failed to update Dev.to article",
                "devto",
                undefined,
                error
            );
            throw error;
        }
    }
}
