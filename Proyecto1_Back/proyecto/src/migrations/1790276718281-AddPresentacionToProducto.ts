import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPresentacionToProducto1790276718281 implements MigrationInterface {
    name = 'AddPresentacionToProducto1790276718281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`producto\` ADD \`denominacionManual\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`producto\` ADD \`presentacionCantidad\` decimal(10,2) NULL`);
        await queryRunner.query(`ALTER TABLE \`producto\` ADD \`presentacionUnidad\` enum ('L', 'g', 'kg', 'unidad', 'pack') NULL`);
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`porcentaje\` \`porcentaje\` decimal(5,2) NOT NULL DEFAULT '15.00'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`producto\` CHANGE \`porcentaje\` \`porcentaje\` decimal(5,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`producto\` DROP COLUMN \`presentacionUnidad\``);
        await queryRunner.query(`ALTER TABLE \`producto\` DROP COLUMN \`presentacionCantidad\``);
        await queryRunner.query(`ALTER TABLE \`producto\` DROP COLUMN \`denominacionManual\``);
    }

}
