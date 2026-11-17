import { Repository } from "typeorm";
import { Livro } from "./livro";
import { CriarLivroDto } from "./dto/criar-livro.dto";
export declare class LivroService {
    private readonly livroRespository;
    constructor(livroRespository: Repository<Livro>);
    criar(dto: CriarLivroDto): Promise<Livro>;
    listar(): Promise<Livro[]>;
}
