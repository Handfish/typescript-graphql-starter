import DataLoader from "dataloader";
import { BookCategory } from "../entities";
import { EntityManager } from "@mikro-orm/core";

export const createBookCategoryLoader = (em: EntityManager) =>
  new DataLoader<string, BookCategory | null>(async (ids) => {
    const db = em.fork().getRepository(BookCategory);
    const records = await db.find({
      id: {
        $in: ids as string[],
      },
    });
    const data: Record<string, BookCategory> = {};
    records.forEach((u) => {
      data[u.id] = u;
    });
    return ids.map((id) => data[id]);
  });
