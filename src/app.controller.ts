import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Hello World', 
    description: 'Retorna un mensaje de saludo' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Mensaje retornado correctamente',
    schema: {
      example: 'Hello World!'
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  getHello(): string {
    return this.appService.getHello();
  }
}