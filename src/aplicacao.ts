import { PrismaClient } from '@prisma/client';
import express from 'express';
import { ControladorPedido } from './controladores/ControladorPedido';
import { PagamentoCartaoCredito } from './pagamentos/PagamentoCartaoCredito';
import { PagamentoCartaoDebito } from './pagamentos/PagamentoCartaoDebito';
import { FabricaMetodoPagamento } from './pagamentos/FabricaMetodoPagamento';
import { PagamentoPix } from './pagamentos/PagamentoPix';
import { ProvedorEmailEthereal } from './provedores/ProvedorEmailEthereal';
import { RepositorioPedidoPrisma } from './repositorios/RepositorioPedidoPrisma';
import { ServicoNotificacao } from './servicos/ServicoNotificacao';
import { ServicoPedido } from './servicos/ServicoPedido';

const aplicacao = express();
aplicacao.use(express.json());

const prisma = new PrismaClient();
const repositorioPedido = new RepositorioPedidoPrisma(prisma);
const provedorEmail = new ProvedorEmailEthereal();
const servicoNotificacao = new ServicoNotificacao(provedorEmail);
const fabricaMetodoPagamento = new FabricaMetodoPagamento([
  new PagamentoCartaoCredito(),
  new PagamentoCartaoDebito(),
  new PagamentoPix(),
]);
const servicoPedido = new ServicoPedido(
  repositorioPedido,
  fabricaMetodoPagamento,
  servicoNotificacao,
);
const controladorPedido = new ControladorPedido(servicoPedido);

aplicacao.post('/pedidos', controladorPedido.processarPedido);

export default aplicacao;
