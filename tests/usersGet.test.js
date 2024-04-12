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

let cookie;

describe("POST /users/comment route -> create new comment", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/users/comment");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "user9@newspaper.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/users/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 400 status code -> article id is missing", async () => {
    const comment = {
      articleId: 0,
      text: 1,
    };

    const response = await request(app)
      .post("/api/users/comment")
      .send(comment)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("articleId is missing");
  });
  it("it should return 400 status code -> article id invalid format", async () => {
    const comment = {
      articleId: 1,
      text: 1,
    };

    const response = await request(app)
      .post("/api/users/comment")
      .send(comment)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("articleId: 1 - Invalid format!");
  });
  it("it should return 400 status code -> text parameter is missing", async () => {
    const comment = {
      articleId: "61b0461d-fff8-4524-adb6-46f4efaf94b3",
      text: 0,
    };

    const response = await request(app)
      .post("/api/users/comment")
      .send(comment)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Text is missing");
  });
  it("it should return 400 status code -> text must be a string", async () => {
    const comment = {
      articleId: "61b0461d-fff8-4524-adb6-46f4efaf94b3",
      text: 1,
    };

    const response = await request(app)
      .post("/api/users/comment")
      .set("Cookie", cookie)
      .send(comment);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Text must be a string");
  });
  it("it should return 404 status code -> article not found", async () => {
    const comment = {
      articleId: "61b0461d-fff8-4524-adb6-46f4efaf94b3",
      text: "New Comment",
    };

    const response = await request(app)
      .post("/api/users/comment")
      .set("Cookie", cookie)
      .send(comment);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Article with ID: 61b0461d-fff8-4524-adb6-46f4efaf94b3 not found!"
    );
  });
  it("it should return 201 status code -> create comment", async () => {
    const comment = {
      articleId: "3636fa35-1c08-4105-87ba-136d22bf822d",
      text: "New Comment",
    };

    const response = await request(app)
      .post("/api/users/comment")
      .set("Cookie", cookie)
      .send(comment);
    expect(response.status).toBe(201);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/users/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});
