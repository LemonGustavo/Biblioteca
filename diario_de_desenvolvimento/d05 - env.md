# Env - 25/11/2027 (23:03)
## Gustavo Vinícius Coinete Silva

Foi criado o arquivo .env com as informações de acesso ao banco de dados

DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USER=postgres
DATABASE_PASSWORD=SUA_SENHA
DATABASE_NAME=biblioteca

Ele foi adicionado ao git ignore para que o GitHub não o puxasse para o repositório, e os arquivos docker-compose.yaml, app.module foram editados para buscar as informações diretamente dele.

app.module recebeu a ConfigModule.forRoot({isGlobal: true}) do Nest, que serve para carregar as variáveis de acesso uma única vez no módulo raiz da aplicação e disponibilizá-las globalmente para todos os outros módulos, sem a necessidade de importar o ConfigModule repetidamente em cada um deles.