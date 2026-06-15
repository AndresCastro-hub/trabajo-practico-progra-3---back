export interface NutritionService {
    getCaloriasPorIngrediente(nombre: string, cantidad: number, unidad: string): Promise<number>;
}

export const NUTRITION_SERVICE = 'NUTRITION_SERVICE'