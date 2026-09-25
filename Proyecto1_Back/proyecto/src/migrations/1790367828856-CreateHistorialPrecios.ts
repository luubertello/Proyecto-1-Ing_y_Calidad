import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateHistorialPrecios1790367828856 implements MigrationInterface {
    name = 'CreateHistorialPrecios1790367828856'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`historial_precio\` (\`id\` int NOT NULL AUTO_INCREMENT, \`precioAnterior\` decimal(15,5) NOT NULL DEFAULT '0.00000', \`precioNuevo\` decimal(15,5) NOT NULL DEFAULT '0.00000', \`motivo\` text NOT NULL, \`fecha\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`productoId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`historial_precio\` ADD CONSTRAINT \`FK_4639d1fe00a3c56b9e731953f21\` FOREIGN KEY (\`productoId\`) REFERENCES \`producto\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`historial_precio\` DROP FOREIGN KEY \`FK_4639d1fe00a3c56b9e731953f21\``);
        await queryRunner.query(`DROP TABLE \`historial_precio\``);
    }

}
