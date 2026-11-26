# Módulo Empréstimo - 18/11/2027 (17:16)
## Gustavo Vinícius Coinete Silva

Foi feito o módulo Empréstimo, seguindo o passo a passo e explicações abaixo. O padrão arquitetural segue o mesmo do módulo Livro (Repository + DIP), garantindo consistência no projeto.

---

## 1. Criar a entidade `Emprestimo`

Crie `src/emprestimo/emprestimo.entity.ts`:

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Livro } from '../livro/livro.entity';

export enum StatusEmprestimo {
  ATIVO = 'ATIVO',
  DEVOLVIDO = 'DEVOLVIDO',
}

@Entity('emprestimos')
export class Emprestimo {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Livro)
  @JoinColumn({ name: 'livro_id' })
  livro: Livro;

  @Column()
  leitor: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  data_emprestimo: Date;

  @Column({ type: 'timestamp', nullable: true })
  data_devolucao: Date | null;

  @Column({
    type: 'enum',
    enum: StatusEmprestimo,
    default: StatusEmprestimo.ATIVO,
  })
  status: StatusEmprestimo;
}
```

**Anatomia:**

| Item | Função | Por que está assim |
|---|---|---|
| `@Entity('emprestimos')` | A classe vira a tabela `emprestimos` | Nome no plural, consistente com `livros` |
| `@ManyToOne(() => Livro)` | Muitos empréstimos para um livro | Materializa a relação do escopo |
| `@JoinColumn({ name: 'livro_id' })` | Cria a coluna `livro_id` como foreign key | O escopo já declara `livro_id`; o ORM gera a FK automaticamente |
| `leitor: string` | Nome do leitor (string simples) | O escopo não tem entidade Leitor, então é só um campo |
| `data_emprestimo` com `CURRENT_TIMESTAMP` | O banco preenche na criação | Evita depender do Service para setar a data |
| `data_devolucao` nullable | Só preenchida na devolução | `null` enquanto o empréstimo está ativo |
| `enum StatusEmprestimo` | Só aceita `ATIVO` ou `DEVOLVIDO` | Validação no banco + legibilidade no código |
| `default: StatusEmprestimo.ATIVO` | Todo empréstimo nasce ativo | Coerente com a regra de negócio |

---

## 2. Criar o DTO de criação

Crie `src/emprestimo/dto/criar-emprestimo.dto.ts`:

```ts
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CriarEmprestimoDto {
  @IsInt()
  livro_id: number;

  @IsString()
  @IsNotEmpty()
  leitor: string;
}
```

**Por que esse DTO:**

| Item | Função | Por que está assim |
|---|---|---|
| `@IsInt()` em `livro_id` | Rejeita string, float, boolean | O `livro_id` precisa ser um inteiro válido (PK do livro) |
| `@IsString()` + `@IsNotEmpty()` em `leitor` | Rejeita números e strings vazias | Mesmo padrão do `CriarLivroDto` |
| **Não tem** `data_emprestimo`, `status`, `id` | O cliente não escolhe esses valores | `id` é gerado pelo banco; `data_emprestimo` tem `CURRENT_TIMESTAMP`; `status` nasce `ATIVO` pelo default |

Separar entidade (banco) e DTO (entrada) evita que campos internos vazem para a API — mesmo princípio do módulo Livro.

---

## 3. Criar a pasta `repository` e a interface

Crie `src/emprestimo/repository/emprestimo.repository.ts`:

```ts
import { Emprestimo } from '../emprestimo.entity';
import { Livro } from '../../livro/livro.entity';

export const EMPRESTIMO_REPOSITORY = Symbol('EMPRESTIMO_REPOSITORY');

