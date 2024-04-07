const request = require("supertest");
const app = require("../index");
const db = require("../src/database/db");

const Account = require("../src/models/UsersAccount");
const Notification = require("../src/models/Notification");
const Subscriber = require("../src/models/Subscriber");

require("dotenv").config();

beforeAll(async () => {
  try {
    await db.sync({});
    await Account.sync({ force: true });
    await Notification.sync({ force: true });
    await Subscriber.sync({ force: true });
  } catch (error) {
    console.log(error.message);
  }
}, 30000);

afterAll((done) => {
  db.close();
  done();
});

let account1_id;
let cookie;

describe("POST /api/account route -> create new user", () => {
  it("it should return 201 status code -> create new account successfully", async () => {
    const user = {
      email: "tibulldog14@gmail.com",
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
      email: "tibulldog14@gmail.com",
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
      email: "tibulldog14@gmail.com",
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

/* let productId;

describe("POST /api/admin/create-product route -> create paypal product", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/admin/create-product");
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
  it("it should return 200 status code -> product created", async () => {
    const response = await request(app)
      .post("/api/admin/create-product")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    productId = response.body.data.id;
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

let planId;

describe("POST /api/admin/create-plan route -> create paypal plan", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/admin/create-plan");
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
  it("it should return 200 status code -> plan created", async () => {
    const response = await request(app)
      .post("/api/admin/create-plan")
      .send({
        productId,
      })
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    planId = response.body.data.id;
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
}); */

describe("POST /api/users/create-subscription -> create subscription", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/users/create-subscription");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> success login", async () => {
    const user = {
      email: "tibulldog14@gmail.com",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/users/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 200 status code -> create subscription", async () => {
    const response = await request(app)
      .post("/api/users/create-subscription")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return 200 status code -> subscription updated", async () => {
    const response = await request(app)
      .get("/api/users/payment/success?subscription_id=I-61PCRR119LHU")
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

describe("POST /api/users/cancel-subscription -> cancel subscription", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/users/cancel-subscription");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  it("it should return a 200 status code -> success login", async () => {
    const user = {
      email: "tibulldog14@gmail.com",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/users/login").send(user);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
  });
  it("it should return 200 status code -> not authorized", async () => {
    const response = await request(app)
      .post("/api/users/cancel-subscription")
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
