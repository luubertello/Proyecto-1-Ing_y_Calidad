import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSuperLineaToLinea1790278314950 implements MigrationInterface {
    name = 'AddSuperLineaToLinea1790278314950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`super_linea\` (\`id\` int NOT NULL AUTO_INCREMENT, \`denominacion\` varchar(255) NOT NULL, \`observacion\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, \`usuarioCreatedId\` int NULL, \`usuarioDeletedId\` int NULL, \`usuarioUpdatedId\` int NULL, \`sistema\` int NOT NULL DEFAULT '0', UNIQUE INDEX \`IDX_9e4184946b687e188250ddefea\` (\`denominacion\`, \`deletedAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await queryRunner.query(`ALTER TABLE \`linea\` ADD \`superLineaId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`linea\` ADD \`super_linea_id\` int NULL`);

        await queryRunner.query(`
            INSERT INTO super_linea (denominacion, sistema, createdAt, updatedAt)
            VALUES ('Sin clasificar', 1, NOW(), NOW())
        `);

        await queryRunner.query(`
            UPDATE linea SET super_linea_id = (SELECT id FROM super_linea WHERE denominacion = 'Sin clasificar' LIMIT 1),
                              superLineaId = (SELECT id FROM super_linea WHERE denominacion = 'Sin clasificar' LIMIT 1)
            WHERE super_linea_id IS NULL
        `);

        await queryRunner.query(`ALTER TABLE \`linea\` MODIFY \`super_linea_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`linea\` MODIFY \`superLineaId\` int NOT NULL`);

        await queryRunner.query(`ALTER TABLE \`linea\` ADD CONSTRAINT \`FK_c92ad68fd9cef3017f0ba7d1155\` FOREIGN KEY (\`super_linea_id\`) REFERENCES \`super_linea\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`linea\` DROP FOREIGN KEY \`FK_c92ad68fd9cef3017f0ba7d1155\``);
        await queryRunner.query(`ALTER TABLE \`linea\` DROP COLUMN \`super_linea_id\``);
        await queryRunner.query(`ALTER TABLE \`linea\` DROP COLUMN \`superLineaId\``);
        await queryRunner.query(`DROP INDEX \`IDX_9e4184946b687e188250ddefea\` ON \`super_linea\``);
        await queryRunner.query(`DROP TABLE \`super_linea\``);
    }
}