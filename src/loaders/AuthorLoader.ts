import DataLoader from "dataloader";
import { Author } from "../entities";
import { EntityManager } from "@mikro-orm/core";

export const createAuthorLoader = (em: EntityManager) =>
  new DataLoader<string, Author | null>(async (authorIds) => {
    const db = em.fork();
    const authors = await db.find(Author, {
      id: {
        $in: authorIds as string[],
      },
    });
    const authorIdToAuthor: Record<string, Author> = {};
    authors.forEach((a) => {
      authorIdToAuthor[a.id] = a;
    });
    return authorIds.map((authorId) => authorIdToAuthor[authorId]);
  });
