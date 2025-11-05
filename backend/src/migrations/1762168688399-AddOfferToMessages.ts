import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOfferToMessages1762168688399 implements MigrationInterface {
    name = 'AddOfferToMessages1762168688399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD "isRead" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "offerId" uuid`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_7eefe0975871d53c5ab514c9c19" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_7eefe0975871d53c5ab514c9c19"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "offerId"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "isRead"`);
    }

}
