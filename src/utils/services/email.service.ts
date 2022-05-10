"dotenv-safe/config";
import { v4 } from "uuid";
import { Redis } from "ioredis";
import SparkPost from "sparkpost";

// Using SparkPost for email, may swap out email client
const client = new SparkPost(process.env.SPARK_POST_API_KEY);

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

export const sendEmail = async (recipient: string, url: string) => {
  try {
    const response = await client.transmissions.send({
      options: {
        sandbox: true,
      },
      content: {
        from: "testing@sparkpostbox.com",
        subject: "Confirm Email",
        html: `
      <html>
        <body>
          <p>Testing SparkPost!</p>
          <a href="${url}">Confirm email</a>
        </body>
      </html>
      `,
      },
      recipients: [
        {
          address: recipient,
        },
      ],
    });
    console.log(response);
  } catch (err) {
    console.error(err);
  }
};
