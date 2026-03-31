# 🌊 Onda Finance

Aplicação web simulando um app bancário moderno, desenvolvida como desafio técnico para a vaga de Front-End Developer.

🔗 **[Acesse o app aqui](https://onda-wave-pay.vercel.app)**

---

## 🚀 Como rodar o projeto

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
git clone https://github.com/Bielcx/onda-wave-pay.git
cd onda-wave-pay
npm install
npm run dev
```

Acesse `http://localhost:5173`

### Credenciais de acesso (mock)
- **Email:** gabriel@onda.finance
- **Senha:** senha123

### Rodar os testes
```bash
npm run test
```

---

## 🧠 Decisões técnicas

### Zustand com `persist`
Optei por usar o middleware `persist` do Zustand para manter o saldo e as transações no `localStorage`. Isso garante que, após uma transferência, o estado não seja perdido ao recarregar a página — comportamento esperado em qualquer app financeiro real.

### React Query com `staleTime: Infinity`
As transações mockadas não mudam no servidor, então configurei `staleTime: Infinity` para evitar re-fetches desnecessários. Em produção, esse valor seria ajustado conforme a frequência de atualização dos dados.

### Mock com Axios
Mesmo sem um backend real, estruturei as chamadas de dados usando Axios com funções de serviço isoladas em `src/services/api.ts`. Isso garante que, ao conectar uma API real, basta substituir a implementação interna — os consumidores (pages/hooks) não precisam mudar.

### CVA para variantes de componentes
Utilizei `class-variance-authority` para gerenciar variantes de estilo de forma tipada e escalável, seguindo o padrão do `shadcn/ui`.

### Zod + React Hook Form
A validação do formulário de transferência é feita em duas camadas: o schema Zod valida os dados com tipagem estática, e o React Hook Form gerencia o estado do formulário e os erros de forma performática (sem re-renders desnecessários).

---

## 🔒 Segurança (discussão técnica)

### Engenharia reversa
Em produção, o código JavaScript é minificado e ofuscado no processo de build (`vite build`). Variáveis de ambiente sensíveis (chaves de API, secrets) nunca são expostas no bundle — ficam apenas no servidor. Tokens de autenticação seriam armazenados em cookies `HttpOnly`, inacessíveis via JavaScript.

### Vazamento de dados
- Toda comunicação com o backend seria feita via HTTPS (TLS), impedindo interceptação de dados em trânsito.
- As respostas da API incluiriam headers de segurança como `Content-Security-Policy` e `X-Content-Type-Options`.
- O token de sessão teria tempo de expiração curto com renovação silenciosa via refresh token.
- Dados sensíveis (saldo, transações) nunca seriam cacheados em localStorage sem criptografia em produção.

---

## 🔮 Melhorias futuras

- [ ] Gráfico de gastos por categoria no dashboard
- [ ] Histórico paginado de transações
- [ ] Autenticação real com JWT + refresh token
- [ ] Suporte a múltiplas contas
- [ ] Notificações push para transações recebidas
- [ ] Tema claro/escuro configurável pelo usuário
- [ ] Internacionalização (i18n) para suporte a múltiplas moedas

---

## 🛠 Stack

| Tecnologia | Uso |
|---|---|
| React + TypeScript | Base da aplicação |
| Vite | Bundler e dev server |
| Tailwind CSS + CVA | Estilização e variantes |
| shadcn/ui + Radix | Componentes acessíveis |
| React Router v6 | Navegação entre telas |
| TanStack Query | Gerenciamento de dados assíncronos |
| Zustand | Estado global com persistência |
| React Hook Form + Zod | Formulários e validação |
| Axios | Camada de serviços HTTP |
| Vitest | Testes unitários |