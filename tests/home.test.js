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

describe("GET /articles/section/:id route -> get articles by section", () => {
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app).get("/api/articles/section/1");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> section not found", async () => {
    const response = await request(app).get(
      "/api/articles/section/cdfb5058-c4a5-4cdd-afa5-aa9bd7b5a708"
    );
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Section with ID: cdfb5058-c4a5-4cdd-afa5-aa9bd7b5a708 not found!"
    );
  });
  it("it should return 200 status code -> get articles", async () => {
    const response = await request(app).get(
      "/api/articles/section/4f6b3b2a-14ed-4eba-9ca1-b749b74e965d"
    );
    expect(response.status).toBe(200);
  });
});

describe("GET /articles/writer/:id route -> get articles by writer", () => {
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app).get("/api/articles/writer/1");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> writer not found", async () => {
    const response = await request(app).get(
      "/api/articles/writer/cdfb5058-c4a5-4cdd-afa5-aa9bd7b5a708"
    );
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Writer with ID: cdfb5058-c4a5-4cdd-afa5-aa9bd7b5a708 not found!"
    );
  });
  it("it should return 400 status code -> writer banned", async () => {
    const response = await request(app).get(
      "/api/articles/writer/e674f951-45c8-4dcf-ac86-0fc201e6e7f7"
    );
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "This writer is banned! You can not access to the articles..."
    );
  });
  it("it should return 200 status code -> get articles", async () => {
    const response = await request(app).get(
      "/api/articles/writer/18cfe666-df43-47dc-bf84-aa8010a07504"
    );
    expect(response.status).toBe(200);
  });
});
