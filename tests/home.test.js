const request = require("supertest");
const app = require("../index");
const db = require("../src/database/db");

beforeAll(async () => {
  try {
    await db.sync({});
  } catch (error) {
    console.log(error.message);
  }
});

afterAll((done) => {
  db.close();
  done();
});

describe("GET /articles route -> get articles", () => {
  it("it should return 200 status code -> get all shown articles", async () => {
    const response = await request(app).get("/api/articles");
    expect(response.status).toBe(200);
  });
});

describe("GET /articles/readers route -> get articles", () => {
  it("it should return 200 status code -> get articles with more readers", async () => {
    const response = await request(app).get("/api/articles/readers");
    expect(response.status).toBe(200);
  });
});

describe("GET /articles/last route -> get last articles", () => {
  it("it should return 200 status code -> get last articles", async () => {
    const response = await request(app).get("/api/articles/last");
    expect(response.status).toBe(200);
  });
});
