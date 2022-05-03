import "dotenv-safe/config";

export const __prod__ = process.env.NODE_ENV === "production";
export const __test__ = process.env.NODE_ENV === "test";
export const host = `http://localhost:${process.env.PORT}/graphql`;
