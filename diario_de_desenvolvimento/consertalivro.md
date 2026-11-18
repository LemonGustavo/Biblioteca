# Consertar Livro - 18/11/2027 (15:40)
## Gustavo Vinícius Coinete Silva

Adequar o módulo Livro ao escopo arquitetural definido para o projeto, aplicando o Repository Pattern com Dependency Inversion Principle (DIP). O Service passa a depender de uma abstração (interface), e não da implementação concreta do TypeORM.

---

## Motivação

O módulo Livro foi implementado inicialmente **sem seguir o escopo**: o `LivroService` injetava diretamente `@InjectRepository(Livro)` do TypeORM, acoplando a camada de regras de negócio ao ORM.

O escopo exige:
- Cada módulo com seu próprio repositório em subpasta `repository/`;
- **Service não conhece HTTP nem SQL** — apenas regras de negócio;
- Separação entre **interface** (abstração) e **implementação** (concreta).

---

## Arquivos criados

### 1. `src/livro/repository/livro.repository.ts`

**Conteúdo:**
- `export const LIVRO_REPOSITORY = Symbol('LIVRO_REPOSITORY')`
- `interface LivroRepository` com os métodos `criar` e `listar`.

**Por quê:**
- Implementa o **DIP (Dependency Inversion Principle)** — o Service depende da abstração, não da implementação concreta.
- O `Symbol` é o **token** usado pelo Nest para injetar a implementação correta (evita colisão de nomes em strings).

---

### 2. `src/livro/repository/livro.repository.typeorm.ts`

**Conteúdo:**
- Classe `LivroRepositoryTypeOrm implements LivroRepository`.
- Usa `@InjectRepository(Livro)` **internamente**.
- Métodos `criar` / `listar` delegam ao `Repository<Livro>` do TypeORM.

**Por quê:**
- É a **implementação concreta** do repositório.
- O Service não conhece TypeORM; **somente essa classe** conhece.
- Mantém o Service livre de SQL/ORM, como o escopo exige.

---

## Arquivos alterados

### 3. `src/livro/livro.service.ts`

| Antes | Depois |
|---|---|
| `@InjectRepository(Livro) private readonly livroRepository: Repository<Livro>` | `@Inject(LIVRO_REPOSITORY) private readonly livroRepository: LivroRepository` |

**Por quê:** o Service agora depende da **interface**, não do TypeORM. Cumpre o escopo: *"Service: regras de negócio. Não deve conhecer HTTP, nem SQL."*

---

### 4. `src/livro/livro.module.ts`

| Antes | Depois |
|---|---|
| `providers: [LivroService]` | `providers: [LivroService, { provide: LIVRO_REPOSITORY, useClass: LivroRepositoryTypeOrm }]` |

**Por quê:** registra o token `LIVRO_REPOSITORY` no container Nest, dizendo *"quando alguém pedir esse Symbol, instancie `LivroRepositoryTypeOrm`"*. Sem isso, o `@Inject(LIVRO_REPOSITORY)` não tem de onde tirar a dependência — **causa do `UnknownDependenciesException`**.

---

## ⚠️ Ajustes de import (causa de erros de compilação)

### 5. Imports de `./livro.entity` → `./livro`

**Onde:** `livro.service.ts`, `livro.repository.ts`, `livro.repository.typeorm.ts`, `livro.module.ts`, `app.module.ts`.

**Por quê:** o arquivo da entidade permaneceu como `livro.ts` (não foi renomeado). Os imports apontavam para `./livro.entity`, que **não existia** — quebrava a compilação e, por consequência, a injeção de dependência.

### 6. `import type` para a interface `LivroRepository`

**Onde:** `livro.service.ts` e `livro.repository.typeorm.ts`.

**Por quê:** com `isolatedModules` + `emitDecoratorMetadata` ativos (padrão do `nest new`), interfaces usadas como tipo em **assinaturas decoradas** precisam de `import type`. Sem isso, o TypeScript tenta emitir uma referência em runtime a algo que só existe em tempo de compilação → **erro TS1272**.

---

## Resultado

- ✅ Módulo Livro alinhado ao escopo arquitetural.
- ✅ Service desacoplado do TypeORM (DIP aplicado).
- ✅ Repositório isolado em `repository/`, com interface + implementação separadas.
- ✅ Injeção de dependência funcionando via token `LIVRO_REPOSITORY`.
- ✅ Compilação corrigida (imports da entidade e `import type`).

---

## Próximos passos (backlog)

- [ ] Aplicar o mesmo padrão Repository + DIP nos demais módulos (ex.: Empréstimo, Usuário).
- [ ] Adicionar testes unitários do `LivroService` com um **mock** de `LivroRepository` — possível justamente por causa da abstração.
- [ ] Documentar o padrão no `README.md` do projeto.

---

## Comandos úteis

```bash
# rebuild da imagem após a refatoração
docker compose build api
docker compose up -d

# logs para validar injeção de dependência
docker compose logs -f api

# smoke test
curl -X POST http://localhost:3000/livros \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Refatoração Repository","autor":"Eu","isbn":"1000"}'
```