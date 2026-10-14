# Projeto 1 - Comércio eletrônico refatorado com SOLID

Refatoração do projeto de comércio eletrônico legado disponibilizado para a atividade. O objetivo foi remover as responsabilidades concentradas no `ControladorPedido` e aplicar princípios SOLID com nomes e contrato da API em português.

## Princípios aplicados

### SRP - Princípio da Responsabilidade Única
- `ControladorPedido`: somente recebe a requisição HTTP e devolve a resposta.
- `ServicoPedido`: orquestra o processamento do pedido.
- `ServicoNotificacao`: monta a notificação de confirmação.
- `RepositorioPedidoPrisma`: cuida exclusivamente da persistência com Prisma.
- `ProvedorEmailEthereal`: encapsula o Nodemailer/Ethereal.

### OCP - Princípio Aberto/Fechado
Os pagamentos implementam `IMetodoPagamento`. Para adicionar um novo método, basta criar outra classe e registrá-la na composição da aplicação, sem alterar o fluxo do `ServicoPedido`.

Métodos disponíveis:
- `cartao_credito`
- `cartao_debito`
- `pix`

### LSP - Princípio da Substituição de Liskov
Produtos implementam a mesma interface `Produto` e possuem sua própria regra de frete:
- `ProdutoFisico`: R$ 10,00 de frete.
- `ProdutoDigital`: frete R$ 0,00.

O `ServicoPedido` trabalha com o contrato `Produto`, sem condicionais para decidir a regra de frete.

### DIP - Princípio da Inversão de Dependência
`ServicoPedido` depende de abstrações (`IRepositorioPedido`, `IFabricaMetodoPagamento` e `IServicoNotificacao`) em vez de acessar Prisma, Nodemailer ou serviços de pagamento diretamente.

## Estrutura principal

```text
src/
├── controladores/
│   └── ControladorPedido.ts
├── dominio/
│   ├── IProduto.ts
│   ├── ProdutoFisico.ts
│   ├── ProdutoDigital.ts
│   └── FabricaProduto.ts
├── erros/
│   └── ErroAplicacao.ts
├── pagamentos/
│   ├── IMetodoPagamento.ts
│   ├── IFabricaMetodoPagamento.ts
│   ├── PagamentoCartaoCredito.ts
│   ├── PagamentoCartaoDebito.ts
│   ├── PagamentoPix.ts
│   └── FabricaMetodoPagamento.ts
├── provedores/
│   ├── IProvedorEmail.ts
│   └── ProvedorEmailEthereal.ts
├── repositorios/
│   ├── IRepositorioPedido.ts
│   └── RepositorioPedidoPrisma.ts
├── servicos/
│   ├── ServicoPedido.ts
│   ├── IServicoNotificacao.ts
│   └── ServicoNotificacao.ts
├── utilitarios/
│   ├── registrador.ts
│   └── email.ts
├── aplicacao.ts
└── servidor.ts
```

## Requisitos

- Node.js 20.6 ou superior
- npm

## Instalação

```bash
npm install
npm run prisma:gerar
npm run prisma:migrar
npm run prisma:popular
```

## Validar o TypeScript

```bash
npm run verificar
```

## Verificar os pedidos

```bash
npm run testar
```

Verifica os três pagamentos, persistência, frete e entradas inválidas. O e-mail é simulado neste teste, sem conexão SMTP.

## Executar

```bash
npm run desenvolver
```

Servidor: `http://localhost:3000`

## Testes manuais

### Livro físico com cartão

```bash
curl -X POST http://localhost:3000/pedidos \
-H "Content-Type: application/json" \
-d '{
  "cliente": "teste@exemplo.com",
  "itens": [{ "idProduto": 1, "quantidade": 1 }],
  "metodoPagamento": "cartao_credito",
  "dadosPagamento": { "numeroCartao": "1234567812345678", "cvv": "123" }
}'
```

Total esperado: **R$ 110,00**.

### Livro digital com Pix

```bash
curl -X POST http://localhost:3000/pedidos \
-H "Content-Type: application/json" \
-d '{
  "cliente": "teste@exemplo.com",
  "itens": [{ "idProduto": 2, "quantidade": 1 }],
  "metodoPagamento": "pix",
  "dadosPagamento": { "chavePix": "teste@exemplo.com" }
}'
```

Total esperado: **R$ 50,00**, sem frete.

## Observação

O envio de e-mail usa uma conta de testes do Ethereal. A resposta da API inclui `visualizacaoEmail` quando o Ethereal retorna uma URL de visualização.

## Compatibilidade

A rota é `POST /pedidos`; os campos dos exemplos acima também estão em português. O contrato antigo `/orders` foi substituído. Os comandos npm foram traduzidos. Nomes reservados das ferramentas e APIs externas permanecem como exigidos por elas. Os modelos Prisma usam mapeamento para preservar as tabelas e colunas existentes.
