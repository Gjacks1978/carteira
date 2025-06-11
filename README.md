# Carteira - Gerenciador de Portfólio de Investimentos

![image](https://github.com/user-attachments/assets/e0e7e11f-1e4a-4b71-8869-2f2249764720)

## 🚀 Visão Geral

**Carteira** é uma aplicação web moderna e intuitiva para gerenciamento de um portfólio de investimentos diversificado. Desenvolvida com foco em usabilidade e performance, a plataforma permite que os usuários acompanhem seus ativos, desde criptomoedas a ações, de forma centralizada e eficiente.

## ✨ Funcionalidades Principais

- **Dashboard Intuitivo**: Visualize o valor total do seu portfólio, lucros/perdas e alocação de ativos em um piscar de olhos.
- **Gerenciamento de Ativos**: Adicione, edite e remova diferentes tipos de ativos (Criptomoedas, Ações, Fundos Imobiliários, etc.).
- **Categorização Flexível**: Crie e gerencie suas próprias categorias de ativos para uma organização personalizada.
- **Histórico de Portfólio (Snapshots)**: Tire "fotos" do seu portfólio em qualquer momento para analisar a evolução e o desempenho ao longo do tempo.
- **Integração com Supabase**: Autenticação segura e persistência de dados em tempo real.
- **Design Responsivo**: Acesse sua carteira em qualquer dispositivo, seja no desktop ou no celular.
- **Temas Claro e Escuro**: Personalize a aparência da aplicação para sua preferência.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Vite
- **Estilização**: Tailwind CSS, shadcn/ui
- **Backend & Banco de Dados**: Supabase (Auth, Postgres, Edge Functions)
- **Gerenciamento de Estado**: React Hooks & Context API
- **Roteamento**: React Router DOM

## 🏁 Como Começar

### Pré-requisitos

- Node.js (v18 ou superior)
- npm (ou pnpm/yarn)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Gjacks1978/invest-control-flow.git
    cd invest-control-flow
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    - Renomeie o arquivo `.env.example` para `.env`.
    - Preencha as variáveis com suas credenciais do Supabase:
      ```env
      VITE_SUPABASE_URL=your-supabase-url
      VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
      ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  Acesse a aplicação em `http://localhost:5173` (ou a porta indicada no seu terminal).

## 🤝 Contribuição

Contribuições são muito bem-vindas! Se você tem ideias para novas funcionalidades, melhorias ou encontrou algum bug, sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.

## 📄 Licença

Este projeto está sob a licença MIT.
