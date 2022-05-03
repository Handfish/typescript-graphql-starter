import { EntityManager } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Request, Response } from "express";
import { Field, ObjectType } from "type-graphql";
import {
  createBookLoader,
  createAuthorLoader,
  createBookCategoryLoader,
} from "../loaders";

export type MyContext = {
  req: Request;
  res: Response;
  em: EntityManager<PostgreSqlDriver>;
  bookLoader: ReturnType<typeof createBookLoader>;
  authorLoader: ReturnType<typeof createAuthorLoader>;
  bookCategoryLoader: ReturnType<typeof createBookCategoryLoader>;
};

@ObjectType()
export class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
export class BaseResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
