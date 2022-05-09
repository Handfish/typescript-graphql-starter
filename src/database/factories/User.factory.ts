import { Factory, Faker } from "@mikro-orm/seeder";
import { User } from "../entities";

export class UserFactory extends Factory<User> {
  model = User;

  definition(faker: Faker): Partial<User> {
    return {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      age: faker.datatype.number(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      confirmed: faker.datatype.boolean(),
    };
  }
}
