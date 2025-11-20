/**
 * Hashnode Adapter
 * API Docs: https://apidocs.hashnode.com/
 */

import axios from "axios";
import { logger } from "../utils/logger.js";

export interface HashnodeConfig {
    token: string;
    publicationId: string;
}

export interface HashnodePost {
    title: string;
    contentMarkdown: string;
    tags?: string[];
    subtitle?: string;
    slug?: string;
}

export class HashnodeAdapter {
    private token: string;
    private publicationId: string;
    private baseUrl = "https://gql.hashnode.com";

    constructor(config: HashnodeConfig) {
        this.token = config.token;
        this.publicationId = config.publicationId;
    }

    async createPost(post: HashnodePost): Promise<{ id: string; url: string }> {
        const mutation = `
      mutation PublishPost($input: PublishPostInput!) {
        publishPost(input: $input) {
          post {
            id
            slug
            url
          }
        }
      }
    `;

        try {
            const response = await axios.post(
                this.baseUrl,
                {
                    query: mutation,
                    variables: {
                        input: {
                            title: post.title,
                            contentMarkdown: post.contentMarkdown,
                            tags: post.tags?.map((tag) => ({
                                slug: tag.toLowerCase().replace(/\s+/g, "-"),
                                name: tag,
                            })),
                            subtitle: post.subtitle,
                            publicationId: this.publicationId,
                        },
                    },
                },
                {
                    headers: {
                        Authorization: this.token,
                        "Content-Type": "application/json",
                    },
                }
            );

            const postData = response.data.data.publishPost.post;
            return {
                id: postData.id,
                url: postData.url,
            };
        } catch (error: any) {
            logger.error(
                "Failed to create Hashnode post",
                "hashnode",
                undefined,
                error
            );
            throw error;
        }
    }

    async updatePost(
        id: string,
        post: HashnodePost
    ): Promise<{ id: string; url: string }> {
        const mutation = `
      mutation UpdatePost($input: UpdatePostInput!) {
        updatePost(input: $input) {
          post {
            id
            slug
            url
          }
        }
      }
    `;

        try {
            const response = await axios.post(
                this.baseUrl,
                {
                    query: mutation,
                    variables: {
                        input: {
                            id,
                            title: post.title,
                            contentMarkdown: post.contentMarkdown,
                            tags: post.tags?.map((tag) => ({
                                slug: tag.toLowerCase().replace(/\s+/g, "-"),
                                name: tag,
                            })),
                            subtitle: post.subtitle,
                        },
                    },
                },
                {
                    headers: {
                        Authorization: this.token,
                        "Content-Type": "application/json",
                    },
                }
            );

            const postData = response.data.data.updatePost.post;
            return {
                id: postData.id,
                url: postData.url,
            };
        } catch (error: any) {
            logger.error(
                "Failed to update Hashnode post",
                "hashnode",
                undefined,
                error
            );
            throw error;
        }
    }
}
