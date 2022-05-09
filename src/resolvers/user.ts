import { MyContext } from "../utils/types";
import { Resolver, Mutation, Arg, Ctx } from "type-graphql";
import { User } from "../database/entities";
import argon2 from "argon2";
import { createConfirmEmailLink } from "../utils/services/email.service";

@Resolver(User)
export default class UserResolver {
  @Mutation(() => Boolean)
  async register(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { em, redis, url }: MyContext
  ): Promise<Boolean> {
    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, {
      email,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
      await createConfirmEmailLink(url, user.id, redis);
      return true;
    } catch {
      return false;
    }
  }
}
