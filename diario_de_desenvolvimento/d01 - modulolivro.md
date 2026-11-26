# Módulo Livro - 17/11/2027 (17:02)
## Gustavo Vinícius Coinete Silva
Foi feito o módulo Livro, seguindo o passo a passo e explicações abaixo:

## 1. Criar o projeto NestJS

```bash
# Instala a CLI do NestJS globalmente (permite rodar "nest ..." em qualquer pasta)
npm i -g @nestjs/cli

# Cria o projeto "biblioteca"
nest new biblioteca
# Responda as perguntas no terminal
# > npm
# > Y
# > CJS (CommonJS)
# > n

cd biblioteca
```

**Por que `CommonJS`?** É o formato de módulos que funciona sem configuração extra no Node. Se escolher ESM, alguns imports precisarão de ajustes.

---

## 2. Instalar dependências de banco e validação

```bash
# TypeORM (ORM) + driver oficial do PostgreSQL
npm install @nestjs/typeorm typeorm pg

# Validação de DTOs (payloads inválidos são rejeitados antes de chegar ao Service)
npm install class-validator class-transformer
```

- `@nestjs/typeorm` → integração oficial entre Nest e TypeORM.
- `typeorm` → ORM que mapeia classes TypeScript para tabelas SQL.
- `pg` → driver de conexão com o PostgreSQL.
- `class-validator` → decorators como `@IsString`, `@IsNotEmpty` usados nos DTOs.
- `class-transformer` → converte o JSON da requisição em instância da classe DTO (necessário para a validação funcionar).

---

## 3. Criar o banco no pgAdmin

Abra o pgAdmin, conecte ao servidor PostgreSQL local e crie um banco chamado **`biblioteca`**. As credenciais usadas na conexão do Nest (host, porta, usuário, senha) devem corresponder a esse servidor.

---

## 4. Configurar o `app.module.ts` (conexão com o banco)

Substitua todo o conteúdo de `src/app.module.ts` por:

```ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'biblioteca',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
})
export class AppModule {}
```

**O que cada opção faz:**

| Opção | Função |
|---|---|
| `type: 'postgres'` | Diz ao TypeORM qual driver usar |
| `host` / `port` / `username` / `password` | Credenciais do PostgreSQL |
| `database: 'biblioteca'` | Banco que será usado |
| `autoLoadEntities: true` | Carrega automaticamente entidades registradas via `forFeature` |
| `synchronize: true` | Cria/atualiza tabelas automaticamente conforme as entidades (**apenas em desenvolvimento!**) |

---

## 5. Ajustar o `main.ts`

Remova qualquer referência a `Observe` (se houver) e adicione o `ValidationPipe` global:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
```

`whitelist: true` → o Nest **remove automaticamente** qualquer campo do JSON que não esteja declarado no DTO. Se o cliente enviar `{"titulo": "...", "hack": "x"}`, o `hack` é descartado antes de chegar ao Service. Isso protege contra injeção de campos extras.

---

## 6. Testar a conexão

```bash
npm run start:dev
```

Se aparecer no terminal algo como `TypeOrmModule dependencies initialized` e **sem erros**, a conexão está funcionando. Pode dar Ctrl + C para parar a conexão, isto é apenas um teste.

---

## 7. Criar a entidade `Livro`

Crie a pasta `src/livro` e, dentro dela, o arquivo `livro.ts`:

```ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('livros')
export class Livro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  autor: string;

  @Column()
  isbn: string;

  @Column({ default: true })
  disponivel: boolean;
}
```

**Anatomia:**

- `@Entity('livros')` → a classe representa a tabela `livros` no banco.
- `@PrimaryGeneratedColumn()` → `id` é auto-incrementado.
- `@Column()` → cada campo vira uma coluna.
- `default: true` → o campo `disponivel` começa como `true` se não for informado.

---

## 8. Criar o DTO de criação

Crie `src/livro/dto/criar-livro.dto.ts`:

```ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CriarLivroDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  autor: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;
}
```

**Por que um DTO e não a própria entidade?**

- `@IsString()` → rejeita números, booleanos, objetos.
- `@IsNotEmpty()` → rejeita strings vazias (`""`).
- `id` e `disponivel` **não estão aqui** → o cliente não pode escolher esses valores; são gerados pelo banco.
- Separar entidade (banco) e DTO (entrada) evita que campos internos vazem para a API.

---

## 9. Criar o Service

`src/livro/livro.service.ts`:

```ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Livro } from "./livro";
import { CriarLivroDto } from "./dto/criar-livro.dto";

