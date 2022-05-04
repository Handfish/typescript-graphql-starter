import { QueryOrder } from "@mikro-orm/core";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Author, Book } from "../entities";
import { BaseResponse, MyContext } from "../utils/types";

@ObjectType()
class AuthorResponse extends BaseResponse {
  @Field(() => Author, { nullable: true })
  author?: Author;
}

@InputType()
class CreateAuthorInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  middleName?: string;

  @Field({ nullable: true })
  lastName?: string;
}

@Resolver(Author)
export class AuthorResolver {
  @FieldResolver(() => [Book], { nullable: true })
  books(@Root() author: Author, @Ctx() { bookLoader }: MyContext) {
    if (author.books.isInitialized() && author.books.length > 0) {
      return bookLoader.loadMany(author.books.getIdentifiers() as string[]);
    } else {
      return null;
    }
  }

  @Query(() => Author, { nullable: true })
  async author(
    @Ctx() { em }: MyContext,
    @Arg("id") id: string
  ): Promise<Author | null> {
    const author = em.findOne(Author, { id });
    if (!author) {
      return null;
    }
    return author;
  }

  @Query(() => [Author], { nullable: true })
  async authors(
    @Arg("limit") limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { em }: MyContext
  ): Promise<Author[] | null> {
    const realLimit = Math.min(50, limit);
    const qb = em.createQueryBuilder(Author, "a");
    qb.select(["a.*"], true)
      .leftJoinAndSelect("a.books", "b")
      .orderBy({ createdAt: QueryOrder.DESC })
      .limit(realLimit);
    if (cursor) {
      qb.where("a.createdAt < :cursor", [new Date(parseInt(cursor))]);
    }
    console.log(await qb.getResult());
    return qb.getResultList();
  }

  @Mutation(() => AuthorResponse, { nullable: true })
  async createAuthor(
    @Arg("options") options: CreateAuthorInput,
    @Ctx() { em }: MyContext
  ): Promise<AuthorResponse> {
    const author = em.create(Author, { ...options });
    try {
      em.persistAndFlush(author);
      return { author };
    } catch (err) {
      console.log(err);
      return {
        errors: [{ field: "unknown", message: "an unknown error occurred" }],
      };
    }
  }

  @Mutation(() => AuthorResponse, { nullable: true })
  async updateAuthor(
    @Arg("id") id: string,
    @Arg("options") options: CreateAuthorInput,
    @Ctx() { em }: MyContext
  ): Promise<AuthorResponse> {
    const author = await em.findOne(Author, { id });
    if (!author) {
      return {
        errors: [
          {
            field: "id",
            message: "invalid author id",
          },
        ],
      };
    }
    try {
      const updatedAuthor = em.create(Author, { ...options, id });
      em.persistAndFlush(updatedAuthor);
      return { author: updatedAuthor };
    } catch {
      return {
        errors: [{ field: "unknown", message: "an unknown error occurred" }],
      };
    }
  }

  @Mutation(() => Boolean)
  async deleteAuthor(
    @Arg("id") id: string,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    try {
      const author = em.findOneOrFail(Author, { id });
      em.removeAndFlush(author);
      return true;
    } catch {
      return false;
    }
  }
}
