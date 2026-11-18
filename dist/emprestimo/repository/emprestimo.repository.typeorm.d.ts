import { Repository } from "typeorm";
import { Emprestimo } from "../emprestimo.entity";
import { Livro } from "../../livro/livro.entity";
import type { EmprestimoRepository } from "./emprestimo.repository";
export declare class EmprestimoRepositoryTypeOrm implements EmprestimoRepository {
    private readonly emprestimoRepo;
    private readonly livroRepo;
    constructor(emprestimoRepo: Repository<Emprestimo>, livroRepo: Repository<Livro>);
    buscarLivroPorId(id: number): Promise<Livro | null>;
    criar(emprestimo: Emprestimo): Promise<Emprestimo>;
    buscarPorId(id: number): Promise<Emprestimo | null>;
    atualizar(emprestimo: Emprestimo): Promise<Emprestimo>;
    listar(): Promise<Emprestimo[]>;
    atualizarLivro(livro: Livro): Promise<Livro>;
}
