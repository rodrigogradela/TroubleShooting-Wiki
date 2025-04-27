# Bridgestone Troubleshooting Wiki

O **Troubleshooting Wiki** é uma aplicação web que permite aos usuários carregar, pesquisar e exportar documentos relacionados a soluções de problemas (troubleshooting). A aplicação suporta arquivos `.pptx`, `.pptm` e `.docx`, oferece busca por palavras-chave, exportação de resultados em PDF e notificações de sucesso ou falha.

## Funcionalidades

- **Upload de Arquivos**: Carregue arquivos `.pptx`, `.pptm` e `.docx`, mantendo os nomes originais e sobrescrevendo arquivos duplicados.
- **Busca por Palavras-chave**: Pesquise conteúdo dentro dos documentos e visualize os resultados em uma interface paginada.
- **Exportação de Resultados**: Exporte os resultados da busca como um arquivo PDF.
- **Notificações**: Receba notificações na tela para ações de upload e exportação (sucesso ou falha).

## Tecnologias Utilizadas

- **Frontend**: React, Axios, React-Toastify
- **Backend**: Node.js, Express, Multer
- **Outros**: Tailwind CSS (para estilização), PDFKit (para exportação de PDFs)



## Pré-requisitos

- **Node.js** (versão 16 ou superior)
- **npm** (geralmente instalado com o Node.js)

## Instalação e Execução

Siga os passos abaixo para rodar o projeto localmente:

### 1. Clonar o Repositório
```bash
git clone https://github.com/rodrigogradela/troubleshooting-wiki.git
cd troubleshooting-wiki
```

### 2. Instalar Dependências do Backend
```bash
cd backend
npm install
```

### 3. Instalar Dependências do Frontend
```bash
cd ../frontend
npm install
```

### 4. Executar o Backend
Na pasta `backend`, inicie o servidor:
```bash
npm start
```
O backend rodará em `http://localhost:3001`.

### 5. Executar o Frontend
Na pasta `frontend`, inicie o servidor de desenvolvimento:
```bash
npm run dev
```
O frontend rodará em `http://localhost:5173`.

### 6. Acessar a Aplicação
Abra seu navegador e acesse `http://localhost:5173`. Você verá a interface do Bridgestone Troubleshooting Wiki.

## Uso

1. **Carregar Documentos**:
   - Clique no botão de upload (ícone de seta para cima) na barra inferior.
   - Selecione um arquivo `.pptx`, `.pptm` ou `.docx`.
   - Você verá uma notificação de sucesso ou erro.

2. **Pesquisar**:
   - Digite um termo de busca na barra de pesquisa e pressione Enter.
   - Os resultados serão exibidos em uma lista paginada.

3. **Exportar Resultados**:
   - Após uma busca, clique no botão de exportação (ícone de download) para baixar os resultados como PDF.

## Possíveis Melhorias Futuras

- Adicionar suporte a mais formatos de arquivo (ex.: `.pdf`, `.txt`).
- Implementar filtros avançados para os resultados da busca.
- Adicionar um histórico de buscas para facilitar a reutilização.
- Integrar uma IA para interagir com os usuários e responder perguntas sobre os documentos (requer API paga).

## Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`).
3. Faça suas alterações e commit (`git commit -m "Adiciona nova funcionalidade"`).
4. Envie para o repositório remoto (`git push origin feature/nova-funcionalidade`).
5. Abra um Pull Request.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes (se aplicável).

## Contato

Se tiver dúvidas ou sugestões, entre em contato com [rodrigo_gradela@hotmail.com](mailto:rodrigo_gradela@hotmail.com).