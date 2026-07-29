import type { INestApplication } from "@nestjs/common";
import request from "supertest";

export type TestAgent = ReturnType<typeof request.agent>;

export async function loginAgent(
  app: INestApplication,
  email: string,
  password: string,
): Promise<TestAgent> {
  const agent = request.agent(app.getHttpServer());
  await agent
    .post("/api/v1/auth/login")
    .send({ email, password })
    .expect(200);
  return agent;
}

export function api(app: INestApplication) {
  return request(app.getHttpServer());
}
