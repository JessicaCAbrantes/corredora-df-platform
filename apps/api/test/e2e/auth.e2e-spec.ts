import type { INestApplication } from "@nestjs/common";
import { createTestApp } from "./helpers/test-app";
import { api, loginAgent } from "./helpers/test-auth";
import { disconnectTestDb } from "./helpers/test-db";
import { USERS } from "./helpers/constants";

describe("Auth E2E", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    await disconnectTestDb();
  });

  it("login válido retorna 200 e usuário", async () => {
    const res = await api(app)
      .post("/api/v1/auth/login")
      .send({
        email: USERS.runner.email,
        password: USERS.runner.password,
      })
      .expect(200);

    expect(res.body.data.user).toEqual({
      id: USERS.runner.id,
      email: USERS.runner.email,
    });
  });

  it("anônimo em /auth/me retorna 401", async () => {
    const res = await api(app).get("/api/v1/auth/me").expect(401);

    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("sessão autenticada em /auth/me retorna 200", async () => {
    const agent = await loginAgent(
      app,
      USERS.runner.email,
      USERS.runner.password,
    );

    const res = await agent.get("/api/v1/auth/me").expect(200);
    expect(res.body.data.id).toBe(USERS.runner.id);
  });
});
