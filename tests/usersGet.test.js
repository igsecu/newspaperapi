const request = require("supertest");
const app = require("../index");
const db = require("../src/database/db");

const Account = require("../src/models/UsersAccount");
const Notification = require("../src/models/Notification");

beforeAll(async () => {
  try {
    await db.sync({});
    await Account.sync({ force: true });
    await Notification.sync({ force: true });
  } catch (error) {
    console.log(error.message);
  }
});

afterAll((done) => {
  db.close();
  done();
});

let cookie;

/* describe("POST /users/comment route -> create new comment", () => {
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

describe("GET /users/article/:id route -> get article by id", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/users/article/1");
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
  it("it should return 400 status code -> article id invalid format", async () => {
    const response = await request(app)
      .get("/api/users/article/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> article not found", async () => {
    const response = await request(app)
      .get("/api/users/article/cdfb5058-c4a5-4cdd-afa5-aa9bd7b5a708")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Article with ID: cdfb5058-c4a5-4cdd-afa5-aa9bd7b5a708 not found!"
    );
  });
  it("it should return 200 status code -> get article", async () => {
    const response = await request(app)
      .get("/api/users/article/c49fb391-530b-40b0-b712-5923cc5ca0a2")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return 200 status code -> get articles with more readers", async () => {
    const response = await request(app).get("/api/articles/readers");
    expect(response.status).toBe(200);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/users/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("GET /users/comments/article/:id route -> get article comments", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/users/comments/article/1");
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
  it("it should return 400 status code -> article not found", async () => {
    const response = await request(app)
      .get("/api/users/comments/article/0c803aaf-c56e-40c7-b344-7ca95aa510e1")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Article with ID: 0c803aaf-c56e-40c7-b344-7ca95aa510e1 not found!"
    );
  });
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app)
      .get("/api/users/comments/article/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> no comments", async () => {
    const response = await request(app)
      .get("/api/users/comments/article/11b0706b-a690-440d-ad20-9ebfda1e3708")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("There are no comments in this article!");
  });
  it("it should return 200 status code -> get comments", async () => {
    const response = await request(app)
      .get("/api/users/comments/article/3636fa35-1c08-4105-87ba-136d22bf822d")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/users/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
}); */

let account1_id;

describe("POST /api/account route -> create new user", () => {
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: `user1@gmail.com`,
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/users/account").send(user);

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
    account1_id = response.body.data.id;
  });
});

describe("POST /api/login route -> login process", () => {
  it("it should return a 400 status code -> user account not verified", async () => {
    const user = {
      email: "user1@gmail.com",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/users/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Please verify your account!");
  });
});

describe("GET /api/users/account/:id/verify -> verify account", () => {
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app).get("/api/users/account/1/verify");
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> id invalid format", async () => {
    const response = await request(app).get(
      "/api/users/account/d7d6829e-06ec-4e9e-b16d-cab08ba34141/verify"
    );
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Account with ID: d7d6829e-06ec-4e9e-b16d-cab08ba34141 not found!"
    );
  });
  it("it should return 200 status code -> verify account success", async () => {
    const response = await request(app).get(
      `/api/users/account/${account1_id}/verify`
    );
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("Your account is now verified!");
  });
});

describe("POST /api/login route -> login process", () => {
  it("it should return a 200 status code -> success login", async () => {
    const user = {
      email: "user1@gmail.com",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/users/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return a 200 status code -> get logged in account", async () => {
    const response = await request(app)
      .get("/api/users/account")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/users/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

let notification1_id;

describe("GET /users/notifications route -> get notifications", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/users/notifications");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "user1@gmail.com",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/users/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 200 status code -> get notifications", async () => {
    const response = await request(app)
      .get("/api/users/notifications")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    notification1_id = response.body.data[0].id;
  });
  it("it should return 200 status code -> get not notifications", async () => {
    const response = await request(app)
      .get("/api/users/notifications/read/false")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return 200 status code -> notifications updated", async () => {
    const response = await request(app)
      .put("/api/users/notifications/read/true")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return 404 status code -> no notifications", async () => {
    const response = await request(app)
      .put("/api/users/notifications/read/true")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("You do not have not read notifications!");
  });
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app)
      .delete("/api/users/notification/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> notification not found", async () => {
    const response = await request(app)
      .delete("/api/users/notification/ed40a982-13f4-4580-8c54-40693f00bc79")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Notification with ID: ed40a982-13f4-4580-8c54-40693f00bc79 not found!"
    );
  });
  it("it should return 200 status code -> notification deleted", async () => {
    const response = await request(app)
      .delete(`/api/users/notification/${notification1_id}`)
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("Notification deleted successfully!");
  });
  it("it should return 404 status code -> no notifications", async () => {
    const response = await request(app)
      .get("/api/users/notifications")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("You do not have notifications!");
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/users/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});
