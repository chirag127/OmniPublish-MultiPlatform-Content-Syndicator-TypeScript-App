/**
 * Substack Adapter (UNOFFICIAL)
 *
 * ⚠️ WARNING: This adapter uses an UNOFFICIAL/REVERSE-ENGINEERED API
 * Substack does not provide an official public API for publishing posts.
 * This implementation may break at any time without notice.
 *
 * Based on research from:
 * - https://iam.slys.dev/p/no-official-api-no-problem-how-i
 * - https://github.com/NHagar/substack_api
 *
 * Limitations:
 * - May require session cookies instead of API tokens
 * - Endpoints may change without notice
 * - Rate limiting is unknown
 * - No official support or documentation
 *
 * Use at your own risk!
 */

import axios from "axios";
import { logger } from "../utils/logger.js";

export interface SubstackConfig {
    apiToken?: string; // May not work - unofficial
    publicationId?: string;
}

export interface SubstackPost {
    title: string;
    subtitle?: string;
    body: string; // HTML content
    status?: "draft" | "published";
}

export class SubstackAdapter {
    private token?: string;
    private publicationId?: string;

    constructor(config: SubstackConfig) {
        this.token = config.apiToken;
        this.publicationId = config.publicationId;
    }

    async createPost(post: SubstackPost): Promise<{ id: string; url: string }> {
        logger.warn(
            "Substack adapter uses UNOFFICIAL API - may break at any time",
            "substack"
        );

        try {
            // This is a placeholder implementation
            // The actual Substack API is not publicly documented
            // and requires reverse engineering their web app

            throw new Error(
                "Substack publishing is not fully implemented. " +
                    "Substack does not provide an official API. " +
                    "Consider using their web interface or email publishing instead."
            );
        } catch (error: any) {
            logger.error(
                "Failed to create Substack post",
                "substack",
                undefined,
                error
            );
            throw error;
        }
    }

    async updatePost(
        id: string,
        post: SubstackPost
    ): Promise<{ id: string; url: string }> {
        logger.warn(
            "Substack adapter uses UNOFFICIAL API - may break at any time",
            "substack"
        );

        throw new Error(
            "Substack updating is not fully implemented. " +
                "Substack does not provide an official API."
        );
    }
}
