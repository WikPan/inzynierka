import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLatitudeLongitudeToOffers1760708477550 implements MigrationInterface {
    name = 'AddLatitudeLongitudeToOffers1760708477550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" ADD "latitude" numeric(10,6)`);
        await queryRunner.query(`ALTER TABLE "offers" ADD "longitude" numeric(10,6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "latitude"`);
    }

}
