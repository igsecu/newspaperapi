const request = require("supertest");
const app = require("../index");
const db = require("../src/database/db");

const AdminAccount = require("../src/models/AdminAccount");
const WriterAccount = require("../src/models/WriterAccount");
const Section = require("../src/models/Section");
const Article = require("../src/models/Article");
const UsersAccount = require("../src/models/UsersAccount");
const Notification = require("../src/models/Notification");

const { generateText } = require("../src/utils/textGenerator");

beforeAll(async () => {
  try {
    await db.sync({});
    await AdminAccount.sync({ force: true });
    await WriterAccount.sync({ force: true });
    await Section.sync({ force: true });
    await Article.sync({ force: true });
    await UsersAccount.sync({ force: true });
    await Notification.sync({ force: true });
  } catch (error) {
    console.log(error.message);
  }
}, 30000);

afterAll((done) => {
  db.close();
  done();
});

let cookie;

describe("POST /api/admin/account route -> parameter validations", () => {
  it("it should return 400 status code -> password must be a string", async () => {
    const user = {
      password: 1234,
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must be a string");
  });
  it("it should return 400 status code -> password is missing", async () => {
    const user = {
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password is missing");
  });
  it("it should return 400 status code -> password must be at least 8 characters long", async () => {
    const user = {
      password: "1234",
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "Password must be at least 8 characters long"
    );
  });
  it("it should return 400 status code -> password must have one capital letter", async () => {
    const user = {
      password: "password",
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must have one capital letter");
  });
  it("it should return 400 status code -> password must have one number", async () => {
    const user = {
      password: "Password",
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must have one number");
  });
  it("it should return 400 status code -> password must have one symbol", async () => {
    const user = {
      password: "Password14",
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must have one symbol");
  });
  it("it should return 400 status code -> password must have one small letter", async () => {
    const user = {
      password: "PASSWORD14!",
      email: "user1@email.com",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must have one small letter");
  });
  it("it should return 400 status code -> email parameter is missing", async () => {
    const user = {};

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email is missing");
  });
  it("it should return 400 status code -> email must be a string", async () => {
    const user = {
      email: 1234,
      password: "Password14!",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email must be a string");
  });
  it("it should return 400 status code -> email does not have a @", async () => {
    const user = {
      email: "user1email.com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format is not valid");
  });
  it("it should return 400 status code -> email format is not valid", async () => {
    const user = {
      email: "user1@emailcom",
      password: "Password14!",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format is not valid");
  });
  it("it should return 400 status code -> email second part has a symbol", async () => {
    const user = {
      email: "user1@email.#com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format not valid");
  });
  it("it should return 400 status code -> email second part has a number", async () => {
    const user = {
      email: "user1@email.1com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format not valid");
  });
  it("it should return a 400 status code -> password confirmation parameter is missing", async () => {
    const user = {
      email: "user1@email.com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password Confirmation is missing");
  });
  it("it should return a 400 status code -> password and password confirmation not match", async () => {
    const user = {
      email: "user1@email.com",
      password: "Password14!",
      password2: "Password14@",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "Password and Password Confirmation not match"
    );
  });
});

let account1_id;

describe("POST /api/admin/account route -> create new user", () => {
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "admin@newspaper.io",
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/admin/account").send(user);

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
    account1_id = response.body.data.id;
  });
});

describe("POST /api/admin/account route -> check if email exists", () => {
  it("it should return a 400 status code -> email exists", async () => {
    const user = {
      email: "admin@newspaper.io",
      password: "Password14!",
      password2: "Password14!",
    };

    const response = await request(app).post("/api/admin/account").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      `Email "admin@newspaper.io" exists! Try with another one!`
    );
  });
});

describe("POST /api/login route -> login process", () => {
  it("it should return a 400 status code -> password parameter is missing", async () => {
    const user = {
      email: "user1@fakeapis.com",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password is missing");
  });
  it("it should return a 400 status code -> email parameter is missing", async () => {
    const user = {
      password: 0,
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email is missing");
  });
  it("it should return a 400 status code -> email must be a string", async () => {
    const user = {
      email: 1234,
      password: "Password14!",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email must be a string");
  });
  it("it should return a 400 status code -> email does not have a @", async () => {
    const user = {
      email: "user1email.com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format is not valid");
  });
  it("it should return a 400 status code -> email format is not valid", async () => {
    const user = {
      email: "user1@emailcom",
      password: "Password14!",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format is not valid");
  });
  it("it should return a 400 status code -> email second part has a symbol", async () => {
    const user = {
      email: "user1@email.#com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format not valid");
  });
  it("it should return a 400 status code -> email second part has a number", async () => {
    const user = {
      email: "user1@email.1com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format not valid");
  });
  it("it should return a 404 status code -> email not found", async () => {
    const user = {
      email: "user4@email.com",
      password: "Password14!",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Email address not found!");
  });
  it("it should return a 400 status code -> incorrect password", async () => {
    const user = {
      email: "admin@newspaper.io",
      password: "Password14@",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    console.log(response.body);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Incorrect password!");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "admin@newspaper.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return a 400 status code -> a user is already logged in", async () => {
    const user = {
      email: "user116@email.com",
      password: "Password14!",
    };

    const response = await request(app)
      .post("/api/admin/login")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("An user is already logged in!");
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "admin@newspaper.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return a 200 status code -> get logged in account", async () => {
    const response = await request(app)
      .get("/api/admin/account")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
  it("it should return a 400 status code -> no user logged in", async () => {
    const response = await request(app)
      .get("/api/admin/account")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("No Admin Account logged in");
  });
});

let section1_id, section2_id;

describe("POST /api/admin/section route -> create new section", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/admin/section");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "admin@newspaper.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 400 status code -> name parameter is missing", async () => {
    const section = {};
    const response = await request(app)
      .post("/api/admin/section")
      .send(section)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Name is missing");
  });
  it("it should return 400 status code -> name must be a string", async () => {
    const section = {
      name: true,
    };
    const response = await request(app)
      .post("/api/admin/section")
      .send(section)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Name must be a string");
  });
  it("it should return 201 status code -> section created success", async () => {
    const section = {
      name: "Section 1",
    };
    const response = await request(app)
      .post("/api/admin/section")
      .send(section)
      .set("Cookie", cookie);
    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Section created successfully!");
    expect(response.body.data.name).toBe("Section 1");
    section1_id = response.body.data.id;
  });
  it("it should return 400 status code -> section exists", async () => {
    const section = {
      name: "section 1",
    };
    const response = await request(app)
      .post("/api/admin/section")
      .send(section)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "Section section 1 exists! Try with another name..."
    );
  });
  it("it should return 201 status code -> section created success", async () => {
    const section = {
      name: "sECTION 2",
    };
    const response = await request(app)
      .post("/api/admin/section")
      .send(section)
      .set("Cookie", cookie);
    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Section created successfully!");
    expect(response.body.data.name).toBe("Section 2");
    section2_id = response.body.data.id;
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

let writer1_id;

describe("POST /api/admin/writer/account route -> create new writer account", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/admin/writer/account");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "admin@newspaper.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 400 status code -> password must be a string", async () => {
    const user = {
      password: 1234,
      email: "user1@email.com",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must be a string");
  });
  it("it should return 400 status code -> password is missing", async () => {
    const user = {
      email: "user1@email.com",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password is missing");
  });
  it("it should return 400 status code -> password must be at least 8 characters long", async () => {
    const user = {
      password: "1234",
      email: "user1@email.com",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "Password must be at least 8 characters long"
    );
  });
  it("it should return 400 status code -> password must have one capital letter", async () => {
    const user = {
      password: "password",
      email: "user1@email.com",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must have one capital letter");
  });
  it("it should return 400 status code -> password must have one number", async () => {
    const user = {
      password: "Password",
      email: "user1@email.com",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must have one number");
  });
  it("it should return 400 status code -> password must have one symbol", async () => {
    const user = {
      password: "Password14",
      email: "user1@email.com",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must have one symbol");
  });
  it("it should return 400 status code -> password must have one small letter", async () => {
    const user = {
      password: "PASSWORD14!",
      email: "user1@email.com",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password must have one small letter");
  });
  it("it should return 400 status code -> email parameter is missing", async () => {
    const user = {};

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email is missing");
  });
  it("it should return 400 status code -> email must be a string", async () => {
    const user = {
      email: 1234,
      password: "Password14!",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email must be a string");
  });
  it("it should return 400 status code -> email does not have a @", async () => {
    const user = {
      email: "user1email.com",
      password: "Password14!",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format is not valid");
  });
  it("it should return 400 status code -> email format is not valid", async () => {
    const user = {
      email: "user1@emailcom",
      password: "Password14!",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format is not valid");
  });
  it("it should return 400 status code -> email second part has a symbol", async () => {
    const user = {
      email: "user1@email.#com",
      password: "Password14!",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format not valid");
  });
  it("it should return 400 status code -> email second part has a number", async () => {
    const user = {
      email: "user1@email.1com",
      password: "Password14!",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Email format not valid");
  });
  it("it should return a 400 status code -> password confirmation parameter is missing", async () => {
    const user = {
      email: "user1@email.com",
      password: "Password14!",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Password Confirmation is missing");
  });
  it("it should return a 400 status code -> password and password confirmation not match", async () => {
    const user = {
      email: "user1@email.com",
      password: "Password14!",
      password2: "Password14@",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "Password and Password Confirmation not match"
    );
  });
  it("it should return a 400 status code -> sectionId is missing", async () => {
    const user = {
      email: "user1@email.com",
      password: "Password14!",
      password2: "Password14!",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("sectionId is missing");
  });
  it("it should return a 400 status code -> sectionId invalid format", async () => {
    const user = {
      email: "user1@email.com",
      password: "Password14!",
      password2: "Password14!",
      sectionId: 1,
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("sectionId: 1 - Invalid format!");
  });
  it("it should return a 404 status code -> section not found", async () => {
    const user = {
      email: "user1@email.com",
      password: "Password14!",
      password2: "Password14!",
      sectionId: "41343c71-c8c6-4614-96fb-ef8cfb8ea725",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Section with ID: 41343c71-c8c6-4614-96fb-ef8cfb8ea725 not found!"
    );
  });
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "writer1@newspaper.io",
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
      sectionId: section1_id,
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
    writer1_id = response.body.data.id;
  });
  it("it should return a 400 status code -> email exists", async () => {
    const user = {
      email: "writer1@newspaper.io",
      password: "Password14!",
      password2: "Password14!",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      `Email "writer1@newspaper.io" exists! Try with another one!`
    );
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

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

let user1_id, user2_id, user3_id;

describe("POST /api/account route -> create new user", () => {
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "user1@padely.io",
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/users/account").send(user);

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
    user1_id = response.body.data.id;
  });
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "user2@padely.io",
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/users/account").send(user);

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
    user2_id = response.body.data.id;
  });
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "USER3@padely.io",
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/users/account").send(user);
    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
    user3_id = response.body.data.id;
  });
});

describe("PUT /api/admin/article/:id route -> update article", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/admin/article/1");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "admin@newspaper.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app)
      .put("/api/admin/article/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 404 status code -> article not found", async () => {
    const response = await request(app)
      .put("/api/admin/article/fa1c1745-5a24-414e-8dec-84504484786f?shown=true")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Article with ID: fa1c1745-5a24-414e-8dec-84504484786f not found!"
    );
  });
  it("it should return 400 status code -> query paramer not found", async () => {
    const response = await request(app)
      .put(`/api/admin/article/${article1_id}`)
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Query parameter is missing!");
  });
  it("it should return 200 status code -> article updated success", async () => {
    const response = await request(app)
      .put(`/api/admin/article/${article1_id}?shown=true&subscribers=true`)
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("PUT /api/admin/user/:id route -> update user account", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/admin/user/1");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "admin@newspaper.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app)
      .put("/api/admin/user/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 400 status code -> query parameter is missing", async () => {
    const response = await request(app)
      .put("/api/admin/user/fa1c1745-5a24-414e-8dec-84504484786f")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Query parameter is missing");
  });
  it("it should return 404 status code -> account not found", async () => {
    const response = await request(app)
      .put("/api/admin/user/fa1c1745-5a24-414e-8dec-84504484786f?banned=true")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Account with ID: fa1c1745-5a24-414e-8dec-84504484786f not found!"
    );
  });
  it("it should return 200 status code -> account updated", async () => {
    const response = await request(app)
      .put(`/api/admin/user/${user1_id}?banned=TrUe`)
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("PUT /api/admin/writer/:id route -> update writer account", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).put("/api/admin/writer/1");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> user logged in", async () => {
    const user = {
      email: "admin@newspaper.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/admin/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 400 status code -> id invalid format", async () => {
    const response = await request(app)
      .put("/api/admin/writer/1")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("ID: 1 - Invalid format!");
  });
  it("it should return 400 status code -> query parameter is missing", async () => {
    const response = await request(app)
      .put("/api/admin/writer/fa1c1745-5a24-414e-8dec-84504484786f")
      .set("Cookie", cookie);
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe("Query parameter is missing");
  });
  it("it should return 404 status code -> account not found", async () => {
    const response = await request(app)
      .put("/api/admin/writer/fa1c1745-5a24-414e-8dec-84504484786f?banned=true")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe(
      "Account with ID: fa1c1745-5a24-414e-8dec-84504484786f not found!"
    );
  });
  it("it should return 200 status code -> account updated", async () => {
    const response = await request(app)
      .put(`/api/admin/writer/${writer1_id}?banned=TrUe`)
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});
