import { BlogCard } from "../../../../../packages/ui/src/components/BlogCard";
import { Container } from "../../../../../packages/ui/src/components/Container";
import { Grid } from "../../../../../packages/ui/src/components/Grid";
import { Section } from "../../../../../packages/ui/src/components/Section";
import { MOCK_BLOG_POSTS } from "../utils/mock-home-data";

/**
 * Blog teaser section — mock composition only.
 */
export function Blog() {
  return (
    <Section
      title="Blog"
      description="Conteúdo editorial de exemplo."
      headerActions={
        <a className="butterfly-section__cta" href="/blog">
          Ler o blog
        </a>
      }
    >
      <Container>
        <Grid columns={3} gap="md" responsive>
          {MOCK_BLOG_POSTS.map((post) => (
            <BlogCard
              key={post.id}
              title={post.title}
              excerpt={post.excerpt}
              category={post.category}
              readingTime={post.readingTime}
              href={post.href}
            />
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
