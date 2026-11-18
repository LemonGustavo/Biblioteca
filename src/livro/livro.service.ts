import { Inject, Injectable } from '@nestjs/common';
import { Livro } from './livro.entity';
import { CriarLivroDto } from './dto/criar-livro.dto';
import { LIVRO_REPOSITORY } from './repository/livro.repository';
import type { LivroRepository } from './repository/livro.repository';

@Injectable()
export class LivroService {
  constructor(
    @Inject(LIVRO_REPOSITORY)
    private readonly livroRepository: LivroRepository,
  ) {}

  criar(dto: CriarLivroDto): Promise<Livro> {
    const livro = new Livro();
    livro.titulo = dto.titulo;
    livro.autor = dto.autor;
    livro.isbn = dto.isbn;
    return this.livroRepository.criar(livro);
  }

  listar(): Promise<Livro[]> {
    return this.livroRepository.listar();
  }
}