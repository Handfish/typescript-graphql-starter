import Application from "../src/application";
import { expect } from "chai";
import supertest, { SuperTest, Test } from "supertest";
import { clearDatabase } from "../src/utils/services/clearDatabase.service";
import { TestSeeder } from "../src/database/seeders";
import { Book } from "../src/database/entities";

let request: SuperTest<Test>;
let application: Application;
let bookId: string;
let book: Book;

describe("Book tests", async () => {
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
    // Refresh the database (needed???)
    await orm.getSchemaGenerator().refreshDatabase();
    // Seed using seeders
    await seeder.seed(TestSeeder);
  });

  after(async () => {
    application.close();
  });

  const booksQuery = `query {
              books(limit: 10) {
              id
                author{
                  id
                  firstName
                  lastName
                }
              }
            }`;

  // Get books
  it("should get books", async () => {
    const response = await request
      .post("/graphql")
      .send({
        query: booksQuery,
      })
      .expect(200);

    const books = response.body.data.books;
    bookId = books[0].id;
    expect(books).to.be.a("array");
  });

  const bookIdQuery = `query BookById($id:String!){
  book(id:$id){
    id
    title
    year
    authorId
  }
}`;

  // Get Book by Id
  it("should get book by id", async () => {
    const response = await request
      .post("/graphql")
      .send({
        query: bookIdQuery,
        variables: {
          id: bookId,
        },
      })
      .expect(200);

    book = response.body.data.book;
    expect(response.body.data.book).to.be.a("object");
  });

  const updateBookMutation = `mutation UpdateBook($id:String!,$options:CreateBookInput!){
  updateBook(id:$id,options:$options){
    errors {
      field
      message
    }
    book {
      id
      title
    }
  }
}`;

  // Update Book
  it("should update Book", async () => {
    const title = "Hello World!";
    book.title = title;
    const response = await request
      .post("/graphql")
      .send({
        query: updateBookMutation,
        variables: {
          id: bookId,
          options: {
            title: book.title,
            year: book.year,
            authorId: book.authorId,
          },
        },
      })
      .expect(200);

    const updatedBook = response.body.data.updateBook.book;
    expect(updatedBook).to.be.a("object");
    expect(updatedBook.title).to.be.equal(title);
  });

  const deleteBookMutation = `mutation DeleteBook($id:String!){
  deleteBook(id:$id)
}`;

  // Delete Book
  it("should delete Book", async () => {
    const response = await request
      .post("/graphql")
      .send({
        query: deleteBookMutation,
        variables: {
          id: bookId,
        },
      })
      .expect(200);

    expect(response.body.data.deleteBook).to.be.true;
  });
});
