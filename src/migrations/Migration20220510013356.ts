import { Migration } from '@mikro-orm/migrations';

export class Migration20220510013356 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "users" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "first_name" varchar(255) null, "last_name" varchar(255) null, "age" int null, "email" varchar(255) not null, "password" varchar(255) not null, "confirmed" boolean not null default false);');
    this.addSql('alter table "users" add constraint "users_email_unique" unique ("email");');
    this.addSql('alter table "users" add constraint "users_pkey" primary key ("id");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "users" cascade;');
  }

}
