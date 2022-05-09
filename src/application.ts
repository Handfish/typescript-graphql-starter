import "dotenv-safe/config";
import express, { Request, Response } from "express";
import { createServer } from "@graphql-yoga/node";
import { Connection, IDatabaseDriver, MikroORM, wrap } from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
import { __prod__, __test__ } from "./utils/constants";
import { createAuthorLoader, createBookLoader } from "./loaders";
import { Server } from "http";
import cors from "cors";
import { MyContext } from "./utils/types";
import { createSchema } from "./utils/helpers/createSchema";
import Redis from "ioredis";
import { User } from "./database/entities";
export default class Application {
  public orm: MikroORM<IDatabaseDriver<Connection>>;
  public redis: Redis;
  public host: express.Application;
  public server: Server;

  public connect = async (): Promise<void> => {
    try {
      this.orm = await MikroORM.init(mikroOrmConfig);
      const migrator = this.orm.getMigrator();
      const migrations = await migrator.getPendingMigrations();
      if (migrations && migrations.length > 0) {
        // Run migrations
        await migrator.up();
      }
    } catch (err) {
      console.error("⚠️ Could not connect to database.");
      throw Error(err);
    }
  };

  public init = async (): Promise<void> => {
    this.host = express();

    // Build Redis Client
    this.redis = new Redis();

    // Enable cors
    this.host.use(cors());

    // Build GraphQL schema
    try {
      // Define resolvers and schema
      const schema = await createSchema();

      // Create GraphQL server
      const graphQLServer = createServer({
        schema,
        graphiql: !__prod__,
        context: ({ req }) => {
          return {
            req: req as Request,
            url:
              (req as Request).protocol + "://" + (req as Request).get("host"),
            em: this.orm.em.fork(),
            redis: this.redis,
            bookLoader: createBookLoader(this.orm.em),
            authorLoader: createAuthorLoader(this.orm.em),
          } as MyContext;
        },
        maskedErrors: {
          handleParseErrors: true,
          handleValidationErrors: true,
        },
      });
      // Bind GraphQL to `/graphql` endpoint
      this.host.use("/graphql", graphQLServer);
      this.host.use(express.json());

      // Set up confirm email endpoint
      this.host.get("/confirm/:id", async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = await this.redis.get(id);
        if (userId) {
          // Find user record
          const em = this.orm.em.fork();
          const user = await em.findOne(User, { id: userId });
          // Update User record
          wrap(user).assign({
            confirmed: true,
          });
          res.status(200).send("OK");
        } else {
          res.status(400).send("Invalid");
        }
      });

      // Listen
      const port =
        parseInt(__test__ ? process.env.TEST_PORT : process.env.PORT) || 5000;
      this.server = this.host.listen(port, () => {
        !__test__ &&
          console.log(
            `GraphQL Yoga server listening as http://localhost:${port}/graphql`
          );
      });
    } catch (err) {
      console.error("Could not start GraphQL Yoga server");
      throw Error(err);
    }
  };

  public disconnect = async (): Promise<void> => {
    // Disconnect from db
    try {
      await this.orm.close();
    } catch (err) {
      throw Error(err);
    }
  };

  public deInit = async (): Promise<void> => {
    // Close the HTTP server
    try {
      this.server.close();
    } catch (err) {
      throw Error(err);
    }
  };
}
