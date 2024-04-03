const request = require("supertest");
const app = require("../index");
const db = require("../src/database/db");

const AdminAccount = require("../src/models/AdminAccount");
const WriterAccount = require("../src/models/WriterAccount");

beforeAll(async () => {
  try {
    await db.sync({});
    await AdminAccount.sync({ force: true });
    await WriterAccount.sync({ force: true });
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
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "writer1@newspaper.io",
      password: "F4k3ap1s.io",
      password2: "F4k3ap1s.io",
    };

    const response = await request(app)
      .post("/api/admin/writer/account")
      .send(user)
      .set("Cookie", cookie);

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe("Account created successfully!");
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