export interface EmprestimoRepository {
  buscarLivroPorId(id: number): Promise<Livro | null>;
  criar(emprestimo: Emprestimo): Promise<Emprestimo>;
  buscarPorId(id: number): Promise<Emprestimo | null>;
  atualizar(emprestimo: Emprestimo): Promise<Emprestimo>;
  listar(): Promise<Emprestimo[]>;
  atualizarLivro(livro: Livro): Promise<Livro>;
}
```

**Por que essa interface:**

- Implementa o **DIP (Dependency Inversion Principle)** — o Service depende da abstração, não da implementação concreta.
- O `Symbol` é o **token** usado pelo Nest para injetar a implementação correta (evita colisão de nomes em strings).

**Por que a interface expõe métodos dos dois lados (Emprestimo + Livro):**

O Service do Empréstimo precisa de duas coisas: ler/gravar `Emprestimo` e ler/gravar `Livro` (para alternar `disponivel`). Por isso a interface expõe métodos dos dois lados:

| Método | Quem usa | Por quê |
|---|---|---|
| `buscarLivroPorId` | Service (criar empréstimo) | Verificar se o livro existe e está disponível |
| `criar` | Service (criar empréstimo) | Inserir o empréstimo com `status = ATIVO` |
| `buscarPorId` | Service (devolução) | Verificar se o empréstimo existe e não foi devolvido |
| `atualizar` | Service (devolução) | Gravar `data_devolucao` e `status = DEVOLVIDO` |
| `listar` | Controller (`GET /emprestimos`) | Listar todos os empréstimos |
| `atualizarLivro` | Service (criar e devolver) | Alternar `livro.disponivel` para `false`/`true` |

> **Por que não um `LivroRepository` separado?** Poderia, mas aí o Service teria duas dependências injetadas (`EMPRESTIMO_REPOSITORY` + `LIVRO_REPOSITORY`). Como o escopo pede repositório por módulo, agrupar os métodos do livro que o Empréstimo precisa dentro do `EmprestimoRepository` mantém o Service com uma **única dependência** — mais limpo e mais fácil de explicar ("o repositório do Empréstimo sabe tudo que o Empréstimo precisa do banco, inclusive do livro"). Se preferir separar depois, é uma refatoração simples.

---

## 4. Criar a implementação TypeORM do repositório

Crie `src/emprestimo/repository/emprestimo.repository.typeorm.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Emprestimo } from '../emprestimo.entity';
import { Livro } from '../../livro/livro.entity';
import type { EmprestimoRepository } from './emprestimo.repository';

@Injectable()
export class EmprestimoRepositoryTypeOrm implements EmprestimoRepository {
  constructor(
    @InjectRepository(Emprestimo)
    private readonly emprestimoRepo: Repository<Emprestimo>,
    @InjectRepository(Livro)
    private readonly livroRepo: Repository<Livro>,
  ) {}

  buscarLivroPorId(id: number): Promise<Livro | null> {
    return this.livroRepo.findOneBy({ id });
  }

  criar(emprestimo: Emprestimo): Promise<Emprestimo> {
    return this.emprestimoRepo.save(emprestimo);
  }

  buscarPorId(id: number): Promise<Emprestimo | null> {
    return this.emprestimoRepo.findOne({
      where: { id },
      relations: { livro: true },
    });
  }

  atualizar(emprestimo: Emprestimo): Promise<Emprestimo> {
    return this.emprestimoRepo.save(emprestimo);
  }

  listar(): Promise<Emprestimo[]> {
    return this.emprestimoRepo.find({ relations: { livro: true } });
  }

  atualizarLivro(livro: Livro): Promise<Livro> {
    return this.livroRepo.save(livro);
  }
}
```

**O que acontece aqui:**

- `@Injectable()` → marca a classe como "provider" que o Nest pode instanciar.
- `@InjectRepository(Emprestimo)` e `@InjectRepository(Livro)` → pedem ao TypeORM os repositórios das duas entidades. Só funciona se o módulo registrar `TypeOrmModule.forFeature([Emprestimo, Livro])` (ver Passo 7).
- `relations: { livro: true }` → faz o `JOIN` com `livros`, devolvendo o livro completo no JSON (necessário para o Service alternar `disponivel`).
- `import type` na interface → necessário com `isolatedModules` + `emitDecoratorMetadata` (padrão do `nest new`); sem isso, o TS tenta emitir uma referência em runtime a algo que só existe em tempo de compilação → **erro TS1272**.

---

## 5. Criar o Service

Crie `src/emprestimo/emprestimo.service.ts`:

```ts
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Emprestimo, StatusEmprestimo } from './emprestimo.entity';
import { CriarEmprestimoDto } from './dto/criar-emprestimo.dto';
import { EMPRESTIMO_REPOSITORY } from './repository/emprestimo.repository';
import type { EmprestimoRepository } from './repository/emprestimo.repository';

@Injectable()
export class EmprestimoService {
  constructor(
    @Inject(EMPRESTIMO_REPOSITORY)
    private readonly emprestimoRepository: EmprestimoRepository,
  ) {}

