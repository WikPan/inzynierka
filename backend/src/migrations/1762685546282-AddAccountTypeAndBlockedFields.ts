import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAccountTypeAndBlockedFields1762685546282 implements MigrationInterface {
    name = 'AddAccountTypeAndBlockedFields1762685546282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" ADD "blocked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "accountType"`);
        await queryRunner.query(`DROP TYPE "public"."users_accounttype_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "accountType" character varying NOT NULL DEFAULT 'USER'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "accountType"`);
        await queryRunner.query(`CREATE TYPE "public"."users_accounttype_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "accountType" "public"."users_accounttype_enum" NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "blocked"`);
    }

}
