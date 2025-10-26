import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPublicIdToOfferImage1761303043485 implements MigrationInterface {
    name = 'AddPublicIdToOfferImage1761303043485'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offer_images" ADD "publicId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offer_images" DROP COLUMN "publicId"`);
    }

}
