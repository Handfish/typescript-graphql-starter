import { Factory, Faker } from "@mikro-orm/seeder";
import { Book } from "../entities";

export class BookFactory extends Factory<Book> {
  model = Book;

  definition(faker: Faker): Partial<Book> {
    return {
      title: faker.random.words(),
      year: faker.datatype.number({ min: 1, max: 2022 }),
    };
  }
}
