import { Controller, Get, Query } from "@nestjs/common";
import { ListBlogPostsQueryDto } from "./dto/list-blog-posts-query.dto";
import { BlogService } from "./blog.service";
import type { BlogPostsListResponse } from "./blog.types";

@Controller("blog/posts")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  /**
   * GET /api/v1/blog/posts — public Home teaser catalog (no content/author).
   */
  @Get()
  list(@Query() query: ListBlogPostsQueryDto): Promise<BlogPostsListResponse> {
    return this.blogService.list(query);
  }
}
