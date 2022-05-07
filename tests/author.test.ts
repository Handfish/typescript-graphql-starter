import Application from "../src/application";
import { expect } from "chai";
import supertest, { SuperTest, Test } from "supertest";
import { clearDatabase } from "../src/utils/services/clearDatabase.service";
import { TestSeeder } from "../src/database/seeders";
import { Author } from "../src/database/entities";

let request: SuperTest<Test>;
let application: Application;
let authorId: string;
let author: Author;

describe("Author tests", async () => {
  before(async () => {
    application = new Application();
    await application.connect();
    await application.init();
    request = supertest(application.host);
    // Clear database
    const orm = application.orm;
    await clearDatabase(orm);
    // Seed database
    const seeder = orm.getSeeder();
    // Refresh the database
    await orm.getSchemaGenerator().refreshDatabase();
    // Seed using seeders
    await seeder.seed(TestSeeder);
  });

  after(async () => {
    application.close();
  });

  // List Authors
  const authorsQuery = `query Authors($limit:Float!){
  authors(limit:$limit){
    id
    books {
      id
    }
  }
}`;
  it("should get Authors", async () => {
    const response = await request
      .post("/graphql")
      .send({
        query: authorsQuery,
        variables: {
          limit: 10,
        },
      })
      .expect(200);

    const authors = response.body.data.authors;
    authorId = authors[0].id;
    expect(authors).to.be.a("array");
  });
});