  async criar(dto: CriarEmprestimoDto): Promise<Emprestimo> {
    const livro = await this.emprestimoRepository.buscarLivroPorId(dto.livro_id);

    if (!livro) {
      throw new NotFoundException('Livro não encontrado');
    }

    if (!livro.disponivel) {
      throw new ConflictException('Livro indisponível para empréstimo');
    }

    livro.disponivel = false;
    await this.emprestimoRepository.atualizarLivro(livro);

    const emprestimo = new Emprestimo();
    emprestimo.livro = livro;
    emprestimo.leitor = dto.leitor;
    emprestimo.status = StatusEmprestimo.ATIVO;

    return this.emprestimoRepository.criar(emprestimo);
  }

  async devolver(id: number): Promise<Emprestimo> {
    const emprestimo = await this.emprestimoRepository.buscarPorId(id);

    if (!emprestimo) {
      throw new NotFoundException('Empréstimo não encontrado');
    }

    if (emprestimo.status === StatusEmprestimo.DEVOLVIDO) {
      throw new ConflictException('Empréstimo já devolvido');
    }

    emprestimo.status = StatusEmprestimo.DEVOLVIDO;
    emprestimo.data_devolucao = new Date();

    emprestimo.livro.disponivel = true;
    await this.emprestimoRepository.atualizarLivro(emprestimo.livro);

    return this.emprestimoRepository.atualizar(emprestimo);
  }

  listar(): Promise<Emprestimo[]> {
    return this.emprestimoRepository.listar();
  }
}
```

**O que cada trecho faz (e a regra do escopo que ele cumpre):**

| Trecho | Função | Regra do escopo |
|---|---|---|
| `@Inject(EMPRESTIMO_REPOSITORY)` | Service depende da **interface**, não do TypeORM | "Service: regras de negócio. Não deve conhecer HTTP, nem SQL." |
| `buscarLivroPorId` + `if (!livro)` | Verifica se o livro existe | Evita FK órfã (`404`) |
| `if (!livro.disponivel)` → `ConflictException` | Bloqueia empréstimo de livro indisponível | "Não emprestar um livro indisponível — retornar HTTP 409" |
| `livro.disponivel = false` + `atualizarLivro` | Marca livro como emprestado | "Ao criar um empréstimo: `livro.disponivel = false`" |
| `new Emprestimo()` + `status = ATIVO` | Monta o empréstimo | Status inicial correto |
| `if (status === DEVOLVIDO)` → `ConflictException` | Bloqueia devolução dupla | "Não devolver empréstimo já devolvido — retornar HTTP 409" |
| `data_devolucao = new Date()` + `status = DEVOLVIDO` | Registra a devolução | "Ao devolver: `data_devolucao = now()`, `status = DEVOLVIDO`" |
| `livro.disponivel = true` | Libera o livro | "Ao devolver um livro: `livro.disponivel = true`" |

---

## 6. Criar o Controller

Crie `src/emprestimo/emprestimo.controller.ts`:

```ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { EmprestimoService } from './emprestimo.service';
import { CriarEmprestimoDto } from './dto/criar-emprestimo.dto';

@Controller('emprestimos')
export class EmprestimoController {
  constructor(private readonly emprestimoService: EmprestimoService) {}

  @Post()
  criar(@Body() dto: CriarEmprestimoDto) {
    return this.emprestimoService.criar(dto);
  }

  @Put(':id/devolucao')
  devolver(@Param('id', ParseIntPipe) id: number) {
    return this.emprestimoService.devolver(id);
  }

