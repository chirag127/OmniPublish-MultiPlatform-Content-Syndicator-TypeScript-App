/**
 * State management for published posts (idempotency tracking)
 */

import fs from "fs/promises";
import path from "path";

export interface PostMapping {
    slug: string;
    platforms: {
        [platform: string]: {
            id: string;
            url: string;
            publishedAt: string;
            lastUpdated: string;
        };
    };
}

export interface StateMap {
    [slug: string]: PostMapping;
}

const STATE_FILE = path.join(process.cwd(), ".postmap.json");

/**
 * Load state from .postmap.json
 */
export async function loadState(): Promise<StateMap> {
    try {
        const content = await fs.readFile(STATE_FILE, "utf-8");
        return JSON.parse(content);
    } catch (error) {
        // File doesn't exist yet, return empty state
        return {};
    }
}

/**
 * Save state to .postmap.json
 */
export async function saveState(state: StateMap): Promise<void> {
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

/**
 * Check if post is already published on platform
 */
export function isPublished(
    state: StateMap,
    slug: string,
    platform: string
): boolean {
    return !!state[slug]?.platforms[platform];
}

/**
 * Get published post ID for platform
 */
export function getPublishedId(
    state: StateMap,
    slug: string,
    platform: string
): string | null {
    return state[slug]?.platforms[platform]?.id || null;
}

/**
 * Record successful publication
 */
export function recordPublication(
    state: StateMap,
    slug: string,
    platform: string,
    id: string,
    url: string
): StateMap {
    if (!state[slug]) {
        state[slug] = { slug, platforms: {} };
    }

    state[slug].platforms[platform] = {
        id,
        url,
        publishedAt:
            state[slug].platforms[platform]?.publishedAt ||
            new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
    };

    return state;
}
