import { v4 } from "uuid";
import { Redis } from "ioredis";

// https://my-site.com/confirm/{id}
export const createConfirmEmailLink = async (
  url: string,
  userId: string,
  redis: Redis
) => {
  const id = v4();
  // Store Id
  await redis.set(id, userId, "EX", 60 * 60 * 24);
  // Return unique link
  return `${url}/confirm/${id}`;
};
