import { GraphQLSchema } from "graphql";
import { buildSchema } from "type-graphql";
import { AuthorResolver, BookResolver } from "../../resolvers";

export const createSchema = (): Promise<GraphQLSchema> => {
  return buildSchema({
    resolvers: [AuthorResolver, BookResolver],
    validate: false,
  });
};
