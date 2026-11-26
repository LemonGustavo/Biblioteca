# Testes - 26/11/2027 (17:27)
## Gustavo Vinícius Coinete Silva

Os testes foram feitos no terminal do VS Code.

### Construindo o ambiente
Antes de começar os testes, foram usados os comandos
 `docker compose up -d db`
Esse comando sobe o container do banco de dados em segundo plano (-d).

 e, em sequência
 `npm run start:dev`
 Inicia o servidor NestJS em modo de desenvolvimento (com watch, que reinicia automaticamente ao salvar arquivos).

### Teste 1 – Cadastrar livro
Esperado: livro criado com `disponivel: true`.
```
curl -X POST http://localhost:3000/livros \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"123"}'
```
Saída (cortada no terminal):
```
{"id":1,"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"1 [cortado]
```
Registro completo, visto depois com `GET /livros`:
```
[{"id":1,"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"123","disponivel":true}]
```
Resultado: OK.

### Teste 2 – Validação de entrada
Esperado: 400 com mensagens de validação.
```
curl -X POST http://localhost:3000/livros \
  -H "Content-Type: application/json" \
  -d '{"titulo":""}'
```
Saída:
```
{"message":["titulo should not be empty","autor should not be empty","autor must be a string","isbn should not be empty","isbn must be a string"],"error":"Bad Request","statusCode":400}
```
Resultado: OK.

### Teste 3 – Criar empréstimo (regra 2)
Esperado: empréstimo `ATIVO` e livro com `disponivel: false`.
```
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"livro_id":1,"leitor":"João"}'

curl http://localhost:3000/livros
```
Saída:
```
{"id":1,"livro":{"id":1,"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"123","disponivel":false},"leitor":"João","data_emprestimo":"2026-11-27T01:19:23.234Z","data_devolucao":null,"status":"ATIVO"}
[{"id":1,"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"123","disponivel":false}]
```
Resultado: OK.

### Teste 4 – Emprestar livro indisponível (regra 1)
Esperado: 409.

Preparação: como o livro 1 já tinha sido devolvido, foi criado um novo empréstimo para ele.
```
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"livro_id":1,"leitor":"João"}'
```
Saída (cortada no terminal):
```
{"id":2,"livro":{"id":1,"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"123","disponivel":false},"leitor":"João","data_emprestimo":"2026-11-27T01:24:40.871Z","data_devolucao":null,"status":"ATI [cortado]
```
Teste: o mesmo pedido foi repetido logo em seguida.
```
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"livro_id":1,"leitor":"João"}'
```
Saída:
```
{"message":"Livro indisponível para empréstimo","error":"Conflict","statusCode":409}
```
Resultado: OK.

### Teste 5 – Livro que não existe
Esperado: 404.
```
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"livro_id":999,"leitor":"Maria"}'
```
Saída (cortada no terminal):
```
{"message":"Livro não encontrado","error":"Not Found","statusCode":4 [cortado]
```
Resultado: OK (a mensagem "Not Found" corresponde ao 404, mas o número ficou cortado).

### Teste 6 – Devolver livro (regra 3)
Esperado: status `DEVOLVIDO`, `data_devolucao` preenchida e livro com `disponivel: true`.
```
curl -X PUT http://localhost:3000/emprestimos/1/devolucao
```
Saída (cortada no terminal):
```
{"id":1,"livro":{"id":1,"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"123","disponivel":true},"leitor":"João","data_emprestimo":"2026-11-27T01:19:23.234Z","data_devolucao":"2026-11-26T21:20:30"
```
Conferência do livro:s
```
curl http://localhost:3000/livros
```
```
[{"id":1,"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"123","disponivel":true}]
```
Conferência completa do empréstimo:
```
curl http://localhost:3000/emprestimos
```
```
[{"id":1,"livro":{"id":1,"titulo":"Dom Casmurro","autor":"Machado de Assis","isbn":"123","disponivel":true},"leitor":"João","data_emprestimo":"2026-11-27T01:19:23.234Z","data_devolucao":"2026-11-26T21:20:32.569Z","status":"DEVOLVIDO"}]
```
Resultado: OK.

### Teste 7 – Devolver duas vezes (regra 4)
Esperado: 409.
```
curl -X PUT http://localhost:3000/emprestimos/1/devolucao
```
Saída:
```
{"message":"Empréstimo já devolvido","error":"Conflict","statusCode":409}
```
Resultado: OK.