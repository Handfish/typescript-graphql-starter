import { graphql, GraphQLSchema } from "graphql";
import { Maybe } from "type-graphql";
import { MyContext } from "../types";
import { createSchema } from "./createSchema";

interface Options {
  source: string;
  variableValues?: Maybe<{ [key: string]: any }>;
  context?: MyContext;
}

let schema: GraphQLSchema;

export const graphqlTestCall = async ({
  source,
  variableValues,
  context,
}: Options) => {
  if (!schema) {
    schema = await createSchema();
  }
  return graphql({
    schema,
    source,
    variableValues,
    contextValue: { ...context },
  });
};