  @Get()
  listar() {
    return this.emprestimoService.listar();
  }
}
```

**O que cada parte faz:**

| Item | Função | Rota do escopo |
|---|---|---|
| `@Controller('emprestimos')` | Prefixa todas as rotas com `/emprestimos` | — |
| `@Post()` + `@Body()` | Cria empréstimo, validando o DTO | `POST /emprestimos` |
| `@Put(':id/devolucao')` + `@Param` | Registra a devolução do empréstimo `:id` | `PUT /emprestimos/:id/devolucao` |
| `@Get()` | Lista todos os empréstimos | `GET /emprestimos` |
| `ParseIntPipe` | Converte `:id` de string para número | Se vier `abc`, retorna `400` antes de chegar ao Service |
| `constructor(...)` | O Nest injeta o `EmprestimoService` | — |

---

## 7. Criar o Module

Crie `src/emprestimo/emprestimo.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Emprestimo } from './emprestimo.entity';
import { Livro } from '../livro/livro.entity';
import { EmprestimoService } from './emprestimo.service';
import { EmprestimoController } from './emprestimo.controller';
import { EMPRESTIMO_REPOSITORY } from './repository/emprestimo.repository';
import { EmprestimoRepositoryTypeOrm } from './repository/emprestimo.repository.typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Emprestimo, Livro])],
  controllers: [EmprestimoController],
  providers: [
    EmprestimoService,
    { provide: EMPRESTIMO_REPOSITORY, useClass: EmprestimoRepositoryTypeOrm },
  ],
})
export class EmprestimoModule {}
```

**Por que esse módulo é obrigatório:**

| Item | Função | Por que está assim |
|---|---|---|
| `TypeOrmModule.forFeature([Emprestimo, Livro])` | Registra os repositórios do TypeORM para as duas entidades | O `EmprestimoRepositoryTypeOrm` injeta `@InjectRepository(Emprestimo)` e `@InjectRepository(Livro)` — os dois precisam estar registrados |
| `controllers: [EmprestimoController]` | Diz ao Nest que o Controller pertence a este módulo | Sem isso, as rotas `/emprestimos` não existem |
| `providers: [EmprestimoService, ...]` | Registra o Service e o token | O Service precisa ser injetável; o token precisa de um "de/para" |
| `{ provide: EMPRESTIMO_REPOSITORY, useClass: EmprestimoRepositoryTypeOrm }` | "Quando alguém pedir o Symbol `EMPRESTIMO_REPOSITORY`, instancie `EmprestimoRepositoryTypeOrm`" | É o que resolve o `@Inject(EMPRESTIMO_REPOSITORY)` no Service — sem isso, `UnknownDependenciesException` |

---

## 8. Registrar o `EmprestimoModule` no `AppModule`

Atualize `src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LivroModule } from './livro/livro.module';
import { EmprestimoModule } from './emprestimo/emprestimo.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'biblioteca',
      autoLoadEntities: true,
      synchronize: true,
    }),
    LivroModule,
    EmprestimoModule,
  ],
})
export class AppModule {}
```

**Por que essas mudanças:**

| Item | Função | Por que está assim |
|---|---|---|
| `import { EmprestimoModule }` | Trazer a classe do módulo para o `AppModule` | — |
| `EmprestimoModule` em `imports` | Sem essa linha, o Nest não carrega o módulo, e as rotas `/emprestimos` **não existem** na aplicação (mesmo com Controller e Service prontos) | — |
| Remoção de `entities: [Livro]` no `forRoot` | `autoLoadEntities: true` já carrega tudo que for registrado via `forFeature` nos módulos | Manter as duas coisas é redundante (ponto já registrado no diário do módulo Livro) |

---

## 9. Testes com `curl`

### 9.1 Verificação prévia no banco

Antes de testar as rotas, é útil confirmar que a coluna `data_devolucao` aceita `NULL` (é o que permite o empréstimo nascer "ativo") e que o livro de teste está disponível:

```bash
docker compose exec db psql -U postgres -d biblioteca -c \
  "SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'emprestimos' AND column_name = 'data_devolucao';"
```

Resposta:
```
  column_name   | is_nullable 
----------------+-------------
 data_devolucao | YES
(1 row)
```

E forçar o livro de teste a ficar disponível (caso testes anteriores tenham deixado ele emprestado):

```bash
docker compose exec db psql -U postgres -d biblioteca -c \
  "UPDATE livros SET disponivel = true WHERE id = 1;"
