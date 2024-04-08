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

let cookie, articles;

describe("GET /api/writers/articles route -> get own articles", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/writers/articles");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "writer1@newspaper.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/writers/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 200 status code -> get articles", async () => {
    const response = await request(app)
      .get("/api/writers/articles")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    articles = response.body.data;
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/writers/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("GET /apit/writers/article/:id route -> get article by id", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/writers/article/1");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "writer1@newspaper.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/writers/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 400 status code -> not authorized", async () => {
    const response = await request(app)
      .get("/api/writers/article/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> article not found", async () => {
    const response = await request(app)
      .get("/api/writers/article/96c5c99e-d9e6-433a-93fa-00d284ff92aa")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Article with ID: 96c5c99e-d9e6-433a-93fa-00d284ff92aa not found!"
    );
  });
  it("it should return 400 status code -> article not yours", async () => {
    const response = await request(app)
      .get("/api/writers/article/11b0706b-a690-440d-ad20-9ebfda1e3708")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "You can not access to an article that is not yours!"
    );
  });
  it("it should return 200 status code -> get article", async () => {
    const response = await request(app)
      .get("/api/writers/article/c49fb391-530b-40b0-b712-5923cc5ca0a2")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/writers/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});
