import "dotenv-safe/config";
import express, { Request, Response } from "express";
import { createServer } from "@graphql-yoga/node";
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
import { __prod__, __test__ } from "./utils/constants";
import { createAuthorLoader, createBookLoader } from "./loaders";
import { Server } from "http";
import cors from "cors";
import { MyContext, Session } from "./utils/types";
import { createSchema } from "./utils/helpers/createSchema";
import { redis } from "./database/redis";
import { User } from "./database/entities";
import session from "express-session";
import connectRedis from "connect-redis";

const RedisStore = connectRedis(session);
export default class Application {
  public orm: MikroORM<IDatabaseDriver<Connection>>;
  public host: express.Application;
  public server: Server;

  public connect = async (): Promise<void> => {
    try {
      this.orm = await MikroORM.init(mikroOrmConfig);
      if (!__test__) {
        const migrator = this.orm.getMigrator();
        const migrations = await migrator.getPendingMigrations();
        if (migrations && migrations.length > 0) {
          // Run migrations
          await migrator.up();
        }
      }
    } catch (err) {
      console.error("⚠️ Could not connect to database.");
      throw Error(err);
    }
  };

  public init = async (): Promise<void> => {
    this.host = express();

    // Enable cors
    this.host.use(
      cors({
        credentials: true,
        origin: "http://localhost:3000",
      })
    );

    // Configure session storage
    this.host.use(
      session({
        name: "qid",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: __prod__,
          maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        },
        store: new RedisStore({ client: redis }),
      })
    );

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
            session: (req as Request).session as Session,
            url:
              (req as Request).protocol + "://" + (req as Request).get("host"),
            em: this.orm.em.fork(),
            redis: redis,
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
      this.host.use(express.text());

      // Set up confirm email endpoint
      this.host.get("/confirm/:id", async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = await redis.get(id);
        if (userId) {
          // Find user record
          const em = this.orm.em;
          const user = await em.findOne(User, { id: userId, confirmed: false });
          if (user) {
            // Update User record
            user.confirmed = true;
            await em.persistAndFlush(user);
            // Remove key from Redis
            await redis.del(id);
            res.status(200).send("OK");
          }
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
