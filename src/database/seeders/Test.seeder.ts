import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { AuthorSeeder } from "./Author.seeder";
import { BookSeeder } from "./Book.seeder";

export class TestSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    return this.call(em, [AuthorSeeder, BookSeeder]);
  }
}
