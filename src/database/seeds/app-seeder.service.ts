import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class AppSeederService {

    private readonly logger = new Logger(AppSeederService.name);

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    public async seedAll(): Promise<void> {
        await this.runSeedIfEmpty("ingredient", "seed-ingredients-full.sql");
        await this.runSeedIfEmpty("tipo_comida", "seed-tipoComida.sql");
        await this.runSeedIfEmpty("recipe", "seed-recipes.sql");
        await this.runSeedIfEmpty("ingredient_translation", "seed-translations.sql");
        await this.seedAdminUser();
    }

    private async runSeedIfEmpty(tabla: string, archivo: string): Promise<void> {
        const count = await this.dataSource.query(`SELECT COUNT(*) FROM "${tabla}"`);

        if (parseInt(count[0].count) > 0) {
            this.logger.log(`⏭️  Tabla "${tabla}" ya tiene datos, omitiendo.`);
            return;
        }

        const filePath = path.join(__dirname, "sql", archivo);
        const sql = fs.readFileSync(filePath, "utf-8");

        this.logger.log(`🌱 Ejecutando seed para "${tabla}"...`);
        await this.dataSource.query(sql);
        this.logger.log(`✅ Seed de "${tabla}" completado.`);
    }

    private async seedAdminUser(): Promise<void> {
        const existe = await this.dataSource.query(
            `SELECT COUNT(*) FROM "user" WHERE "email" = 'admin@test.com'`
        );

        if (parseInt(existe[0].count) > 0) {
            this.logger.log(`⏭️  Usuario admin ya existe, omitiendo.`);
            return;
        }

        this.logger.log(`🌱 Creando usuario admin...`);
        await this.dataSource.query(`
        INSERT INTO "user" ("name", "email", "passwordHashed", "rolId", "fechaCreacion")
        VALUES ('Admin', 'admin@test.com', '$2b$10$ngPnAGnIr2m8unwMzhAG5ukUruUrKIK7sSO8RRKGj6c0IygAvtkT2', 1, NOW())
    `);
        this.logger.log(`✅ Usuario admin creado. Email: admin@test.com / Password: password`);
    }
}