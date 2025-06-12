# Documentação do Projeto Carteira

## 📌 Visão Geral

O **Carteira** é uma aplicação web para gerenciamento de ativos financeiros, com foco especial em criptomoedas. A aplicação permite que os usuários acompanhem seus investimentos, visualizem a distribuição de ativos e monitorem o mercado em tempo real. O projeto utiliza uma stack moderna com React, TypeScript, Vite e Supabase para oferecer uma experiência rápida, segura e escalável.

## 🚀 Tecnologias Principais

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS
- **Componentes UI**: shadcn/ui (baseado em Radix UI)
- **Backend & Banco de Dados**: Supabase (Auth, Postgres, Edge Functions)
- **Gerenciamento de Estado**: React Hooks + Context API
- **Roteamento**: React Router DOM
- **Requisições HTTP**: `fetch` API nativa
- **Formatação de Dados**: `Intl` API
- **Ícones**: Lucide Icons
- **Gerenciamento de Temas**: `next-themes`

## ✨ Funcionalidades Implementadas

- **Autenticação de Usuários**: Sistema completo de login e registro utilizando o Supabase Auth.
- **Gerenciamento de Ativos**: CRUD completo para ativos financeiros, permitindo ao usuário adicionar, visualizar, editar e remover itens de seu portfólio.
- **Categorização de Ativos**: Os usuários podem criar, editar e excluir suas próprias categorias de ativos, além de utilizar categorias padrão.
- **Dashboard de Resumo**: Apresenta cartões com métricas chave do portfólio, como valor total investido, lucro/prejuízo e alocação por categoria.
- **Sistema de Snapshots**: Funcionalidade que permite ao usuário "fotografar" o estado atual do seu portfólio. Esses snapshots são armazenados e podem ser usados futuramente para análises de desempenho histórico.
- **Cotação de Moedas**: Integração com a AwesomeAPI para buscar a cotação do Dólar (USD) para Real (BRL) em tempo real, usada para cálculos de conversão.
- **Tema Claro e Escuro**: Interface adaptável com temas claro e escuro para melhor experiência do usuário.
- **Sidebar Aprimorada**: Nome do usuário e botão de alternância de tema fixos na base da barra lateral, garantindo acesso rápido mesmo com rolagem.

## 🏗️ Estrutura do Projeto

```
src/
├── components/              # Componentes reutilizáveis
│   ├── assets/             # Componentes da página de Ativos (tabela, cards, modal)
│   ├── common/             # Componentes genéricos (botões, inputs)
│   └── layout/             # Componentes de layout (Sidebar, Header, etc.)
│
├── context/                 # Contextos React (AuthProvider, etc.)
│
├── hooks/                   # Hooks customizados (useAuth, useToast)
│
├── integrations/            # Integrações com serviços externos
│   └── supabase/           # Configuração do cliente e tipos do Supabase
│
├── lib/                     # Funções utilitárias
│   └── utils.ts            # Funções auxiliares (formatação, cálculos)
│
├── pages/                   # Páginas da aplicação
│   ├── AssetsPage.tsx      # Página de gerenciamento de ativos
│   ├── AuthPage.tsx        # Página de login/registro
│   └── ...
│
├── services/                # Lógica de negócio e comunicação com APIs
│
├── types/                   # Definições de tipos TypeScript
│
├── App.tsx                  # Componente raiz com roteamento
├── index.css                # Estilos globais e variáveis do Tailwind
└── main.tsx                 # Ponto de entrada da aplicação
```

## 🔄 Integração com Supabase

O Supabase é o coração do backend, provendo autenticação, banco de dados e funções serverless.

### Tabelas Principais

1.  **`asset_categories`**: Armazena as categorias dos ativos.
    - `id`: UUID (Chave primária)
    - `name`: TEXT (Nome da categoria, ex: "Ações", "Criptomoedas")
    - `user_id`: UUID (FK para `auth.users`)
    - `is_default`: BOOLEAN (Indica se é uma categoria padrão)

2.  **`assets`**: Armazena os ativos individuais do usuário.
    - `id`: UUID (Chave primária)
    - `name`: TEXT (Nome do ativo, ex: "Bitcoin")
    - `ticker`: TEXT (Símbolo do ativo, ex: "BTC")
    - `quantity`: NUMERIC (Quantidade do ativo)
    - `average_price`: NUMERIC (Preço médio de compra)
    - `current_total_value_brl`: NUMERIC (Valor total atual em BRL)
    - `category_id`: UUID (FK para `asset_categories`)
    - `user_id`: UUID (FK para `auth.users`)

