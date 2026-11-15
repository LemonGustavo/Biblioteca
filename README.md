# Sistema de Biblioteca
## Arquitetura escolhida
Monolito em camadas com camadas fechadas:
Controller < Service < Repository < Banco de dados

- Cada domínio é um módulo NestJS (`LivroModule`, `EmprestimoModule`)
- Controller: recebe HTTP, valida entrada (DTO/Pipe), chama o Service. Não deverá acessar o Repository.
- Service: regras de negócio. Não deve conhecer HTTP, nem SQL.
- Repository: acessa os dados. Não tem regras de negócio.
- Injeção de dependência via container Nest; repositórios serão registrados por tokens (Symbol).

## Entidades do sistema
### Livro
* id
* titulo (string)
* autor (string)
* isbn (string)
* disponivel (boolean, default true)

### Emprestimo
* id
* livro_id
* leitor (string)
* data_emprestimo
* data_devolucao
* status (ATIVO ou DEVOLVIDO)

## Rotas
| Método | Rota | Função |
|---|---|---|
| POST | /livros | Cadastra livro |
| GET | /livros | Lista os livros |
| POST | /emprestimos | Cria empréstimo (valida se o livro está disponível |
| PUT | /emprestimos/{id}/devolucao | Registra quando o livro é devolvido |
| GET | /emprestimos | Lista os empréstimos |

## Regras de negócio (Camada Service)
1. Não emprestar um livro indisponível - retornar HTTP 409
2. Ao criar um empréstimo: livro.disponivel = false
3. Ao devolver um livro: livro.disponivel = true, data_devolucao = now(), status = DEVOLVIDO
4. Não devolver empréstimo já devolvido - retornar HTTP 409

## Stack
- NestJS
- TypeORM + PostgreSQL
- Docker Compose

## Esqueleto do Sistema
``
src/
├── main.ts
├── app.module.ts
├── config/
│   └── typeorm.config.ts
├── livro/
│   ├── livro.module.ts
│   ├── livro.controller.ts
│   ├── livro.service.ts
│   ├── livro.entity.ts
│   ├── dto/
│   │   └── criar-livro.dto.ts
│   └── repository/
│       ├── livro.repository.ts (interface + token)
│       └── livro.repository.typeorm.ts (implementação)
└── emprestimo/
    ├── emprestimo.module.ts
    ├── emprestimo.controller.ts
    ├── emprestimo.service.ts
    ├── emprestimo.entity.ts
    ├── dto/
    │   └── criar-emprestimo.dto.ts
    └── repository/
        ├── emprestimo.repository.ts
        └── emprestimo.repository.typeorm.ts
``



