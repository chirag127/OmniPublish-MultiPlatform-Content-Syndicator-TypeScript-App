/**
 * Hashnode Adapter
 * API Documentation: https://apidocs.hashnode.com/
 */

import axios from "axios";
import { Post } from "../utils/markdown";
import { logger } from "../utils/logger";

const PLATFORM = "hashnode";
const API_BASE = "https://gql.hashnode.com";

export interface HashnodeConfig {
    token: string;
    publicationId: string;
    mockMode?: boolean;
    mockUrl?: string;
}

export async function publishToHashnode(
    post: Post,
    config: HashnodeConfig
): Promise<{ id: string; url: string }> {
    const { token, publicationId, mockMode, mockUrl } = config;

    if (!token || !publicationId) {
        throw new Error("Hashnode token and publication ID are required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;

    const mutation = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          id
          url
        }
      }
    }
  `;

    const variables = {
        input: {
            title: post.metadata.title,
            contentMarkdown: post.content,
            tags: post.metadata.tags.map((tag: string) => ({
                name: tag,
                slug: tag.toLowerCase().replace(/\s+/g, "-"),
            })),
            publicationId: publicationId,
            subtitle: post.metadata.description,
        },
    };

    try {
        const response = await axios.post(
            baseUrl,
            { query: mutation, variables },
            {
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.data.errors) {
            throw new Error(JSON.stringify(response.data.errors));
        }

        const postData = response.data.data.publishPost.post;
        logger.success("Published successfully", PLATFORM, post.metadata.slug);

        return {
            id: postData.id,
            url: postData.url,
        };
    } catch (error: any) {
        logger.error("Failed to publish", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}

export async function updateOnHashnode(
    post: Post,
    postId: string,
    config: HashnodeConfig
): Promise<{ id: string; url: string }> {
    const { token, mockMode, mockUrl } = config;

    if (!token) {
        throw new Error("Hashnode token is required");
    }

    const baseUrl = mockMode && mockUrl ? mockUrl : API_BASE;

    const mutation = `
    mutation UpdatePost($input: UpdatePostInput!) {
      updatePost(input: $input) {
        post {
          id
          url
        }
      }
    }
  `;

    const variables = {
        input: {
            id: postId,
            title: post.metadata.title,
            contentMarkdown: post.content,
            subtitle: post.metadata.description,
        },
    };

    try {
        const response = await axios.post(
            baseUrl,
            { query: mutation, variables },
            {
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.data.errors) {
            throw new Error(JSON.stringify(response.data.errors));
        }

        const postData = response.data.data.updatePost.post;
        logger.success("Updated successfully", PLATFORM, post.metadata.slug);

        return {
            id: postData.id,
            url: postData.url,
        };
    } catch (error: any) {
        logger.error("Failed to update", PLATFORM, post.metadata.slug, {
            error: error.message,
            response: error.response?.data,
        });
        throw error;
    }
}
