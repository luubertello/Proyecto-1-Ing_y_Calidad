import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMovimientoStock1790449091143 implements MigrationInterface {
    name = 'CreateMovimientoStock1790449091143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`movimiento_stock\` (\`id\` int NOT NULL AUTO_INCREMENT, \`tipoMovimiento\` enum ('AJUSTE_MANUAL', 'COMPRA', 'VENTA', 'DEVOLUCION_CLIENTE', 'DEVOLUCION_PROVEEDOR') NOT NULL DEFAULT 'AJUSTE_MANUAL', \`cantidad\` decimal(12,3) NOT NULL DEFAULT '0.000', \`motivo\` text NOT NULL, \`fecha\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`productoId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`movimiento_stock\` ADD CONSTRAINT \`FK_b70524cd5b64ab723f15d95a0c3\` FOREIGN KEY (\`productoId\`) REFERENCES \`producto\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`movimiento_stock\` DROP FOREIGN KEY \`FK_b70524cd5b64ab723f15d95a0c3\``);
        await queryRunner.query(`DROP TABLE \`movimiento_stock\``);
    }

}