```

Resposta:
```
UPDATE 1
```

### 9.2 Criar um empréstimo (sucesso)

```bash
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"livro_id": 1, "leitor": "João"}'
```

Resposta:
```json
{
  "id": 1,
  "livro": {"id": 1, "titulo": "Teste Docker", "autor": "Eu", "isbn": "999", "disponivel": false},
  "leitor": "João",
  "data_emprestimo": "2026-11-18T20:54:00.363Z",
  "data_devolucao": null,
  "status": "ATIVO"
}
```

Note que `livro.disponivel` passou a ser `false` e `data_devolucao` está `null`.

### 9.3 Tentar emprestar o mesmo livro (deve dar 409)

```bash
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"livro_id": 1, "leitor": "Maria"}'
```

Resposta:
```json
{"message":"Livro indisponível para empréstimo","error":"Conflict","statusCode":409}
```

✅ Regra do escopo validada: **"Não emprestar um livro indisponível — retornar HTTP 409"**.

### 9.4 Devolver o empréstimo

```bash
curl -X PUT http://localhost:3000/emprestimos/1/devolucao
```

Resposta:
```json
{
  "id": 1,
  "livro": {"id": 1, "titulo": "Teste Docker", "autor": "Eu", "isbn": "999", "disponivel": true},
  "leitor": "João",
  "data_emprestimo": "2026-11-18T20:54:00.363Z",
  "data_devolucao": "2026-11-18T20:54:59.475Z",
  "status": "DEVOLVIDO"
}
```

Note que `livro.disponivel` voltou a ser `true`, `data_devolucao` foi preenchida e `status` virou `DEVOLVIDO`.

### 9.5 Devolver o mesmo empréstimo de novo (deve dar 409)

```bash
curl -X PUT http://localhost:3000/emprestimos/1/devolucao
```

Resposta:
```json
{"message":"Empréstimo já devolvido","error":"Conflict","statusCode":409}
```

✅ Regra do escopo validada: **"Não devolver empréstimo já devolvido — retornar HTTP 409"**.

### 9.6 Listar empréstimos

```bash
curl http://localhost:3000/emprestimos
```

Resposta:
```json
[
  {
    "id": 1,
    "livro": {"id": 1, "titulo": "Teste Docker", "autor": "Eu", "isbn": "999", "disponivel": true},
    "leitor": "João",
    "data_emprestimo": "2026-11-18T20:54:00.363Z",
    "data_devolucao": "2026-11-18T20:54:59.475Z",
    "status": "DEVOLVIDO"
  }
]
```

### 9.7 Conferir estado dos livros (livro liberado após devolução)

```bash
curl http://localhost:3000/livros
```

Resposta (parcial):
```json
[
  {"id": 2, "titulo": "DIP", "autor": "Teste", "isbn": "111", "disponivel": true},
  {"id": 1, "titulo": "Teste Docker", "autor": "Eu", "isbn": "999", "disponivel": true}
]
```

✅ O livro `id=1` aparece com `disponivel: true` — a devolução liberou o livro corretamente.

### 9.8 Payload inválido (validação funcionando)

```bash
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"livro_id": "abc", "leitor": ""}'
```

Resposta:
```json
{
  "message": [
    "livro_id must be an integer number",
    "leitor should not be empty"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

Note que **o Service nunca é chamado** quando a validação falha: o `ValidationPipe` intercepta e devolve `400 Bad Request` antes.

---

## Resumo dos testes

| # | Teste | Resultado esperado | Resultado obtido |
|---|---|---|---|
| 1 | `data_devolucao` aceita NULL no banco | `is_nullable = YES` | ✅ |
| 2 | Criar empréstimo válido | `201` + `status: ATIVO` + `livro.disponivel: false` | ✅ |
| 3 | Emprestar livro já emprestado | `409 Conflict` — "Livro indisponível" | ✅ |
| 4 | Devolver empréstimo ativo | `200` + `status: DEVOLVIDO` + `data_devolucao` preenchida + `livro.disponivel: true` | ✅ |
| 5 | Devolver empréstimo já devolvido | `409 Conflict` — "Empréstimo já devolvido" | ✅ |
| 6 | Listar empréstimos | `200` + array com relação `livro` carregada | ✅ |
| 7 | Conferir livros após devolução | Livro volta a `disponivel: true` | ✅ |
| 8 | Payload inválido | `400 Bad Request` com mensagens de validação | ✅ |

---

## Resumo do fluxo completo

**Criar empréstimo:**
```
Cliente → POST /emprestimos
   ↓
EmprestimoController (@Body valida com ValidationPipe + whitelist)
   ↓
EmprestimoService.criar(dto)
   ↓
EmprestimoRepository.buscarLivroPorId → SELECT livro
   ↓
EmprestimoRepository.atualizarLivro → UPDATE livro.disponivel = false
   ↓
EmprestimoRepository.criar → INSERT empréstimo (status = ATIVO)
   ↓
Retorna JSON com empréstimo + livro (disponivel = false)
```

**Devolver empréstimo:**
```
Cliente → PUT /emprestimos/:id/devolucao
   ↓
EmprestimoController (@Param com ParseIntPipe)
   ↓
EmprestimoService.devolver(id)
   ↓
EmprestimoRepository.buscarPorId → SELECT empréstimo + livro (JOIN)
   ↓
EmprestimoRepository.atualizarLivro → UPDATE livro.disponivel = true
   ↓
EmprestimoRepository.atualizar → UPDATE empréstimo (status = DEVOLVIDO, data_devolucao = now())
   ↓
Retorna JSON com empréstimo devolvido + livro (disponivel = true)
```

---