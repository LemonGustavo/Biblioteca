# Docker - 18/11/2027 (15:23)
## Gustavo Vinícius Coinete Silva

O docker foi configurado, seguindo o passo a passo e explicações abaixo:

## 1. Criação do `Dockerfile` (raiz do projeto)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]
```

**Pontos importantes:**
- Imagem base leve (`node:20-alpine`).
- `COPY package*.json` antes do `npm install` para aproveitar cache de camadas.
- `CMD` usando `start:dev` (modo watch) — adequado para desenvolvimento.

---

## 2. Criação do `docker-compose.yaml`

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - DATABASE_HOST=db  # Nome do serviço do banco, não localhost
      - DATABASE_PORT=5432
      - DATABASE_USER=postgres
      - DATABASE_PASSWORD=sua_senha
      - DATABASE_NAME=biblioteca
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    ports:
      - "5433:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=sua_senha
      - POSTGRES_DB=biblioteca
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Pontos importantes:**
- `DATABASE_HOST=db` — dentro da rede Docker o host é o **nome do serviço**, não `localhost`.
- Volume anônimo `/app/node_modules` evita que o bind mount `.:/app` sobrescreva os módulos instalados dentro do container.
- Volume nomeado `postgres_data` garante persistência do banco.
- `depends_on` apenas ordena a subida — não espera o banco estar *ready* (pode ser necessário healthcheck no futuro).

---

## 3. Ajuste no `app.module.ts`

```ts
host: process.env.DATABASE_HOST || 'localhost',
```

**Motivo:** permitir que o host do banco seja configurável via variável de ambiente (essencial no Docker, onde o host é `db`).

**Limpeza adicional:** remoção de `entities: [Livro]` do `TypeOrmModule.forRoot` — era redundante, pois a entidade já é registrada via `TypeOrmModule.forFeature([Livro])` no módulo do livro.

---

## 4. Testes e problemas encontrados

### 4.1 Build
```bash
docker compose build
```
- Lê o `Dockerfile` da API e baixa a imagem do Postgres.
- Erros de sintaxe no `Dockerfile` ou dependências faltando aparecem aqui.

### 4.2 Subida dos containers
```bash
docker compose up -d
```

**❌ Erro encontrado:** porta `5432` já em uso (provavelmente por um Postgres local).

**✅ Solução:** alterar o mapeamento da porta do host:
```yaml
db:
  ports:
    - "5433:5432"   # host:container
```

> ℹ️ A API continua acessando o banco pela porta `5432` **interna** (rede Docker). Apenas o acesso externo (ex.: DBeaver, psql local) passou a usar `5433`.

### 4.3 Recuperação após falha
```bash
docker-compose down
```
Usado para derrubar containers e restaurar o estado após o erro de porta.

### 4.4 Logs da API
```bash
docker compose logs -f api
```
Acompanhamento em tempo real dos logs da aplicação — útil para verificar conexão com o banco e erros de inicialização.

---

## 5. Teste funcional (smoke test)

```bash
curl -X POST http://localhost:3000/livros \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Teste Docker","autor":"Eu","isbn":"999"}'
```

**Resposta:**
```json
{
  "id": 1,
  "titulo": "Teste Docker",
  "autor": "Eu",
  "isbn": "999",
  "disponivel": true
}
```

✅ **Sucesso** — API rodando em container conectada ao Postgres em container, criando registros corretamente.

---

