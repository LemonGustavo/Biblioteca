import { Livro } from "../livro.entity";
export declare const LIVRO_REPOSITORY: unique symbol;
export interface LivroRepository {
    criar(livro: Livro): Promise<Livro>;
    listar(): Promise<Livro[]>;
}
