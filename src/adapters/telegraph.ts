/**
 * Telegraph (Telegra.ph) Adapter
 * API Documentation: https://telegra.ph/api
 *
 * Based on fresh API research (Nov 2024):
 * - Endpoint: https://api.telegra.ph/createPage
 * - No authentication required for creating pages
 * - Access token is returned on first page creation
 * - Content must be in Node format (array of objects)
 */

import axios from "axios";
import { Post } from "../utils/markdown";
import { logger } from "../utils/logger";

const PLATFORM = "telegraph";
const API_BASE = "https://api.telegra.ph";

export interface TelegraphConfig {
    accessToken?: string; // Optional - will be created if not provided
    mockMode?: boolean;
    mockUrl?: string;
}

/**
 * Convert HTML to Telegraph Node format
 * Simplified conversion - Telegraph supports limited HTML tags
 */
function htmlToTelegraphNodes(html: string): any[] {
    // For simplicity, we'll send the HTML as a single node
    // Telegraph will parse it automatically
    return [html];
}

export async function publishToTelegraph(
    post: Post,
    config: TelegraphConfig
): Promise<{ id: string; url: string }> {
    let { accessToken, mockMode, mockUrl } = config;

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;

    // If no access token, create an account first
    if (!accessToken) {
        try {
            const accountResponse = await axios.post(
                `${baseUrl}/createAccount`,
                {
                    short_name: "OmniPublisher",
                    author_name: post.metadata.author || "Anonymous",
                }
            );

            accessToken = accountResponse.data.result.access_token;
            logger.info("Created new Telegraph account", PLATFORM);
        } catch (error: any) {
            logger.error(
                "Failed to create Telegraph account",
                PLATFORM,
                post.metadata.slug,
                {
                    error: error.message,
                }
            );
            throw error;
        }
    }

    const pageData = {
        access_token: accessToken,
        title: post.metadata.title,
        author_name: post.metadata.author || "Anonymous",
        content: htmlToTelegraphNodes(post.html),
        return_content: false,
    };

    try {
        const response = await axios.post(`${baseUrl}/createPage`, pageData);

        logger.success("Published successfully", PLATFORM, post.metadata.slug);

        const result = response.data.result;

        return {
            id: result.path,
            url: result.url,
        };
    } catch (error: any) {
        logger.error("Failed to publish", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}

export async function updateOnTelegraph(
    post: Post,
    pagePath: string,
    config: TelegraphConfig
): Promise<{ id: string; url: string }> {
    const { accessToken, mockMode, mockUrl } = config;

    if (!accessToken) {
        throw new Error("Telegraph access token is required for updates");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;

    const pageData = {
        access_token: accessToken,
        path: pagePath,
        title: post.metadata.title,
        author_name: post.metadata.author || "Anonymous",
        content: htmlToTelegraphNodes(post.html),
        return_content: false,
    };

    try {
        const response = await axios.post(
            `${baseUrl}/editPage/${pagePath}`,
            pageData
        );

        logger.success("Updated successfully", PLATFORM, post.metadata.slug);

        const result = response.data.result;

        return {
            id: result.path,
            url: result.url,
        };
    } catch (error: any) {
        logger.error("Failed to update", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}
