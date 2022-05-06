import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { AuthorFactory } from "../factories";

export class AuthorSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    new AuthorFactory(em).make(10);
  }
}
