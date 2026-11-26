# Exclusões - 26/11/2027 (15:44)
## Gustavo Vinícius Coinete Silva

Os arquivos 
* src/app.controller.spec.ts
* app.controller.ts
* app.service.ts

foram excluídos, pois não eram usados pelo sistema. Serviam apenas de exemplo para mostrar como o Nest funcionava.

| Arquivo | Função |
|---|---|
| app.service.ts | tinha um método que devolve o texto "Hello World!". É o exemplo de uma regra de negócio. |
| app.controller | respondia GET / chamando esse service. É o exemplo de uma rota. |
| app.controller.spec.ts | é o teste do exemplo: confere se o controller devolve "Hello World!". |

### Contras
O único contrapeso à exclusão dos arquivos é que sem o app.controller.spec.ts, o comando `npm test` falha. Contudo, isso não muda o funcionamento do sistema da Biblioteca, até onde foi avaliado.