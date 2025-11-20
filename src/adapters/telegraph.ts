/**
 * Telegraph (Telegra.ph) Adapter
 * API Docs: https://telegra.ph/api
 * Based on fresh API research (Nov 2024)
 */

import axios from "axios";
import { logger } from "../utils/logger.js";

export interface TelegraphConfig {
    accessToken: string;
}

export interface TelegraphPage {
    title: string;
    author_name?: string;
    author_url?: string;
    content: any[]; // Telegraph uses Node objects
    return_content?: boolean;
}

export class TelegraphAdapter {
    private token: string;
    private baseUrl = "https://api.telegra.ph";

    constructor(config: TelegraphConfig) {
        this.token = config.accessToken;
    }

    /**
     * Convert HTML to Telegraph Node format
     * Telegraph requires content as array of Node objects
     */
    private htmlToNodes(html: string): any[] {
        // Simple conversion - Telegraph accepts HTML tags as nodes
        // For production, use a proper HTML parser
        return [
            {
                tag: "p",
                children: [html],
            },
        ];
    }

    async createPage(
        page: TelegraphPage
    ): Promise<{ id: string; url: string }> {
        try {
            const response = await axios.post(`${this.baseUrl}/createPage`, {
                access_token: this.token,
                title: page.title,
                author_name: page.author_name,
                author_url: page.author_url,
                content: page.content,
                return_content: page.return_content || false,
            });

            if (!response.data.ok) {
                throw new Error(response.data.error || "Telegraph API error");
            }

            return {
                id: response.data.result.path,
                url: response.data.result.url,
            };
        } catch (error: any) {
            logger.error(
                "Failed to create Telegraph page",
                "telegraph",
                undefined,
                error
            );
            throw error;
        }
    }

    async updatePage(
        path: string,
        page: TelegraphPage
    ): Promise<{ id: string; url: string }> {
        try {
            const response = await axios.post(
                `${this.baseUrl}/editPage/${path}`,
                {
                    access_token: this.token,
                    title: page.title,
                    author_name: page.author_name,
                    author_url: page.author_url,
                    content: page.content,
                    return_content: page.return_content || false,
                }
            );

            if (!response.data.ok) {
                throw new Error(response.data.error || "Telegraph API error");
            }

            return {
                id: response.data.result.path,
                url: response.data.result.url,
            };
        } catch (error: any) {
            logger.error(
                "Failed to update Telegraph page",
                "telegraph",
                undefined,
                error
            );
            throw error;
        }
    }
}
