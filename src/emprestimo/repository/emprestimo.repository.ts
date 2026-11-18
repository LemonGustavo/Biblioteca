import { Emprestimo } from "../emprestimo.entity";
import { Livro } from "../../livro/livro.entity";
import { promises } from "dns";

export const EMPRESTIMO_REPOSITORY = Symbol('EMPRESTIMO_REPOSITORY');

export interface EmprestimoRepository {
    buscarLivroPorId(id: number): Promise<Livro | null>;
    criar(emprestimo: Emprestimo): Promise<Emprestimo>;
    buscarPorId(id: number): Promise<Emprestimo | null>;
    atualizar(emprestimo: Emprestimo): Promise<Emprestimo>;
    listar(): Promise<Emprestimo[]>;
    atualizarLivro(livro: Livro): Promise<Livro>;
}