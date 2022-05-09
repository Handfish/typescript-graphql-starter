import { MyContext } from "../utils/types";
import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import { User } from "../database/entities";
import argon2 from "argon2";

@Resolver(User)
export default class UserResolver {
  @Mutation(() => Boolean)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { em }: MyContext
  ): Promise<Boolean> {
    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, {
      email,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
      return true;
    } catch {
      return false;
    }
  }
}
