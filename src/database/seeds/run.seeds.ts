import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { AppSeederService } from "./app-seeder.service";

async function runSeeds() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seeder = app.get(AppSeederService);

    await seeder.seedAll(); 

    await app.close();
    process.exit(0);
}

runSeeds().catch((err) => {
    console.error("❌ Error al correr los seeds:", err);
    process.exit(1);
});