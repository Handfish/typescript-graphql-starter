import Application from "../src/application";
import { SuperTest, Test } from "supertest";
import { clearDatabase } from "../src/utils/services/clearDatabase.service";
import { TestSeeder } from "../src/database/seeders";

let request: SuperTest<Test>;
let application: Application;

describe("Sample tests", async () => {
  before(async () => {
    application = new Application();
    await application.connect();
    await application.init();
  });

  after(async () => {
    await application.disconnect();
    await application.deInit();
  });

  it("should clear database and seed entities", async () => {
    // Clear database
    const orm = application.orm;
    await clearDatabase(orm);
    // Seed entities
    const seeder = orm.getSeeder();
    await orm.getSchemaGenerator().refreshDatabase();
    await seeder.seed(TestSeeder);
  });
});
