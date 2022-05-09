import Application from "../src/application";
import { expect } from "chai";
import supertest, { SuperTest, Test } from "supertest";
import { clearDatabase } from "../src/utils/services/clearDatabase.service";
import { TestSeeder } from "../src/database/seeders";
import { User } from "../src/database/entities";

let request: SuperTest<Test>;
let application: Application;
let userId: string;
let user: User;

// Init blank variables
let email: string;
let password: string;

describe("User tests", async () => {
  before(async () => {
    application = new Application();
    await application.connect();
    await application.init();
    request = supertest(application.host);
    // Clear database
    const { orm } = application;
    await clearDatabase(orm);
    // Seed database
    const seeder = orm.getSeeder();
    await seeder.seed(TestSeeder);
  });

  after(async () => {
    await application.disconnect();
    await application.deInit();
  });

  // Register User
  const registerMutation = `mutation Register($email:String!,$password:String!) {
    register(email:$email,password:$password)
  }`;
  it("should register User", async () => {
    let email = "test@email.com";
    let password = "test123";
    const response = await request
      .post("/graphql")
      .send({
        query: registerMutation,
        variables: {
          email,
          password,
        },
      })
      .expect(200);
    expect(response.body.data.register).to.be.true;
  });

  // Logout test

  // Login test

  // `me` Query
});
