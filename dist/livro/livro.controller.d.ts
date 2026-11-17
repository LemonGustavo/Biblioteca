import { LivroService } from './livro.service';
import { CriarLivroDto } from './dto/criar-livro.dto';
export declare class LivroController {
    private readonly livroService;
    constructor(livroService: LivroService);
    criar(dto: CriarLivroDto): Promise<import("./livro").Livro>;
    listar(): Promise<import("./livro").Livro[]>;
}
