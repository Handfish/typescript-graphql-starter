declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DB_NAME: string;
      TEST_PORT: string;
      TEST_DB_NAME: string;
    }
  }
}

export {}