@Injectable()
export class LivroService {
  constructor(
    @InjectRepository(Livro)
    private readonly livroRepository: Repository<Livro>,
  ) {}

  async criar(dto: CriarLivroDto): Promise<Livro> {
    const livro = this.livroRepository.create(dto);
    return this.livroRepository.save(livro);
  }

  async listar(): Promise<Livro[]> {
    return this.livroRepository.find();
  }
}
```

**O que acontece aqui:**

- `@Injectable()` → marca a classe como "provider" que o Nest pode injetar em quem pedir.
- `@InjectRepository(Livro)` → pede ao TypeORM o repositório da entidade `Livro`. Só funciona se o módulo registrar `TypeOrmModule.forFeature([Livro])` (ver Passo 11).
- `create(dto)` → monta um objeto `Livro` **em memória** (sem salvar).
- `save(livro)` → faz o `INSERT` no banco e devolve o objeto com `id` e `disponivel` preenchidos.
- `find()` → faz `SELECT * FROM livros`.

---

## 10. Criar o Controller

`src/livro/livro.controller.ts`:

```ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { LivroService } from './livro';
import { CriarLivroDto } from './dto/criar-livro.dto';

@Controller('livros')
export class LivroController {
  constructor(private readonly livroService: LivroService) {}

  @Post()
  criar(@Body() dto: CriarLivroDto) {
    return this.livroService.criar(dto);
  }

  @Get()
  listar() {
    return this.livroService.listar();
  }
}
```

**O que cada parte faz:**

| Item | Função |
|---|---|
| `@Controller('livros')` | Prefixa todas as rotas desta classe com `/livros` |
| `@Post()` | `POST /livros` |
| `@Get()` | `GET /livros` |
| `@Body()` | Extrai o corpo JSON e valida contra o `CriarLivroDto` |
| `constructor(...)` | O Nest injeta o `LivroService` automaticamente |

---

## 11. Criar o Module

`src/livro/livro.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Livro } from './livro';
import { LivroService } from './livro.service';
import { LivroController } from './livro.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Livro])],
  controllers: [LivroController],
  providers: [LivroService],
})
export class LivroModule {}
```

**Por que esse módulo é obrigatório:**

- `TypeOrmModule.forFeature([Livro])` → registra o repositório de `Livro` **no escopo deste módulo**. Sem isso, o `@InjectRepository(Livro)` no Service lança erro na inicialização.
- `controllers: [LivroController]` → informa ao Nest que este Controller pertence ao módulo.
- `providers: [LivroService]` → registra o Service para injeção.

---

## 12. Registrar o `LivroModule` no `AppModule`

Atualize `src/app.module.ts` para incluir `LivroModule` na lista de `imports`:

```ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LivroModule } from "./livro/livro.module";
import { Livro } from "./livro/livro";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'biblioteca',
      entities: [Livro],
      autoLoadEntities: true,
      synchronize: true,
    }),
    LivroModule,
  ],
})
export class AppModule {}
```

Sem essa linha, as rotas `/livros` não existiriam na aplicação, mesmo com o Controller criado.

---

## 13. Testes com `curl`

Com `npm run start:dev` rodando:

**Criar um livro (sucesso):**
```bash
curl -X POST http://localhost:3000/livros \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"123"}'
```

Resposta:
```json
{"id":1,"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"123","disponivel":true}
```

**Listar livros:**
```bash
curl http://localhost:3000/livros
```

Resposta:
```json
[{"id":1,"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"123","disponivel":true}]
```

**Payload inválido (validação funcionando):**
```bash
curl -X POST http://localhost:3000/livros \
  -H "Content-Type: application/json" \
  -d '{"titulo":""}'
```

Resposta:
```json
{
  "message": [
    "titulo should not be empty",
    "autor should not be empty",
    "autor must be a string",
    "isbn should not be empty",
    "isbn must be a string"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

Note que **o Service nunca é chamado** quando a validação falha: o `ValidationPipe` intercepta e devolve `400 Bad Request` antes.

---

## Resumo do fluxo completo

```
Cliente → POST /livros
   ↓
LivroController (@Body valida com ValidationPipe + whitelist)
   ↓
LivroService.criar(dto)
   ↓
Repository.create + save → INSERT no PostgreSQL
   ↓
Retorna JSON com id e disponivel
```
