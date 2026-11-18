import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Emprestimo } from "../emprestimo.entity";
import { Livro } from "../../livro/livro.entity";
import type { EmprestimoRepository } from "./emprestimo.repository";

@Injectable()
export class EmprestimoRepositoryTypeOrm implements EmprestimoRepository {
    constructor(
        @InjectRepository(Emprestimo)
        private readonly emprestimoRepo: Repository<Emprestimo>,
        @InjectRepository(Livro)
        private readonly livroRepo: Repository<Livro>,
    ) {}

    buscarLivroPorId(id: number): Promise<Livro | null> {
        return this.livroRepo.findOneBy({id});
    }

    criar(emprestimo: Emprestimo): Promise<Emprestimo> {
        return this.emprestimoRepo.save(emprestimo);
    }

    buscarPorId(id: number): Promise<Emprestimo | null> {
        return this.emprestimoRepo.findOne({
            where: {id},
            relations: { livro: true }
        });
    }

    atualizar(emprestimo: Emprestimo): Promise<Emprestimo> {
        return this.emprestimoRepo.save(emprestimo);
    }

    listar(): Promise<Emprestimo[]> {
        return this.emprestimoRepo.find({relations: {livro: true}});
    }

    atualizarLivro(livro: Livro): Promise<Livro> {
        return this.livroRepo.save(livro);
    }
}