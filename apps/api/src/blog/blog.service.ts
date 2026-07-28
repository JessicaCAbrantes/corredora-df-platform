import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { ListBlogPostsQueryDto } from "./dto/list-blog-posts-query.dto";
import {
  buildBlogPostsMeta,
  buildBlogPostsOrderBy,
  buildBlogPostsWhere,
  toBlogPostDto,
} from "./blog.mapper";
import type { BlogPostsListResponse } from "./blog.types";

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListBlogPostsQueryDto): Promise<BlogPostsListResponse> {
    const page = query.page;
    const perPage = query.perPage;
    const where = buildBlogPostsWhere(query);
    const orderBy = buildBlogPostsOrderBy(query);
    const skip = (page - 1) * perPage;

    const [total, rows] = await Promise.all([
      this.prisma.blogPost.count({ where }),
      this.prisma.blogPost.findMany({
        where,
        orderBy,
        skip,
        take: perPage,
      }),
    ]);

    return {
      data: rows.map(toBlogPostDto),
      meta: buildBlogPostsMeta(page, perPage, total),
    };
  }
}
