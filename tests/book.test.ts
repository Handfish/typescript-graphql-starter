import Application from "../src/application";
import { expect } from "chai";
import supertest, { SuperTest, Test } from "supertest";
import { clearDatabase } from "../src/utils/services/clearDatabase.service";
import { TestSeeder } from "../src/database/seeders";

let request: SuperTest<Test>;
let application: Application;

describe("Book tests", async () => {
  before(async () => {
    application = new Application();
    await application.connect();
    await application.init();

    request = supertest(application.host);
  });

  beforeEach(async () => {
    // Clear database
    const orm = application.orm;
    await clearDatabase(orm);
    // Seed database
    const seeder = orm.getSeeder();
    // Refresh the database (needed???)
    await orm.getSchemaGenerator().refreshDatabase();
    // Seed using seeders
    await seeder.seed(TestSeeder);
  });

  after(async () => {
    application.close();
  });

  it("should get books", async () => {
    const response = await request
      .post("/graphql")
      .send({
        query: `query {
              books(limit: 10) {
              id
                author{
                  id
                  firstName
                  lastName
                }
              }
            }`,
      })
      .expect(200);

    expect(response.body.data.books).to.be.a("array");
  });
});
