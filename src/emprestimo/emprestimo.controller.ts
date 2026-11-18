import { Controller, Get, Post, Put, Body, Param, ParseIntPipe } from "@nestjs/common";
import { EmprestimoService } from "./emprestimo.service";
import { CriarEmprestimoDto } from "./dto/criar-emprestimo.dto";

@Controller('emprestimos')
export class EmprestimoController {
    constructor(private readonly emprestimoService: EmprestimoService) {}

    @Post()
    criar(@Body() dto: CriarEmprestimoDto) {
        return this.emprestimoService.criar(dto);
    }

    @Put(':id/devolucao')
    devolver(@Param('id', ParseIntPipe) id: number) {
        return this.emprestimoService.devolver(id);
    }

    @Get()
    listar() {
        return this.emprestimoService.listar();
    }
}