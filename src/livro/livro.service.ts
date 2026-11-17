import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Livro } from "./livro";
import { CriarLivroDto } from "./dto/criar-livro.dto";

@Injectable()
export class LivroService {
    constructor(
        @InjectRepository(Livro)
        private readonly livroRespository: Repository<Livro>,
    ) {}

    async criar(dto: CriarLivroDto): Promise<Livro> {
        const livro = this.livroRespository.create(dto);
        return this.livroRespository.save(livro);
    }

    async listar(): Promise<Livro[]> {
        return this.livroRespository.find();
    }
}