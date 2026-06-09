import { InjectRepository } from "@nestjs/typeorm";
import { Calendar } from "./entities/calendar-entity";
import { Between, Repository } from "typeorm";
import { CalendarWeekItemDto } from "./DTOs/calendar-week.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CalendarWeekService {

    constructor(
        @InjectRepository(Calendar)
        private readonly calendarRepository: Repository<Calendar>
    ) { }

    public async getWeekCalendar(fechaDeInicio: string, usuario_id: number): Promise<CalendarWeekItemDto[]> {
        const [year, month, day] = fechaDeInicio.split("-").map(Number);
        const fechaInicio = new Date(year, month - 1, day);     
        const fechaFin = new Date(year, month - 1, day + 7);     

        const obtenerRecetas = await this.calendarRepository.find({
            where: {
                usuario_id: usuario_id,
                fecha: Between(fechaInicio, fechaFin)
            },
            relations: ["receta", "tipoComida"],
            order: { fecha: 'ASC' }
        })

        return obtenerRecetas.map((entrada) => this.mapToDto(entrada));

    }

    private mapToDto(entrada: Calendar): CalendarWeekItemDto {
        return {
            fecha: new Date(entrada.fecha).toISOString().split("T")[0],
            tipo_comida: entrada.tipoComida.nombre,
            titulo: entrada.receta.nombre,
            descripcion: entrada.receta.descripcion!,
            imagen: entrada.receta.imagen_url,
            calorias: entrada.receta.calorias,
            tiempo_preparacion: entrada.receta.tiempoPreparacion,
        };
    }

}