import { Livro } from './livro.entity';
import { CriarLivroDto } from './dto/criar-livro.dto';
import type { LivroRepository } from './repository/livro.repository';
export declare class LivroService {
    private readonly livroRepository;
    constructor(livroRepository: LivroRepository);
    criar(dto: CriarLivroDto): Promise<Livro>;
    listar(): Promise<Livro[]>;
}
