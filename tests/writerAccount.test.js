const request = require("supertest");
const app = require("../index");
const db = require("../src/database/db");

const WriterAccount = require("../src/models/WriterAccount");
const Article = require("../src/models/Article");

const { generateText } = require("../src/utils/textGenerator");

beforeAll(async () => {
  try {
    await db.sync({});
    await Article.sync({ force: true });
  } catch (error) {
    console.log(error.message);
  }
}, 30000);

afterAll((done) => {
  db.close();
  done();
});

describe("POST /api/writers/login route -> login process", () => {
  it("it should return a 400 status code -> password parameter is missing", async () => {
    const user = {
      email: "user1@fakeapis.com",
    };

    const response = await request(app).post("/api/writers/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password is missing");
  });
  it("it should return a 400 status code -> email parameter is missing", async () => {
    const user = {
      password: 0,
    };

    const response = await request(app).post("/api/writers/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email is missing");
  });
  it("it should return a 400 status code -> email must be a string", async () => {
    const user = {
      email: 1234,
      password: "Password14!",
    };

    const response = await request(app).post("/api/writers/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email must be a string");
  });
  it("it should return a 400 status code -> email does not have a @", async () => {
    const user = {
      email: "user1email.com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/writers/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format is not valid");
  });
  it("it should return a 400 status code -> email format is not valid", async () => {
    const user = {
      email: "user1@emailcom",
      password: "Password14!",
    };

    const response = await request(app).post("/api/writers/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format is not valid");
  });
  it("it should return a 400 status code -> email second part has a symbol", async () => {
    const user = {
      email: "user1@email.#com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/writers/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format not valid");
  });
  it("it should return a 400 status code -> email second part has a number", async () => {
    const user = {
      email: "user1@email.1com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/writers/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format not valid");
  });
  it("it should return a 404 status code -> email not found", async () => {
    const user = {
      email: "user4@email.com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/writers/login").send(user);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Email address not found!");
  });
  it("it should return a 400 status code -> incorrect password", async () => {
    const user = {
      email: "writer1@newspaper.io",
      password: "Password14@",
    };

    const response = await request(app).post("/api/writers/login").send(user);
    console.log(response.body);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Incorrect password!");
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
  it("it should return a 400 status code -> a user is already logged in", async () => {
    const user = {
      email: "writer1@newspaper.io",
      password: "Password14!",
    };

    const response = await request(app)
      .post("/api/writers/login")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("An user is already logged in!");
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/writers/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
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
  it("it should return a 200 status code -> get logged in account", async () => {
    const response = await request(app)
      .get("/api/writers/account")
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
  it("it should return a 400 status code -> no user logged in", async () => {
    const response = await request(app)
      .get("/api/writers/account")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("No Writer Account logged in");
  });
});

/* describe("PUT /writers/account/image route -> update user image", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/writers/account/image");
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
  it("it should return 400 status code -> image file is missing", async () => {
    const response = await request(app)
      .put(`/api/writers/account/image`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Image file is missing!");
  });
  it("it should return 400 status code -> file type not allowed", async () => {
    const response = await request(app)
      .put(`/api/writers/account/image`)
      .set("Cookie", cookie)
      .attach("image", `${__dirname}/files/file.txt`);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "File format not allowed! Only JPG or PNG..."
    );
  });
  it("it should return 400 status code -> file size not support", async () => {
    const response = await request(app)
      .put(`/api/writers/account/image`)
      .set("Cookie", cookie)
      .attach("image", `${__dirname}/files/heavyimage.jpg`);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("File must be up to 2mb!");
  });
  /*   it("it should return 200 status code -> account image updated successfully", async () => {
    const response = await request(app)
      .put(`/api/writers/account/image`)
      .set("Cookie", cookie)
      .attach("image", `${__dirname}/files/avatar1.png`);
    expect(response.status).toBe(200);
  });
  it("it should return 200 status code -> account image updated successfully", async () => {
    const response = await request(app)
      .put(`/api/writers/account/image`)
      .set("Cookie", cookie)
      .attach("image", `${__dirname}/files/avatar2.png`);
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

describe("DELETE /writers/account/image route -> delete user image", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).delete("/api/writers/account/image");
    expect(response.status).toBe(401);
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
  it("it should return 200 status code -> delete image success", async () => {
    const response = await request(app)
      .delete("/api/writers/account/image")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return 400 status code -> no image", async () => {
    const response = await request(app)
      .delete("/api/writers/account/image")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/writers/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
}); */

let article1_id, article2_id;

describe("POST /api/writers/article route -> create new article", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/writers/article");
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
  it("it should return 400 status code -> title must be a string", async () => {
    const article = {
      title: 1,
      subtitle: 1,
      introduction: 1,
      body: 1,
    };

    const response = await request(app)
      .post("/api/writers/article")
      .send(article)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Title must be a string");
  });
  it("it should return 400 status code -> subtitle parameter is missing", async () => {
    const article = {
      title: "Title Article 1",
      introduction: 1,
      body: 1,
    };

    const response = await request(app)
      .post("/api/writers/article")
      .send(article)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Subtitle is missing");
  });
  it("it should return 400 status code -> subtitle must be a string", async () => {
    const article = {
      title: "Title Article 1",
      subtitle: true,
      introduction: 1,
      body: 1,
    };

    const response = await request(app)
      .post("/api/writers/article")
      .send(article)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Subtitle must be a string");
  });
  it("it should return 400 status code -> introduction parameter is missing", async () => {
    const article = {
      title: "Title Article 1",
      subtitle: "Subtitle Article 1",
      body: 1,
    };

    const response = await request(app)
      .post("/api/writers/article")
      .send(article)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Introduction is missing");
  });
  it("it should return 400 status code -> introduction must be a string", async () => {
    const article = {
      title: "Title Article 1",
      subtitle: "Subtitle Article 1",
      introduction: 1,
      body: 1,
    };

    const response = await request(app)
      .post("/api/writers/article")
      .send(article)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Introduction must be a string");
  });
  it("it should return 400 status code -> body parameter is missing", async () => {
    const article = {
      title: "Title Article 1",
      subtitle: "Subtitle Article 1",
      introduction: "Introduction Article 1",
    };

    const response = await request(app)
      .post("/api/writers/article")
      .send(article)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Body is missing");
  });
  it("it should return 400 status code -> body must be a string", async () => {
    const article = {
      title: "Title Article 1",
      subtitle: "Subtitle Article 1",
      introduction: "Introduction Article 1",
      body: 1,
    };

    const response = await request(app)
      .post("/api/writers/article")
      .send(article)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Body must be a string");
  });
  it("it should return 201 status code -> article created success", async () => {
    const article = {
      title: "Title Article 1",
      subtitle: "Subtitle Article 1",
      introduction: "Introduction Article 1",
      body: generateText(3),
    };

    const response = await request(app)
      .post("/api/writers/article")
      .send(article)
      .set("Cookie", cookie);
    expect(response.status).toBe(201);
    article1_id = response.body.data.id;
  });
  it("it should return 201 status code -> article created success", async () => {
    const article = {
      title: "Title Article 2",
      subtitle: "Subtitle Article 2",
      introduction: "Introduction Article 2",
      body: generateText(2),
    };

    const response = await request(app)
      .post("/api/writers/article")
      .send(article)
      .set("Cookie", cookie);
    expect(response.status).toBe(201);
    article2_id = response.body.data.id;
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/writers/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("PUT /api/writers/article/:id/image route -> update article image", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/writers/article/1/image");
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
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app)
      .put("/api/writers/article/1/image")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> article not found", async () => {
    const response = await request(app)
      .put("/api/writers/article/8b0f595a-9e6f-4fa8-9df7-ef67165dbed4/image")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Article with ID: 8b0f595a-9e6f-4fa8-9df7-ef67165dbed4 not found!"
    );
  });
  it("it should return 400 status code -> image file is missing", async () => {
    const response = await request(app)
      .put(`/api/writers/article/${article1_id}/image`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Image file is missing!");
  });
  it("it should return 400 status code -> file type not allowed", async () => {
    const response = await request(app)
      .put(`/api/writers/article/${article1_id}/image`)
      .attach("image", `${__dirname}/files/file.txt`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "File format not allowed! Only JPG or PNG..."
    );
  });
  /*  it("it should return 200 status code -> article image updated successfully", async () => {
    const response = await request(app)
      .put(`/api/writers/article/${article1_id}/image`)
      .attach("image", `${__dirname}/files/post1.png`)
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe(
      "Your article image was updated successfully!"
    );
  }); */
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/writers/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});
