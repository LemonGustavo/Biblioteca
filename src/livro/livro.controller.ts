import { Controller, Get, Post, Body } from '@nestjs/common';
import { LivroService } from './livro.service';
import { CriarLivroDto } from './dto/criar-livro.dto';

@Controller('livros')
export class LivroController {
  constructor(private readonly livroService: LivroService) {}

  @Post()
  criar(@Body() dto: CriarLivroDto) {
    return this.livroService.criar(dto);
  }

  @Get()
  listar() {
    return this.livroService.listar();
  }
}