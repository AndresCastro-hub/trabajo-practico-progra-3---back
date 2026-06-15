import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { NutritionService } from "../nutrition/nutrition.interface";
import { ConfigService } from "@nestjs/config";
import { TRANSLATION_SERVICE } from "../translation/translation.interface";
import type { ITranslation } from "../translation/translation.interface";

@Injectable()
export class FatSecretService implements NutritionService {

    private acessToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor(
        private configService: ConfigService,
        @Inject(TRANSLATION_SERVICE)
        private translationService: ITranslation
    ) { }

    async getCaloriasPorIngrediente(nombreEspanol: string, cantidad: number, unidad: string): Promise<number> {
        const nombreEnIngles = await this.translationService.traducir(nombreEspanol)
        const foodId = await this.buscarFoodId(nombreEnIngles)
        return this.obtenerCalorias(foodId, unidad, cantidad, nombreEspanol);
    }

    private async getToken(): Promise<string> {
        if (this.acessToken && Date.now() < this.tokenExpiry) {
            return this.acessToken
        }

        const clientId = this.configService.get<string>('FATSECRET_CLIENT_ID');
        const clientSecret = this.configService.get<string>('FATSECRET_CLIENT_SECRET');

        const response = await fetch('https://oauth.fatsecret.com/connect/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: clientId!,
                client_secret: clientSecret!,
            }),
        });

        const data = await response.json();
        this.acessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
        return this.acessToken!;
    }

    private async buscarFoodId(nombreIngles: string): Promise<string> {
        const token = await this.getToken();

        const response = await fetch(
            `https://platform.fatsecret.com/rest/foods/search/v1?search_expression=${encodeURIComponent(nombreIngles)}&max_results=1&format=json`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await response.json();
        const food = data.foods?.food;

        if (!food) throw new NotFoundException(`No se encontró el ingrediente: ${nombreIngles}`);

        const foodId = Array.isArray(food) ? food[0].food_id : food.food_id;
        return foodId;
    }

    private async obtenerCalorias(foodId: string, unidad: string, cantidad: number, nombreEspanol: string): Promise<number> {
        const token = await this.getToken();

        const response = await fetch(
            `https://platform.fatsecret.com/rest/food/v4?food_id=${foodId}&format=json`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await response.json();
        const servings: any[] = data.food?.servings?.serving;
        const servingsArray = Array.isArray(servings) ? servings : [servings];

        if (unidad === 'unidad') {
            const servingUnidad = servingsArray.find(s => s.measurement_description === 'large');
            if (!servingUnidad) throw new NotFoundException(`No se encontró serving por unidad para food_id: ${foodId}`);
            return Number(servingUnidad.calories) * cantidad;
        }

        const serving100g = servingsArray.find(s =>
            s.metric_serving_unit === 'g' && Number(s.metric_serving_amount) === 100
        );
        if (!serving100g) throw new NotFoundException(`No se encontraron datos nutricionales para: ${nombreEspanol}`);
        return (Number(serving100g.calories) * cantidad) / 100;
    }

}