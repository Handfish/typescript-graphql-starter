import "dotenv-safe/config";
import Application from "../src/application";
import supertest, { SuperTest, Test } from "supertest";
import { clearDatabase } from "../src/utils/services/clearDatabase.service";
import { UserFactory } from "../src/database/factories";
import { createConfirmEmailLink } from "../src/utils/services/email.service";
import { expect } from "chai";
import { User } from "../src/database/entities";
import { EntityManager, wrap } from "@mikro-orm/core";

let app: Application;
let request: SuperTest<Test>;
let em: EntityManager;
let userId: string;

describe("Email tests", () => {
  before(async () => {
    app = new Application();
    await app.connect();
    await app.init();
    // Init supertest
    request = supertest(app.host);
    // Clear & Refresh database
    const orm = app.orm;
    await clearDatabase(orm);
    await orm.getSchemaGenerator().refreshDatabase();
    // Create a temporary User
    em = app.orm.em;
    const user = new UserFactory(em).makeOne({ confirmed: false });
    userId = user.id;
  });

  after(async () => {
    await app.disconnect();
    await app.deInit();
  });

  it("Confirmation links work", async () => {
    const redis = app.redis;
    // Construct confirm link
    const url = await createConfirmEmailLink("", userId, redis);
    // Make GET request to confirm link
    const response = await request.get(url).expect(200);
    const text = response.text;
    expect(text).to.equal("OK");
    // Makre sure User was marked as `confirmed`
    const user = await em.findOne(User, { id: userId });
    expect(user.confirmed).to.be.true;
    // Check if ID is still in redis
    const chunks = url.split("/");
    const key = chunks[chunks.length - 1];
    const value = await redis.get(key);
    expect(value).to.be.null;
  });

  it("sends `invalid` back if bad link", async () => {
    const response = await request.get("/confirm/123").expect(400);
    const text = response.text;
    expect(text).to.be.equal("Invalid");
  });
});
