import { BlogCard } from "../../../../../packages/ui/src/components/BlogCard";
import { Container } from "../../../../../packages/ui/src/components/Container";
import { Grid } from "../../../../../packages/ui/src/components/Grid";
import { Section } from "../../../../../packages/ui/src/components/Section";
import type { GetBlogPostsListResult } from "../../blog/types/blog-posts-list";
import { toHomeBlogPresentation } from "../utils/home-blog";

export type BlogProps = {
  result: GetBlogPostsListResult;
};

/**
 * Blog teaser — explicitly non-clickable (Faculty MVP F5).
 */
export function Blog({ result }: BlogProps) {
  const presentation = toHomeBlogPresentation(result);

  return (
    <Section
      title="Blog"
      description="Conteúdo editorial do ecossistema de corrida no DF."
      headerActions={
        <span className="home-teaser-badge" aria-hidden="true">
          Em breve
        </span>
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
                className="home-teaser-card"
              />
            ))}
          </Grid>
        ) : null}

        {presentation.status === "empty" ? (
          <div className="home-blog__state">
            <p className="home-blog__empty">{presentation.message}</p>
          </div>
        ) : null}

        {presentation.status === "error" ? (
          <div className="home-blog__state" role="alert">
            <p className="home-blog__error">
              Não foi possível carregar o blog agora. Continue pela Home e pelas
              corridas.
            </p>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
