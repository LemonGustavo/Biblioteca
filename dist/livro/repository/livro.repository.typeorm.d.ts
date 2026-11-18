import { Repository } from "typeorm";
import { Livro } from "../livro.entity";
import { LivroRepository } from "./livro.repository";
export declare class LivroRepositoryTypeOrm implements LivroRepository {
    private readonly repo;
    constructor(repo: Repository<Livro>);
    criar(livro: Livro): Promise<Livro>;
    listar(): Promise<Livro[]>;
}
