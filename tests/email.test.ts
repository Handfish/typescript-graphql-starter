import "dotenv-safe/config";
import Application from "../src/application";
import supertest, { SuperTest, Test } from "supertest";
import { clearDatabase } from "../src/utils/services/clearDatabase.service";
import { UserFactory } from "../src/database/factories";
import { createConfirmEmailLink } from "../src/utils/services/email.service";
import { expect } from "chai";
import { User } from "../src/database/entities";
import e from "express";
import { exit } from "process";

let app: Application;
let request: SuperTest<Test>;
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
    const em = app.orm.em.fork();
    const user = new UserFactory(em).makeOne();
    await em.persistAndFlush(user);
    userId = user.id;
  });

  after(async () => {
    await app.disconnect();
    await app.deInit();
  });

  it("Make sure email confirmation links work", async () => {
    // Construct confirm link
    const url = await createConfirmEmailLink("", userId, app.redis);
    // Make GET request to confirm link
    const response = await request.get(url).expect(200);
    const text = response.text;
    expect(text).to.equal("OK");
  });
});
