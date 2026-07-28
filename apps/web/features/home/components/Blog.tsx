import Link from "next/link";
import { BlogCard } from "../../../../../packages/ui/src/components/BlogCard";
import { Container } from "../../../../../packages/ui/src/components/Container";
import { Grid } from "../../../../../packages/ui/src/components/Grid";
import { Section } from "../../../../../packages/ui/src/components/Section";
import type { GetBlogPostsListResult } from "../../blog/types/blog-posts-list";
import {
  HOME_BLOG_LIST_HREF,
  toHomeBlogPresentation,
} from "../utils/home-blog";

export type BlogProps = {
  result: GetBlogPostsListResult;
};

/**
 * Blog teaser section — data from GET /api/v1/blog/posts (no full content).
 */
export function Blog({ result }: BlogProps) {
  const presentation = toHomeBlogPresentation(result);

  return (
    <Section
      title="Blog"
      description="Conteúdo editorial do ecossistema de corrida no DF."
      headerActions={
        <Link className="butterfly-section__cta" href={HOME_BLOG_LIST_HREF}>
          Ler o blog
        </Link>
      }
    >
      <Container>
        {presentation.status === "ready" ? (
          <Grid columns={3} gap="md" responsive>
            {presentation.posts.map((post) => (
              <BlogCard
                key={post.id}
                title={post.title}
                excerpt={post.excerpt}
                category={post.category}
                readingTime={post.readingTimeLabel}
                href={post.href}
              />
            ))}
          </Grid>
        ) : null}

        {presentation.status === "empty" ? (
          <div className="home-blog__state">
            <p className="home-blog__empty">{presentation.message}</p>
            <Link className="butterfly-section__cta" href={presentation.listHref}>
              Ler o blog
            </Link>
          </div>
        ) : null}

        {presentation.status === "error" ? (
          <div className="home-blog__state" role="alert">
            <p className="home-blog__error">{presentation.message}</p>
            <Link className="butterfly-section__cta" href={presentation.listHref}>
              Ler o blog
            </Link>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
