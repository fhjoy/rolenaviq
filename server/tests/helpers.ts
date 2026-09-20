import request from "supertest";

import app from "../src/app.js";

interface TestUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

let userCounter = 0;

export const createTestUser = (
  overrides: TestUserInput = {},
): Required<TestUserInput> => {
  userCounter += 1;

  return {
    firstName: overrides.firstName ?? "Test",
    lastName: overrides.lastName ?? "User",
    email: overrides.email ?? `test.user.${userCounter}@example.com`,
    password: overrides.password ?? "StrongPass123!",
  };
};

export const registerUser = async (
  user: Required<TestUserInput> = createTestUser(),
) => {
  return request(app).post("/api/auth/register").send(user);
};

export const createAuthenticatedAgent = async (
  user: Required<TestUserInput> = createTestUser(),
): Promise<{
  agent: ReturnType<typeof request.agent>;
  user: Required<TestUserInput>;
  userId: string;
}> => {
  const agent = request.agent(app);

  const registerResponse = await agent.post("/api/auth/register").send(user);

  if (registerResponse.status !== 201) {
    throw new Error(
      `Test user registration failed with status ${registerResponse.status}`,
    );
  }

  const loginResponse = await agent.post("/api/auth/login").send({
    email: user.email,
    password: user.password,
  });

  if (loginResponse.status !== 200) {
    throw new Error(
      `Test user login failed with status ${loginResponse.status}`,
    );
  }

  return {
    agent,
    user,
    userId: String(loginResponse.body.user.id),
  };
};

export const validApplication = {
  company: "Northstar Labs",
  position: "Frontend Engineer",
  location: "Berlin",
  workplaceType: "remote",
  employmentType: "full_time",
  status: "saved",
  technologies: ["React", "TypeScript"],
  notes: "Portfolio test application",
};
