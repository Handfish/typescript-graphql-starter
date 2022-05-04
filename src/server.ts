import "dotenv-safe/config";
import express, { Express, Request } from "express";
import { createServer } from "@graphql-yoga/node";
import { MikroORM } from "@mikro-orm/core";
import config from "./mikro-orm.config";
import { __prod__ } from "./utils/constants";
import {
  createAuthorLoader,
  createBookCategoryLoader,
  createBookLoader,
} from "./loaders";
import { MyContext } from "./utils/types";
import { buildSchema } from "type-graphql";
import { BookResolver } from "./resolvers";

export const startServer = async () => {
  const orm = await MikroORM.init(config);
  if (await orm.isConnected()) {
    __prod__
      ? console.log("🚀 Connected to database.")
      : console.log(`🚀 Connected to database: ${orm.config.get("dbName")}.`);
  } else {
    console.error("⚠️ Could not connect to database.");
  }

  await orm
    .getSchemaGenerator()
    .updateSchema()
    .then(() => {
      console.log("🏗 Updated schema.");
    })
    .catch(() => {
      console.error("⚠️ Unable to update schema.");
    });

  await orm
    .getMigrator()
    .up()
    .then(() => {
      console.log("🏗 Ran migrations.");
    })
    .catch(() => {
      console.error("⚠️ Unable to run migrations.");
    });

  const app: Express = express();
  const port = parseInt(process.env.PORT) || 5000;

  // Create the server
  const graphQLServer = createServer({
    schema: await buildSchema({
      resolvers: [BookResolver],
      validate: false,
    }),
    context: ({ req }) => {
      return {
        req: req as Request,
        em: orm.em.fork(),
        bookLoader: createBookLoader(orm.em),
        authorLoader: createAuthorLoader(orm.em),
        bookCategoryLoader: createBookCategoryLoader(orm.em),
      } as MyContext;
    },
    maskedErrors: {
      handleParseErrors: true,
      handleValidationErrors: true,
    },
  });

  // Bind GraphQL to `/graphql` endpoint
  app.use("/graphql", graphQLServer);

  app.listen(port, () => {
    console.log(`GraphQL server listening at http://localhost:${port}/graphql`);
  });

  return app;
};
