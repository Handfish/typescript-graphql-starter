import DataLoader from "dataloader";
import { Book } from "../database/entities";
import { EntityManager } from "@mikro-orm/core";

export const createBookLoader = (em: EntityManager) =>
  new DataLoader<string, Book | null>(async (bookIds) => {
    const db = em.fork();
    const books = await db.find(Book, {
      id: {
        $in: bookIds as string[],
      },
    });
    const data: Record<string, Book> = {};
    books.forEach((b) => {
      data[b.id] = b;
    });
    return bookIds.map((bookId) => data[bookId]);
  });
