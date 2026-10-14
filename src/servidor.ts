import aplicacao from './aplicacao';

const PORTA = 3000;

aplicacao.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
