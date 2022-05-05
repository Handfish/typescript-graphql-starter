import "reflect-metadata";
import "dotenv-safe/config";
import { initServer } from "./server";

const main = async () => {
  const port = parseInt(process.env.PORT) || 5000;
  const app = await initServer();
  app.listen(port, () => {
    console.log(`GraphQL server listening at http://localhost:${port}/graphql`);
  });
};

main();
