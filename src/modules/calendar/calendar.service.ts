import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Calendar } from "./entities/calendar-entity";
import { Repository } from "typeorm";
import { Recipe } from "../recipes/entities/recipe.entity";
import { calendarDto } from "./DTOs/calendar.dto";
import { TipoComida } from "./entities/tipo-comida-entity";
import { deleteCalendarDto } from "./DTOs/delete-calendar.dto";

@Injectable()
export class CalendarService {

    constructor(
        @InjectRepository(Calendar)
        private readonly calendarRepository: Repository<Calendar>,

        @InjectRepository(Recipe)
        private readonly recipeRepository: Repository<Recipe>,

        @InjectRepository(TipoComida)
        private readonly tipoComidaRepository: Repository<TipoComida>,
    ) { }

    public async assignMeal(dto: calendarDto, usuarioId: number): Promise<Calendar> {
        await this.validarTipoComida(dto.tipo_comida_id);
        const receta = await this.validarReceta(dto);

        const esPropia = receta.idUsuario === usuarioId;
        const esDePlataforma = receta.idUsuario === 1;

        if (!esPropia && !esDePlataforma) {
            throw new ForbiddenException("No tenés permiso para asignar esta receta.");
        }

        const [year, month, day] = dto.fecha.split("-").map(Number);
        const fecha = new Date(year, month - 1, day);

        const existente = await this.calendarRepository.findOne({
            where: {
                usuario_id: usuarioId,
                fecha,
                tipo_comida_id: dto.tipo_comida_id,
            },
        });

        if (existente) {
            throw new BadRequestException(
                "Ya existe una receta asignada para ese tipo de comida en ese día."
            );
        }

        const recetaAsignada = this.calendarRepository.create({
            usuario_id: usuarioId,
            receta_id: dto.receta_id,
            tipo_comida_id: dto.tipo_comida_id,
            fecha,
        });

        return this.calendarRepository.save(recetaAsignada);
    }

    private async validarTipoComida(tipoComidaId: number): Promise<TipoComida> {
        const tipoComida = await this.tipoComidaRepository.findOne({
            where: { id: tipoComidaId },
        });

        if (!tipoComida) {
            throw new NotFoundException(
                `El tipo de comida con id ${tipoComidaId} no existe. Solo se permiten: Almuerzo y Cena.`
            );
        }

        return tipoComida;
    }

    private async validarReceta(dto: calendarDto): Promise<Recipe> {
        const receta = await this.recipeRepository.findOne({
            where: { id: dto.receta_id },
        });

        if (!receta) {
            throw new NotFoundException(`La receta con id ${dto.receta_id} no existe.`);
        }

        return receta;
    }

    async updateCalendarRecipe(dto: calendarDto, userId: number): Promise<Calendar>{
        await this.validarTipoComida(dto.tipo_comida_id);
        const recipe = await this.validarReceta(dto)
        const [year, month, day] = dto.fecha.split("-").map(Number);
        const fecha = new Date(year, month - 1, day);
        const calendar = await this.calendarRepository.findOne({
            where: {
                usuario_id: userId,
                fecha,
                tipo_comida_id: dto.tipo_comida_id
            }
        })

        if(!calendar){
            throw new NotFoundException('Este dia de la semana no tiene recetas asignadas')
        }

        calendar.receta_id = recipe.id;
        calendar.receta = recipe

        return this.calendarRepository.save(calendar)
    }

    async deleteCalendarRecipe(dto: deleteCalendarDto, userId: number): Promise<Calendar>{
        const [year, month, day] = dto.fecha.split("-").map(Number);
        const date= new Date(year, month - 1, day);
        const calendar = await this.calendarRepository.findOne({
            where: {
                tipo_comida_id: dto.tipo_comida_id,
                fecha: date
            }
        })

        if(!calendar){throw new NotFoundException(`El calendario que desea eliminar no existe.`);}

        const esPropia = calendar.usuario_id === userId;
        const esDePlataforma = calendar.usuario_id === 1;
        if (!esPropia && !esDePlataforma) {
            throw new ForbiddenException("No tenés permiso para asignar esta receta.");
        }
    
        const recipe = await this.recipeRepository.findOne({
            where: {
                id: calendar?.receta_id
            }
        })
        if(!recipe){throw new NotFoundException(`La receta con id ${calendar?.receta_id} no existe.`);}

        return await this.calendarRepository.remove(calendar)
    }
}