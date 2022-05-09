import { GraphQLSchema } from "graphql";
import { buildSchema } from "type-graphql";
import { AuthorResolver, BookResolver, UserResolver } from "../../resolvers";

export const createSchema = (): Promise<GraphQLSchema> => {
  return buildSchema({
    resolvers: [AuthorResolver, BookResolver, UserResolver],
    validate: false,
  });
};
