import { PrismaClient } from '@prisma/client';
import {
  DadosCriacaoPedido,
  IRepositorioPedido,
  DadosPedido,
} from './IRepositorioPedido';
import { DadosProduto } from '../dominio/FabricaProduto';

export class RepositorioPedidoPrisma implements IRepositorioPedido {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarProdutoPorId(id: number): Promise<DadosProduto | null> {
    return this.prisma.produto.findUnique({ where: { id } });
  }

  async criarPedido(dados: DadosCriacaoPedido): Promise<DadosPedido> {
    return this.prisma.pedido.create({ data: dados });
  }
}
