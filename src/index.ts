import "reflect-metadata";
import { startServer } from "./server";

startServer().catch((err) => {
  console.error(err);
});
