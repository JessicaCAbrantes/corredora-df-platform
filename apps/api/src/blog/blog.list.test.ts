/**
 * Unit tests for BlogService.list + mapper helpers.
 * Run: pnpm --filter api test
 */
import "reflect-metadata";
import type { BlogPost } from "@prisma/client";
import { ListBlogPostsQueryDto } from "./dto/list-blog-posts-query.dto";
import {
  buildBlogPostsMeta,
  buildBlogPostsOrderBy,
  buildBlogPostsWhere,
  toBlogPostDto,
} from "./blog.mapper";
import { BlogService } from "./blog.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function basePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id: "blg_01_5k_tips",
    title: "5 dicas para sua primeira corrida de 5K",
    slug: "5-dicas-primeira-corrida-5k",
    excerpt: "Preparação simples para estreantes no calendário do DF.",
    category: "Treino",
    readingTimeMinutes: 5,
    publishedAt: new Date("2026-06-10T09:00:00.000Z"),
    published: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

type PrismaMock = {
  blogPost: {
    count: (args: unknown) => Promise<number>;
    findMany: (args: unknown) => Promise<BlogPost[]>;
  };
};

function createService(prisma: PrismaMock): BlogService {
  return new BlogService(prisma as never);
}

function defaultQuery(
  overrides: Partial<ListBlogPostsQueryDto> = {},
): ListBlogPostsQueryDto {
  const query = new ListBlogPostsQueryDto();
  Object.assign(query, overrides);
  return query;
}

async function main(): Promise<void> {
  const dto = toBlogPostDto(basePost());
  assert(dto.slug === "5-dicas-primeira-corrida-5k", "slug");
  assert(dto.readingTimeMinutes === 5, "readingTimeMinutes");
  assert(dto.publishedAt === "2026-06-10T09:00:00.000Z", "publishedAt iso");
  assert(!("content" in dto), "no content");
  assert(!("author" in dto), "no author");
  assert(!("authorId" in dto), "no authorId");
  assert(!("coverImage" in dto), "no coverImage");

  const draftDto = toBlogPostDto(
    basePost({
      id: "blg_04_draft",
      published: false,
      publishedAt: null,
    }),
  );
  assert(draftDto.published === false, "draft published false");
  assert(draftDto.publishedAt === null, "draft publishedAt null");

  assert(
    buildBlogPostsWhere(defaultQuery({ published: true })).published === true,
    "published true",
  );
  assert(
    buildBlogPostsWhere(defaultQuery({ published: false })).published === false,
    "published false",
  );

  const order = buildBlogPostsOrderBy(defaultQuery());
  assert(
    JSON.stringify(order[0]) === JSON.stringify({ publishedAt: "desc" }),
    "default sort publishedAt desc",
  );

  const meta = buildBlogPostsMeta(1, 3, 3);
  assert(meta.totalPages === 1, "meta pages");
  assert(meta.hasNextPage === false, "meta next");

  const service = createService({
    blogPost: {
      count: async () => 2,
      findMany: async (args: unknown) => {
        const a = args as {
          where: unknown;
          orderBy: unknown;
          skip: number;
          take: number;
        };
        assert(
          JSON.stringify(a.where) === JSON.stringify({ published: true }),
          "where published",
        );
        assert(a.skip === 0 && a.take === 3, "pagination");
        return [
          basePost({ id: "blg_03_training_df" }),
          basePost({ id: "blg_02_first_race" }),
        ];
      },
    },
  });

  const result = await service.list(defaultQuery());
  assert(result.data.length === 2, "list length");
  assert(result.meta.total === 2, "meta total");
  assert(
    !JSON.stringify(result).includes('"content"'),
    "response json has no content",
  );
  assert(
    !JSON.stringify(result).includes('"coverImage"'),
    "response json has no coverImage",
  );
  assert(
    !JSON.stringify(result).includes('"author"'),
    "response json has no author",
  );

  const empty = await createService({
    blogPost: {
      count: async () => 0,
      findMany: async () => [],
    },
  }).list(defaultQuery());
  assert(empty.data.length === 0 && empty.meta.total === 0, "empty list");

  await createService({
    blogPost: {
      count: async () => 1,
      findMany: async (args: unknown) => {
        const a = args as { orderBy: unknown; where: unknown };
        assert(
          JSON.stringify(a.where) === JSON.stringify({ published: false }),
          "filter unpublished",
        );
        assert(
          JSON.stringify(a.orderBy) ===
            JSON.stringify([{ title: "asc" }, { id: "asc" }]),
          "title asc",
        );
        return [basePost({ published: false })];
      },
    },
  }).list(defaultQuery({ published: false, sort: "title", order: "asc" }));

  console.log("blog.list.test.ts: all assertions passed");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
