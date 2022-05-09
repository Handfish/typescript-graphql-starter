import "dotenv-safe/config";
import { Options, ReflectMetadataProvider } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import path from "path";
import { __prod__, __test__ } from "./utils/constants";
import { Book, Author, User } from "./database/entities";
import { TSMigrationGenerator } from "@mikro-orm/migrations";

export default {
  name: "GraphQL Starter",
  dbName: !__test__ ? process.env.DB_NAME : process.env.TEST_DB_NAME,
  type: "postgresql",
  driver: PostgreSqlDriver,
  debug: !__prod__ && !__test__,
  metadataProvider: ReflectMetadataProvider,
  highlighter: new SqlHighlighter(),
  entities: [Book, Author, User],
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
    transactional: true,
    emit: "ts",
    generator: TSMigrationGenerator,
    dropTables: !__prod__,
    safe: __prod__,
  },
} as Options<PostgreSqlDriver>;