3.  **`snapshot_groups`**: Agrupa os itens de um snapshot.
    - `id`: UUID (Chave primária)
    - `created_at`: TIMESTAMPTZ
    - `notes`: TEXT (Anotações do usuário)
    - `user_id`: UUID (FK para `auth.users`)

4.  **`snapshot_items`**: Armazena os detalhes de cada ativo no momento do snapshot.
    - `id`: UUID (Chave primária)
    - `group_id`: UUID (FK para `snapshot_groups`)
    - `asset_id`: UUID (FK para `assets`)
    - `ticker`: TEXT
    - `quantity`: NUMERIC
    - `unit_price_brl`: NUMERIC
    - `total_value_brl`: NUMERIC

### Row Level Security (RLS)

Políticas de RLS são intensivamente utilizadas para garantir que os usuários só possam acessar e modificar seus próprios dados. Todas as queries do frontend são feitas sob o escopo do `user_id` do usuário autenticado.

## 🧠 Desafios Encontrados e Soluções

Durante o desenvolvimento, alguns desafios técnicos importantes foram superados:

1.  **Problema de Exclusão Silenciosa (RLS)**:
    - **Sintoma**: Ao tentar excluir uma categoria de ativo, a UI atualizava como se a operação tivesse sucesso, mas a categoria reaparecia após recarregar a página.
    - **Causa Raiz**: A política de RLS para a operação `DELETE` na tabela `asset_categories` estava impedindo a exclusão de registros que não pertenciam diretamente ao usuário (como categorias padrão com `user_id` nulo).
    - **Solução**: A política de RLS foi ajustada para permitir que usuários excluam categorias que eles criaram, tratando as categorias padrão de forma separada.

2.  **Leitura de Dados Incorreta (RLS)**:
    - **Sintoma**: Valores numéricos (como `total_value_brl` nos snapshots) eram salvos corretamente no banco, mas lidos como `0` ou `null` no frontend.
    - **Causa Raiz**: A política de RLS para a operação `SELECT` na tabela `snapshot_items` não permitia que o usuário lesse corretamente todas as colunas que ele mesmo havia inserido.
    - **Solução**: A política de `SELECT` foi revisada e corrigida para garantir que o usuário autenticado tivesse permissão de leitura para todos os campos relevantes da linha.

3.  **Inconsistência de Nomenclatura de Campos**:
    - **Sintoma**: O valor total de um ativo aparecia como `NaN` ou zerado na UI e não era salvo corretamente no banco.
    - **Causa Raiz**: Havia uma divergência entre o nome do campo no estado do frontend (ex: `total`) e o nome da coluna na tabela `assets` do Supabase (`current_total_value_brl`).
    - **Solução**: O código do frontend foi refatorado para usar consistentemente o nome da coluna do banco de dados (`current_total_value_brl`), garantindo o mapeamento correto dos dados entre o cliente e o servidor.

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou pnpm

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/Gjacks1978/invest-control-flow.git
    cd invest-control-flow
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Crie um arquivo `.env` na raiz do projeto a partir do `.env.example` e adicione suas credenciais do Supabase:
    ```
    VITE_SUPABASE_URL=your-supabase-url
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

5.  Acesse a aplicação em `http://localhost:5173` (ou a porta informada no terminal).

## 📅 Próximos Passos

- [ ] **Página de Relatórios**: Desenvolver a página de relatórios para visualizar e comparar os snapshots do portfólio.
- [ ] **Gráficos e Visualizações**: Adicionar gráficos (ex: pizza para alocação, linha para evolução do patrimônio) para uma análise mais visual.
- [ ] **Testes Automatizados**: Implementar testes unitários e de integração para garantir a qualidade e estabilidade do código.
- [ ] **Supabase Edge Functions**: Utilizar Edge Functions para lógicas de negócio mais complexas, como a geração de relatórios ou notificações.
- [ ] **Melhorias de UX/UI**: Refinar a experiência do usuário com base em feedback e adicionar micro-interações.

## 📄 Licença

Este projeto está sob a licença MIT.
