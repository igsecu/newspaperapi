const request = require("supertest");
const app = require("../index");
const db = require("../src/database/db");

const { generateText } = require("../src/utils/textGenerator");

beforeAll(async () => {
  try {
    await db.sync({ force: true });
  } catch (error) {
    console.log(error.message);
  }
});

afterAll((done) => {
  db.close();
  done();
});

let cookie;

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
  });
});

describe("GET /api/admin/sections route -> get all sections", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/admin/sections");
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
  it("it should return 404 status code -> no sections", async () => {
    const response = await request(app)
      .get("/api/admin/sections")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("No sections saved in DB!");
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("POST /api/admin/section route -> create new section", () => {
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
  for (let x = 1; x <= 5; x++) {
    it("it should return 201 status code -> section created success", async () => {
      const section = {
        name: `Section ${x}`,
      };
      const response = await request(app)
        .post("/api/admin/section")
        .send(section)
        .set("Cookie", cookie);
      expect(response.status).toBe(201);
      expect(response.body.msg).toBe("Section created successfully!");
    });
  }
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

let sections;

describe("GET /api/admin/sections route -> get all sections", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/admin/sections");
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
  it("it should return 200 status code -> get sections", async () => {
    const response = await request(app)
      .get("/api/admin/sections")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    sections = response.body.data;
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("GET /api/admin/writers route -> get all writers", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/admin/writers");
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
  it("it should return 404 status code -> no writers", async () => {
    const response = await request(app)
      .get("/api/admin/writers")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("No writers saved in DB!");
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
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
  for (let x = 1; x <= 10; x++) {
    it("it should return 201 status code -> create new account successfully", async () => {
      const sectionPosition = Math.floor(Math.random() * sections.length);
      const sectionId = sections[sectionPosition].id;

      const user = {
        email: `writer${x}@newspaper.io`,
        password: "F4k3ap1s.io",
        password2: "F4k3ap1s.io",
        sectionId: sectionId,
      };

      const response = await request(app)
        .post("/api/admin/writer/account")
        .send(user)
        .set("Cookie", cookie);

      expect(response.status).toBe(201);
      expect(response.body.msg).toBe("Account created successfully!");
    });
  }

  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

let writers;

describe("GET /api/admin/writers route -> get all writers", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/admin/writers");
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
  it("it should return 200 status code -> get writers", async () => {
    const response = await request(app)
      .get("/api/admin/writers?limit=5")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    writers = response.body.data;
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("GET /api/admin/writers/banned/true route -> get banned writers", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/admin/writers/banned/true");
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
  it("it should return 404 status code -> no banned writers", async () => {
    const response = await request(app)
      .get("/api/admin/writers/banned/true")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("No banned writers saved in DB!");
  });
  it("it should return 200 status code -> ban writer", async () => {
    const writerPosition = Math.floor(Math.random() * writers.length);
    const writerId = writers[writerPosition].id;

    const response = await request(app)
      .put(`/api/admin/writer/${writerId}?banned=true`)
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.isBanned).toBe(true);
  });
  it("it should return 200 status code -> get banned writers", async () => {
    const response = await request(app)
      .get("/api/admin/writers/banned/true")
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

describe("GET /api/admin/writers/banned/false route -> get not banned writers", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/admin/writers/banned/false");
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
  it("it should return 200 status code -> get not banned writers", async () => {
    const response = await request(app)
      .get("/api/admin/writers/banned/false")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    writers = response.body.data;
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("GET /api/admin/articles route -> get all articles", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/admin/articles");
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
  it("it should return 404 status code -> no articles", async () => {
    const response = await request(app)
      .get("/api/admin/articles")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("No articles saved in DB!");
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("POST /api/writers/article route -> create new article", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).post("/api/writers/article");
    expect(response.status).toBe(401);
    expect(response.body.msg).toBe("You are not authorized! Please login...");
  });
  for (let x = 1; x < 25; x++) {
    it("it should return a 200 status code -> user logged in", async () => {
      const writerPosition = Math.floor(Math.random() * writers.length);
      const writerEmail = writers[writerPosition].email;

      const user = {
        email: writerEmail,
        password: "F4k3ap1s.io",
      };

      const response = await request(app).post("/api/writers/login").send(user);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You logged in successfully");
      cookie = response.headers["set-cookie"];
    });
    it("it should return 201 status code -> article created success", async () => {
      const article = {
        title: `Title Article ${x}`,
        subtitle: `Subtitle Article ${x}`,
        introduction: `Introduction Article ${x}`,
        body: generateText(3),
      };
      const response = await request(app)
        .post("/api/writers/article")
        .send(article)
        .set("Cookie", cookie);
      expect(response.status).toBe(201);
    });
    it("it should return a 200 status code -> logout process", async () => {
      const response = await request(app)
        .get("/api/writers/logout")
        .set("Cookie", cookie);
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("You successfully logged out!");
    });
  }
});

let articles;

describe("GET /api/admin/articles route -> get all articles", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/admin/articles");
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
  it("it should return 200 status code -> get articles", async () => {
    const response = await request(app)
      .get("/api/admin/articles")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    articles = response.body.data;
  });
  it("it should return 404 status code -> no shown articles", async () => {
    const response = await request(app)
      .get("/api/admin/articles/shown/true")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("No shown articles saved in DB!");
  });
  it("it should return 404 status code -> no articles for subscribers", async () => {
    const response = await request(app)
      .get("/api/admin/articles/subscribers/true")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("No articles for subscribers saved in DB!");
  });
  it("it should return 200 status code -> article updated success", async () => {
    const articlePosition = Math.floor(Math.random() * articles.length);
    const articleId = articles[articlePosition].id;

    const response = await request(app)
      .put(`/api/admin/article/${articleId}?shown=true`)
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return 200 status code -> article updated success", async () => {
    const articlePosition = Math.floor(Math.random() * articles.length);
    const articleId = articles[articlePosition].id;

    const response = await request(app)
      .put(`/api/admin/article/${articleId}?subscribers=true`)
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return 200 status code -> get shown articles", async () => {
    const response = await request(app)
      .get("/api/admin/articles/shown/true")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return 200 status code -> get articles for subscribers", async () => {
    const response = await request(app)
      .get("/api/admin/articles/subscribers/true")
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

describe("GET /api/admin/users route -> get all users", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/admin/users");
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
  it("it should return 404 status code -> no users", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Cookie", cookie);
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("No users saved in DB!");
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

let users;

describe("POST /api/account route -> create new user", () => {
  for (let x = 1; x <= 10; x++) {
    it("it should return 201 status code -> create new account successfully", async () => {
      const user = {
        email: `user${x}@newspaper.io`,
        password: "F4k3ap1s.io",
        password2: "F4k3ap1s.io",
      };

      const response = await request(app).post("/api/users/account").send(user);

      expect(response.status).toBe(201);
      expect(response.body.msg).toBe("Account created successfully!");
    });
  }
});

describe("GET /api/admin/users route -> get all users", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/admin/users");
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
  it("it should return 200 status code -> get users", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    users = response.body.data;
  });
  it("it should return a 200 status code -> logout process", async () => {
    const response = await request(app)
      .get("/api/admin/logout")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You successfully logged out!");
  });
});

describe("GET /api/users/account/:id/verify -> verify account", () => {
  for (let x = 0; x < 2; x++) {
    it("it should return 200 status code -> verify account success", async () => {
      const response = await request(app).get(
        `/api/users/account/${users[x].id}/verify`
      );
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe("Your account is now verified!");
    });
  }
});

describe("PUT /api/admin/user/:id route -> update user account", () => {
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
  it("it should return 200 status code -> account updated", async () => {
    const response = await request(app)
      .put(`/api/admin/user/${users[0].id}?banned=TrUe`)
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

describe("POST /api/users/create-subscription -> create subscription", () => {
  it("it should return a 200 status code -> success login", async () => {
    const user = {
      email: "user9@newspaper.io",
      password: "F4k3ap1s.io",
    };

    const response = await request(app).post("/api/users/login").send(user);
    console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("You logged in successfully");
    cookie = response.headers["set-cookie"];
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

describe("GET /api/admin/users/filter route -> get filtered users", () => {
  it("it should return 401 status code -> not authorized", async () => {
    const response = await request(app).get("/api/admin/users/filter");
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
  it("it should return 200 status code -> get users", async () => {
    const response = await request(app)
      .get("/api/admin/users/filter?banned=true")
      .set("Cookie", cookie);
    expect(response.status).toBe(200);
  });
  it("it should return 200 status code -> get users", async () => {
    const response = await request(app)
      .get("/api/admin/users/filter?subscriber=true")
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
