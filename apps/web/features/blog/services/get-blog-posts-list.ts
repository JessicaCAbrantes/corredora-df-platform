import { createHttpGetBlogPosts } from "../infrastructure/http-get-blog-posts";
import type {
  GetBlogPostsListParams,
  GetBlogPostsListResult,
} from "../types/blog-posts-list";

const httpGetBlogPosts = createHttpGetBlogPosts();

/**
 * Application-facing fetch for blog posts listing (Home MVP).
 */
export async function getBlogPostsList(
  params: GetBlogPostsListParams,
): Promise<GetBlogPostsListResult> {
  return httpGetBlogPosts(params);
}
