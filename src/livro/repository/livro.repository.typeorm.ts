import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Livro } from "../livro.entity";
import { LivroRepository } from "./livro.repository";

@Injectable()
export class LivroRepositoryTypeOrm implements LivroRepository {
    constructor(
        @InjectRepository(Livro)
        private readonly repo: Repository<Livro>,
    ) {}

    criar(livro: Livro): Promise<Livro> {
        return this.repo.save(livro);
    }

    listar(): Promise<Livro[]> {
        return this.repo.find();
    }
}