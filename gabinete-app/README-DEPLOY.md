# Gabinete · como colocar no ar de graça (sem computador próprio)

Este é um app web de verdade (React + Vite). Ele vira um endereço fixo na
internet e um aplicativo instalável no celular dos três (PWA), tudo no plano
gratuito. O build acontece NA NUVEM: você não precisa de computador para
compilar nada.

## Caminho recomendado: GitHub + Vercel (15 minutos)

1. No GitHub: **New repository** → nome `gabinete-app` → Private → Create.
2. **Add file → Upload files** → arraste TODO o conteúdo desta pasta
   (`src`, `public`, `index.html`, `package.json`, `vite.config.js`) → Commit.
3. Entre em **vercel.com** → crie a conta gratuita entrando com o GitHub.
4. **Add New → Project** → escolha o repositório `gabinete-app` → o Vercel
   detecta Vite sozinho → **Deploy**.
5. Em 1 a 2 minutos sai o endereço (ex.: `gabinete-app.vercel.app`). Esse é o
   sistema, no ar, sempre. Cada vez que você alterar um arquivo no GitHub, o
   Vercel atualiza o site sozinho.

## Instalar como app no celular

Abra o endereço no celular → menu do navegador → **Adicionar à tela inicial**.
Vira um ícone dourado e abre em tela cheia, como aplicativo.

## Ligar a IA (Ajustes, dentro do app)

1. Pegue a chave gratuita do Gemini em **aistudio.google.com** → Get API key.
2. No app: engrenagem (Ajustes) → cole a chave → Salvar.
3. Opcional: chave do Claude (paga por uso) para peças sensíveis.
4. Cole também o endereço do repositório dos robôs: a aba Robôs ganha atalhos
   diretos para rodar e para colar pedidos.

Aviso: no nível gratuito do Gemini, o Google pode usar o conteúdo enviado para
treinar. Bom para Diário e pautas (público). Defesas e sigilo: use Claude.

## O que fica onde (verdade dita na cara)

- Nesta versão, os dados (prazos, fluxos, documentos, pedidos) ficam salvos
  **no navegador de cada aparelho**. Cada pessoa vê o seu.
- A próxima fase liga o **Supabase (grátis)**: banco único e login dos três,
  todo mundo vendo a mesma coisa. A estrutura do app já foi desenhada para
  esse encaixe.
- A ponte automática com os robôs (o app lendo os JSONs do GitHub sozinho,
  sem o botão de importar) entra junto com essa fase.

## Alternativas

- Netlify (netlify.com) funciona igual ao Vercel, também grátis.
- Rodar local num PC qualquer: `npm install` e `npm run dev`.
