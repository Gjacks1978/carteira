# Documentação do Projeto Carteira

## 📌 Visão Geral

O **Carteira** é uma aplicação web para gerenciamento de ativos financeiros, com foco especial em criptomoedas. A aplicação permite que os usuários acompanhem seus investimentos, visualizem a distribuição de ativos e monitorem o mercado em tempo real.

## 🚀 Tecnologias Principais

- **Frontend**: React 18 + TypeScript
- **Estilização**: Tailwind CSS com tema personalizado
- **Roteamento**: React Router DOM
- **Gerenciamento de Estado**: React Hooks + Context API
- **Componentes UI**: shadcn/ui (baseado em Radix UI)
- **Requisições HTTP**: fetch API nativa
- **Formatação de Dados**: Intl API
- **Ícones**: Lucide Icons
- **Gerenciamento de Temas**: next-themes

## 🏗️ Estrutura do Projeto

```
src/
├── components/              # Componentes reutilizáveis
│   ├── assets/             # Componentes relacionados a ativos
│   ├── crypto/             # Componentes específicos de criptomoedas
│   ├── dashboard/          # Componentes do painel principal
│   └── layout/             # Componentes de layout (Sidebar, Header, etc.)
│
├── lib/                    # Utilitários e configurações
│   └── utils.ts            # Funções utilitárias
│
├── pages/                 # Páginas da aplicação
│   ├── AssetsPage.tsx      # Página de ativos
│   ├── CryptoPage.tsx      # Página de criptomoedas
│   └── Index.tsx           # Página inicial
│
├── types/                 # Tipos TypeScript
│   └── assets.ts           # Tipos relacionados a ativos
│
├── App.tsx               # Componente raiz
├── index.css              # Estilos globais
└── main.tsx              # Ponto de entrada da aplicação
```

## 🎨 Sistema de Temas

A aplicação possui suporte a temas claro e escuro, implementado com `next-themes`. O tema pode ser alterado através do `ThemeToggle` localizado na barra lateral.

### Cores do Tema

- **Tema Claro**: Cores claras com destaque em azul
- **Tema Escuro**: Cores escuras com destaque em roxo

## 🔄 Integrações

### AwesomeAPI

A aplicação se integra à AwesomeAPI para obter a cotação do dólar em tempo real. A função `fetchUSDtoBRLRate()` em `src/lib/utils.ts` é responsável por essa integração.

### Supabase (Configurado, mas não implementado)

O projeto possui configuração para Supabase, mas a implementação completa ainda não foi finalizada.

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou pnpm

### Instalação

1. Clone o repositório:
   ```bash
   git clone <url-do-repositório>
   cd carteira
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   pnpm install
   ```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (se necessário):
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse a aplicação em [http://localhost:8080](http://localhost:8080)

## 📦 Scripts Disponíveis

- `dev`: Inicia o servidor de desenvolvimento
- `build`: Constrói a aplicação para produção
- `preview`: Previsualiza a build de produção localmente
- `lint`: Executa o linter no código
- `format`: Formata o código usando Prettier

## 📝 Estrutura de Componentes Principais

### Sidebar

A barra lateral contém a navegação principal e o seletor de temas. Ela é responsiva e se adapta a diferentes tamanhos de tela.

### ThemeToggle

Componente responsável por alternar entre os temas claro e escuro. Utiliza o hook `useTheme` do `next-themes`.

### AssetsSummaryCards

Exibe um resumo dos ativos do usuário, incluindo valor total, ganhos/perdas e alocação por setor.

## 🔄 Gerenciamento de Estado

A aplicação utiliza uma combinação de estado local (useState) e contexto (createContext) para gerenciar o estado global. O estado relacionado ao tema é gerenciado pelo `ThemeProvider` do `next-themes`.

## 🧪 Testes

Atualmente, o projeto não possui testes automatizados configurados. Recomenda-se a implementação de testes unitários com Jest e testes de integração com React Testing Library.

## 🚀 Implantação

A aplicação pode ser implantada em qualquer serviço de hospedagem estática, como Vercel, Netlify ou GitHub Pages. O projeto inclui configurações prontas para Vite.

## 📅 Próximos Passos

- [ ] Implementar autenticação com Supabase
- [ ] Adicionar persistência de dados
- [ ] Implementar testes automatizados
- [ ] Adicionar mais indicadores financeiros
- [ ] Criar um dashboard mais detalhado

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e enviar pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.
