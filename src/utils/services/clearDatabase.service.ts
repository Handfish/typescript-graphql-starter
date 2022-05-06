import { MikroORM, Connection, IDatabaseDriver } from "@mikro-orm/core";

export const clearDatabase = async (
  orm: MikroORM<IDatabaseDriver<Connection>>
): Promise<void> => {
  await orm
    .getSchemaGenerator()
    .dropSchema({ wrap: true, dropMigrationsTable: true });
  const migrator = orm.getMigrator();
  const migrations = await migrator.getPendingMigrations();
  if (migrations && migrations.length > 0) {
    await migrator.up();
  }

  await orm.getSchemaGenerator().updateSchema();
};
