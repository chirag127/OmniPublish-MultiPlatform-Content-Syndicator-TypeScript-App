/**
 * Substack Adapter (UNOFFICIAL)
 *
 * ⚠️ WARNING: This adapter uses an UNOFFICIAL API that may break without notice.
 * Substack does not provide an official public API for publishing posts.
 *
 * Based on reverse-engineering research (Nov 2024):
 * - No official API exists
 * - This implementation is based on community reverse-engineering efforts
 * - May break at any time if Substack changes their internal API
 * - Use at your own risk
 *
 * References:
 * - https://github.com/NHagar/substack_api
 * - https://iam.slys.dev/p/no-official-api-no-problem-how-i
 *
 * LIMITATIONS:
 * - Authentication method may change
 * - Endpoint structure may change
 * - No official support or documentation
 * - Rate limiting is unknown
 */

import axios from "axios";
import { Post } from "../utils/markdown";
import { logger } from "../utils/logger";

const PLATFORM = "substack";

export interface SubstackConfig {
    apiToken?: string; // Session token (unofficial)
    publicationId?: string; // Publication ID
    mockMode?: boolean;
    mockUrl?: string;
}

export async function publishToSubstack(
    post: Post,
    config: SubstackConfig
): Promise<{ id: string; url: string }> {
    const { apiToken, publicationId, mockMode, mockUrl } = config;

    logger.warn(
        "Using UNOFFICIAL Substack API - may break without notice",
        PLATFORM,
        post.metadata.slug
    );

    if (!apiToken || !publicationId) {
        throw new Error(
            "Substack API token and publication ID are required (unofficial)"
        );
    }

    // Note: This is a placeholder implementation
    // The actual Substack API endpoints are not publicly documented
    // and may require session cookies, CSRF tokens, etc.

    logger.error(
        "Substack publishing not fully implemented - API is unofficial and unstable",
        PLATFORM,
        post.metadata.slug,
        {
            note: "Please publish to Substack manually through their web interface",
            reason: "No stable unofficial API available",
        }
    );

    throw new Error(
        "Substack adapter is not fully implemented due to lack of official API. " +
            "Please publish to Substack manually through their web interface."
    );
}

export async function updateOnSubstack(
    post: Post,
    postId: string,
    config: SubstackConfig
): Promise<{ id: string; url: string }> {
    logger.warn(
        "Using UNOFFICIAL Substack API - may break without notice",
        PLATFORM,
        post.metadata.slug
    );

    throw new Error(
        "Substack adapter is not fully implemented due to lack of official API. " +
            "Please update posts on Substack manually through their web interface."
    );
}

/**
 * Note for future implementation:
 *
 * If you want to implement Substack publishing, you'll need to:
 * 1. Reverse-engineer their web app's API calls
 * 2. Extract session cookies and CSRF tokens
 * 3. Replicate the exact request format they use
 * 4. Handle authentication properly
 * 5. Be prepared for it to break at any time
 *
 * This is not recommended for production use.
 * Consider using Substack's email import feature or manual publishing instead.
 */
