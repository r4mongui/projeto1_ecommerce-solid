import { Request, Response } from 'express';
import { ErroAplicacao } from '../erros/ErroAplicacao';
import registrador from '../utilitarios/registrador';
import { ServicoPedido } from '../servicos/ServicoPedido';

export class ControladorPedido {
  constructor(private readonly servicoPedido: ServicoPedido) {}

  processarPedido = async (requisicao: Request, resposta: Response) => {
    try {
      const resultado = await this.servicoPedido.processar(requisicao.body);

      return resposta.json({
        mensagem: 'Pedido processado com sucesso',
        idPedido: resultado.idPedido,
        total: resultado.valorTotal,
        visualizacaoEmail: resultado.visualizacaoEmail,
      });
    } catch (erro: unknown) {
      if (erro instanceof ErroAplicacao) {
        registrador.warn(`Falha ao processar pedido: ${erro.message}`);
        return resposta.status(erro.codigoStatus).json({ erro: erro.message });
      }

      const mensagem = erro instanceof Error ? erro.message : 'Erro desconhecido';
      registrador.error(`Erro ao processar pedido: ${mensagem}`);
      return resposta.status(500).json({ erro: 'Erro interno' });
    }
  };
}
