import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Request } from "express";
import { Redis } from "ioredis";
import { Field, ObjectType } from "type-graphql";
import { createBookLoader, createAuthorLoader } from "../loaders";

export type MyContext = {
  req: Request;
  session: Session;
  url: string;
  em: EntityManager<PostgreSqlDriver>;
  redis: Redis;
  bookLoader: ReturnType<typeof createBookLoader>;
  authorLoader: ReturnType<typeof createAuthorLoader>;
};

export interface Session {
  userId?: string;
}

// Types for session data
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

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
