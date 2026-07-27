import { Container } from "../../../../packages/ui/src/components/Container";
import { Grid } from "../../../../packages/ui/src/components/Grid";
import { Hero } from "../../../../packages/ui/src/components/Hero";
import { Layout } from "../../../../packages/ui/src/components/Layout";
import { Navbar } from "../../../../packages/ui/src/components/Navbar";
import { Section } from "../../../../packages/ui/src/components/Section";
import { Stack } from "../../../../packages/ui/src/components/Stack";

export default function PlaygroundPage() {
  return (
    <Layout>
      <Navbar activeItemId="home" />
      <Hero />
      <Container>
        <div id="main-content">
          <Stack gap="lg">
            <h2>🦋 Butterfly UI Playground</h2>

            <Section aria-label="Layout components preview">
              <Stack gap="md">
                <p>Layout, Container, Section, Stack e Grid importados.</p>
                <Grid columns={2} gap="md" responsive>
                  <div>Grid item 1</div>
                  <div>Grid item 2</div>
                </Grid>
              </Stack>
            </Section>
          </Stack>
        </div>
      </Container>
    </Layout>
  );
}
