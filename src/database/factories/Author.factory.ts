import { Factory, Faker } from "@mikro-orm/seeder";
import { Author } from "../entities";

export class AuthorFactory extends Factory<Author> {
  model = Author;

  definition(faker: Faker): Partial<Author> {
    return {
      firstName: faker.name.firstName(),
      middleName: faker.name.middleName(),
      lastName: faker.name.lastName(),
    };
  }
}
