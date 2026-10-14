import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { ProvedorEmailEthereal } from '../src/provedores/ProvedorEmailEthereal';
import aplicacao from '../src/aplicacao';

// O teste verifica HTTP e banco sem depender de SMTP externo.
ProvedorEmailEthereal.prototype.enviarEmail = async () => ({ urlVisualizacao: null });
const prisma = new PrismaClient();
const servidor = aplicacao.listen(0);

async function verificar() {
  const endereco = servidor.address();
  assert(endereco && typeof endereco !== 'string');
  const url = `http://127.0.0.1:${endereco.port}/pedidos`;
  async function enviar(dados: unknown) {
    const resposta = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    return { codigo: resposta.status, dados: await resposta.json() as any };
  }
  const entrada = { cliente: 'teste@exemplo.com', itens: [{ idProduto: 1, quantidade: 1 }], metodoPagamento: 'cartao_credito', dadosPagamento: { numeroCartao: '1234567812345678', cvv: '123' } };
  for (const [metodoPagamento, idProduto, total] of [['cartao_credito', 1, 110], ['cartao_debito', 1, 110], ['pix', 2, 50]] as const) {
    const resposta = await enviar({ ...entrada, metodoPagamento, itens: [{ idProduto, quantidade: 1 }] });
    assert.equal(resposta.codigo, 200);
    assert.equal(resposta.dados.total, total);
    const pedido = await prisma.pedido.findUniqueOrThrow({ where: { id: resposta.dados.idPedido } });
    try {
      assert.equal(pedido.situacao, 'confirmado');
      assert.equal(pedido.total, total);
      const itens = JSON.parse(pedido.itens);
      assert.equal(itens[0].quantidade, 1);
      assert.equal(itens[0].frete, idProduto === 1 ? 10 : 0);
    } finally {
      await prisma.pedido.delete({ where: { id: pedido.id } });
    }
  }
  for (const dados of [
    { ...entrada, itens: [] },
    { ...entrada, itens: [{ idProduto: 1, quantidade: 0 }] },
    { ...entrada, itens: [{ idProduto: 999999, quantidade: 1 }] },
    { ...entrada, metodoPagamento: 'inexistente' },
    { ...entrada, dadosPagamento: { numeroCartao: '1234', cvv: '000' } },
  ]) {
    const resposta = await enviar(dados);
    assert.equal(resposta.codigo, 400);
    assert.equal(typeof resposta.dados.erro, 'string');
  }
  console.log('Verificações de pedidos concluídas: crédito, débito, Pix, persistência e cinco casos inválidos.');
}
verificar().catch((erro) => { console.error(erro); process.exitCode = 1; }).finally(async () => {
  servidor.close();
  await prisma.$disconnect();
});
