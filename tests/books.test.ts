import "dotenv-safe/config";
import { expect } from "chai";
import { Express } from "express";
import { Server } from "http";
import supertest, { SuperTest, Test } from "supertest";
import { initServer } from "../src/server";
import createSimpleUuid from "../src/utils/helpers/createSimpleUuid.helper";

let request: SuperTest<Test>;
let app: Express;
let server: Server;

describe("Book tests", async () => {
  before(async () => {
    app = await initServer();
    server = app.listen(4001);
    request = supertest(app);
  });

  after(async () => {
    server.close((err) => {
      process.exit(err ? 1 : 0);
    });
  });

  it("should create book", async () => {
    const book = {
      title: "Test Book 2",
      year: 2022,
      authorId: createSimpleUuid(1),
    };
    const response = await request
      .post("/graphql")
      .send({
        query: `mutation {
          createBook(options: {title: "${book.title}", authorId: "${book.authorId}", year: ${book.year}}) {
            book {
              id title year authorId
            }
        }
      }`,
      })
      .expect(200);

    expect(response.body.data.createBook).to.be.a("object");
  });

  it("should get books", async () => {
    const response = await request
      .post("/graphql")
      .send({
        query: `query {
          books(limit: 10) {
            id
            title
          }
        }`,
      })
      .expect(200);

    expect(response.body.data.books).to.be.a("array");
  });
});
