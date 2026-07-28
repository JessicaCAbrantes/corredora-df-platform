import type {
  BlogPostListItem,
  GetBlogPostsListParams,
  GetBlogPostsListResult,
} from "../../blog/types/blog-posts-list";

export const HOME_BLOG_PER_PAGE = 3;
export const HOME_BLOG_LIST_HREF = "/blog";
export const HOME_BLOG_EMPTY_MESSAGE = "Nenhum artigo publicado.";
export const HOME_BLOG_ERROR_MESSAGE =
  "Não foi possível carregar o blog.";

export function buildHomeBlogParams(): GetBlogPostsListParams {
  return {
    page: 1,
    perPage: HOME_BLOG_PER_PAGE,
    published: true,
    sort: "publishedAt",
    order: "desc",
  };
}

export type HomeBlogPresentation =
  | { status: "empty"; message: string; listHref: string }
  | { status: "error"; message: string; listHref: string }
  | { status: "ready"; posts: BlogPostListItem[]; listHref: string };

export function toHomeBlogPresentation(
  result: GetBlogPostsListResult,
): HomeBlogPresentation {
  const listHref = HOME_BLOG_LIST_HREF;

  if (result.status === "error") {
    return {
      status: "error",
      message: result.message || HOME_BLOG_ERROR_MESSAGE,
      listHref,
    };
  }

  if (result.posts.length === 0) {
    return {
      status: "empty",
      message: HOME_BLOG_EMPTY_MESSAGE,
      listHref,
    };
  }

  return {
    status: "ready",
    posts: result.posts,
    listHref,
  };
}
