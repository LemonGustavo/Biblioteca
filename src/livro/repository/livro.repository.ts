import { Livro } from "../livro.entity";

export const LIVRO_REPOSITORY = Symbol('LIVRO_REPOSITORY');

export interface LivroRepository {
    criar(livro: Livro): Promise<Livro>;
    listar(): Promise<Livro[]>;
}