import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Author, Book, BookCategory } from "../entities";
import { BaseResponse, MyContext } from "../utils/types";

@ObjectType()
class BookResponse extends BaseResponse {
  @Field(() => Book, { nullable: true })
  book?: Book;
}

@InputType()
class CreateBookInput {
  @Field()
  title: string;

  @Field(() => Int, { nullable: true })
  year?: number;

  @Field()
  authorId: string;
}

@Resolver(Book)
export class BookResolver {
  @FieldResolver(() => Author, { nullable: true })
  author(@Root() book: Book, @Ctx() { authorLoader }: MyContext) {
    if (book.author) {
      return authorLoader.load(book.authorId);
    } else {
      return null;
    }
  }

  @FieldResolver(() => [BookCategory], { nullable: true })
  categories(@Root() book: Book, @Ctx() { bookCategoryLoader }: MyContext) {
    if (book.categories) {
      return bookCategoryLoader.loadMany(book.categories.getIdentifiers());
    } else {
      return null;
    }
  }

  @Query(() => Book, { nullable: true })
  async book(@Ctx() { em }: MyContext, @Arg("id") id: string) {
    const book = em.findOne(Book, { id });
    if (!book) {
      return null;
    }
    return { book };
  }

  @Mutation(() => BookResponse, { nullable: true })
  async createBook(
    @Arg("options") options: CreateBookInput,
    @Ctx() { em }: MyContext
  ) {
    if (options.title.length === 0) {
      return {
        errors: [
          {
            field: "title",
            message: "title cannot be empty",
          },
        ],
      };
    }
    if (options.authorId.length === 0) {
      return {
        errors: [
          {
            field: "authorId",
            message: "authorId cannot be empty",
          },
        ],
      };
    }
    const book = em.create(Book, { ...options });
    console.log(book);
    try {
      em.persistAndFlush(book);
      return { book };
    } catch (err) {
      console.log(err);
      return {
        errors: [{ field: "unknown", message: "an unknown error occurred" }],
      };
    }
  }

  @Mutation(() => BookResponse, { nullable: true })
  async updatebook(
    @Arg("id") id: string,
    @Arg("options") options: CreateBookInput,
    @Ctx() { em }: MyContext
  ) {
    if (options.title.length === 0) {
      return {
        errors: [
          {
            field: "title",
            message: "title cannot be empty",
          },
        ],
      };
    }
    if (options.authorId.length === 0) {
      return {
        errors: [
          {
            field: "authorId",
            message: "authorId cannot be empty",
          },
        ],
      };
    }
    const book = await em.findOne(Book, { id });
    if (!book) {
      return {
        errors: [
          {
            field: "id",
            message: "invalid book id",
          },
        ],
      };
    }
    try {
      const updatedBook = em.create(Book, { ...options, id });
      em.persistAndFlush(updatedBook);
      return { updatedBook };
    } catch {
      return {
        errors: [{ field: "unknown", message: "an unknown error occurred" }],
      };
    }
  }

  @Mutation(() => Boolean)
  async deletebook(@Arg("id") id: string, @Ctx() { em }: MyContext) {
    try {
      const book = em.findOneOrFail(Book, { id });
      em.removeAndFlush(book);
      return true;
    } catch {
      return false;
    }
  }
}
