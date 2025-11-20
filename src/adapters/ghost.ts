/**
 * Ghost adapter
 * API Docs: https://ghost.org/docs/admin-api/
 */

import axios from "axios";
import * as crypto from "crypto";
import { ParsedPost } from "../utils/markdown";
import { logger } from "../utils/logger";

export interface GhostConfig {
    adminApiKey: string;
    adminUrl: string;
    mockMode?: boolean;
    mockServerUrl?: string;
}

export class GhostAdapter {
    private apiKey: string;
    private adminUrl: string;
    private baseUrl: string;

    constructor(config: GhostConfig) {
        this.apiKey = config.adminApiKey;
        this.adminUrl = config.adminUrl;
        this.baseUrl =
            config.mockMode && config.mockServerUrl
                ? `${config.mockServerUrl}/ghost`
                : `${config.adminUrl}/ghost/api/admin`;
    }

    private generateToken(): string {
        const [id, secret] = this.apiKey.split(":");
        const token = crypto
            .createHmac("sha256", Buffer.from(secret, "hex"))
            .update(`/admin/`)
            .digest("hex");

        const header = { alg: "HS256", typ: "JWT", kid: id };
        const payload = {
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 300,
            aud: "/admin/",
        };

        return `${Buffer.from(JSON.stringify(header)).toString(
            "base64"
        )}.${Buffer.from(JSON.stringify(payload)).toString("base64")}.${token}`;
    }

    async createPost(post: ParsedPost): Promise<{ id: string; url: string }> {
        try {
            const token = this.generateToken();

            const response = await axios.post(
                `${this.baseUrl}/posts/`,
                {
                    posts: [
                        {
                            title: post.frontmatter.title,
                            html: post.html,
                            tags: post.frontmatter.tags.map((tag) => ({
                                name: tag,
                            })),
                            status: "published",
                            meta_description: post.frontmatter.description,
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Ghost ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                id: response.data.posts[0].id,
                url: response.data.posts[0].url,
            };
        } catch (error: any) {
            logger.error(
                `Ghost create failed: ${error.message}`,
                "ghost",
                undefined,
                {
                    status: error.response?.status,
                    data: error.response?.data,
                }
            );
            throw error;
        }
    }

    async updatePost(
        postId: string,
        post: ParsedPost
    ): Promise<{ id: string; url: string }> {
        try {
            const token = this.generateToken();

            const response = await axios.put(
                `${this.baseUrl}/posts/${postId}/`,
                {
                    posts: [
                        {
                            title: post.frontmatter.title,
                            html: post.html,
                            tags: post.frontmatter.tags.map((tag) => ({
                                name: tag,
                            })),
                            meta_description: post.frontmatter.description,
                            updated_at: new Date().toISOString(),
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Ghost ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                id: response.data.posts[0].id,
                url: response.data.posts[0].url,
            };
        } catch (error: any) {
            logger.error(
                `Ghost update failed: ${error.message}`,
                "ghost",
                undefined,
                {
                    status: error.response?.status,
                }
            );
            throw error;
        }
    }
}
