import "reflect-metadata";
import Application from "./application";

const main = async () => {
  const app = new Application();
  await app.connect();
  await app.init();
};

main();
