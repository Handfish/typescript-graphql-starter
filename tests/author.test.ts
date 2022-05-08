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
    await application.disconnect();
    await application.deInit();
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

  const authorByIdQuery = `query Author($id:String!){
  author(id:$id){
    id
  }
}`;

  // Get Author by Id
  it("should get Author by ID", async () => {
    const response = await request
      .post("/graphql")
      .send({
        query: authorByIdQuery,
        variables: {
          id: authorId,
        },
      })
      .expect(200);

    expect(response.body.data.author).to.be.an("object");
  });

  const createAuthorMutation = `mutation CreateAuthor($options:CreateAuthorInput!){
  createAuthor(options:$options){
    author{
      id
      firstName
    }
  }
}`;

  // Create Author
  it("should create Author", async () => {
    const response = await request
      .post("/graphql")
      .send({
        query: createAuthorMutation,
        variables: {
          options: {
            firstName: "Test",
            middleName: "Middleton",
            lastName: "Person",
          },
        },
      })
      .expect(200);

    author = response.body.data.createAuthor.author;
    authorId = author.id;
    expect(author).to.be.an("object");
    expect(author.firstName).to.be.equal("Test");
  });

  const updateAuthorMutation = `mutation UpdateAuthor($id:String!,$options:CreateAuthorInput!){
  updateAuthor(id:$id,options:$options){
    author{
      id
      firstName
    }
  }
}`;

  // Update Author
  it("should update Author", async () => {
    const response = await request
      .post("/graphql")
      .send({
        query: updateAuthorMutation,
        variables: {
          id: authorId,
          options: {
            firstName: "Test2",
          },
        },
      })
      .expect(200);

    author = response.body.data.updateAuthor.author;
    expect(author).to.be.an("object");
    expect(author.firstName).to.be.equal("Test2");
  });

  const deleteAuthorMutation = `mutation DeleteAuthor($id:String!){
  deleteAuthor(id:$id)
}`;
  // Delete Author
  it("should delete Author", async () => {
    const response = await request
      .post("/graphql")
      .send({
        query: deleteAuthorMutation,
        variables: {
          id: authorId,
        },
      })
      .expect(200);

    expect(response.body.data.deleteAuthor).to.be.true;
  });
});
