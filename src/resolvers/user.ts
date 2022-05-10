import { BaseResponse, MyContext } from "../utils/types";
import { Resolver, Mutation, Arg, Ctx, ObjectType, Field } from "type-graphql";
import { User } from "../database/entities";
import argon2 from "argon2";
import {
  createConfirmEmailLink,
  sendEmail,
} from "../utils/services/email.service";
import { __test__ } from "../utils/constants";

@ObjectType()
class UserResponse extends BaseResponse {
  @Field(() => User, { nullable: true })
  user?: User;
}

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
      // Send confirmation link to user
      const link = await createConfirmEmailLink(url, user.id, redis);
      if (!__test__) {
        await sendEmail(user.email, link);
      }
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { email });
    if (!user) {
      return {
        errors: [
          {
            field: "email",
            message: "that account does not exist",
          },
        ],
      };
    }
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "invalid password",
          },
        ],
      };
    }
    return { user };
  }
}
