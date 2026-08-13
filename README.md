# Landing page — Amanda Franco

Site pessoal de portfólio, construído em [Astro](https://astro.build) — estático, leve, sem
dependências desnecessárias. Este README é para você, Amanda: explica como abrir o projeto,
ver o site rodando na sua máquina, e onde mexer para atualizar conteúdo.

## 1. Abrir o projeto e ver rodando localmente

Você precisa ter o [Node.js](https://nodejs.org) instalado (versão 22 ou mais recente). Depois:

1. Abra um terminal dentro desta pasta (`PROJETO ASTRO`).
2. Instale as dependências (só na primeira vez, ou quando o `package.json` mudar):

   ```bash
   npm install
   ```

3. Inicie o site localmente:

   ```bash
   npm run dev
   ```

4. Abra `http://localhost:4321` no navegador. Qualquer alteração que você salvar nos arquivos
   aparece na hora, sem precisar reiniciar nada.

Para parar o servidor, volte ao terminal e aperte `Ctrl + C`.

## 2. Onde alterar os textos

Os textos gerais da página (título do Hero, os três parágrafos de "Como eu penso", as quatro
áreas de atuação, os parágrafos de "Sobre", a frase de contato, WhatsApp e e-mail) ficam todos em
um único arquivo:

```
src/data/copy.js
```

Abra esse arquivo, altere o texto entre aspas e salve. Não precisa mexer em mais nada.

## 3. Onde alterar os cases

O conteúdo dos três cases (English Toolkit, Leo no WhatsApp, CRM/Lifecycle) fica em:

```
src/data/cases.js
```

Cada case tem quatro campos, na mesma ordem que aparece no card: **Contexto**, **Papel de
Amanda**, **Decisões / solução** e **Estágio atual**. Para adicionar um case novo, copie um dos
blocos existentes (entre `{` e `}`) e ajuste os textos — o card é criado automaticamente, sem
precisar tocar em nenhum outro arquivo. O campo `badge` é opcional: deixe `null` se o case não
tiver selo (como o English Toolkit) ou escreva o texto do selo entre aspas (como no CRM/Lifecycle).

## 4. Onde substituir fotografias

As duas fotos do site (Hero e Sobre) ficam em:

```
src/assets/fotos/
```

Para trocar uma foto: substitua o arquivo mantendo o mesmo nome (`foto-hero-amanda.jpg` ou
`foto-sobre-amanda.jpg`), ou troque o nome também — nesse caso, ajuste o `import` no topo de
`src/components/Hero.astro` ou `src/components/Sobre.astro` para apontar para o novo nome de
arquivo. O Astro otimiza a imagem automaticamente (compressão, formato moderno) a cada build —
você não precisa preparar a imagem manualmente, mas evite arquivos muito grandes (o ideal é até
uns 3000px no lado maior).

Se a nova foto tiver um enquadramento muito diferente, pode ser necessário ajustar o
`object-position` no `<style>` do componente (`.hero__photo-img` ou `.sobre__photo-img`) para
recentralizar o rosto — são só dois valores de porcentagem (horizontal e vertical).

## 5. Onde encontrar cores e estilos

Todas as cores da marca (azul profundo, magenta, off-white etc.) e a tipografia (Fraunces e
Space Grotesk) estão centralizadas em variáveis, no topo de:

```
src/styles/global.css
```

Mudar uma cor ali (por exemplo, o valor de `--magenta`) atualiza automaticamente todos os lugares
que usam essa cor no site.

Cada seção (Header, Hero, Atuação, Cases, Sobre, Contato) é um componente separado dentro de
`src/components/`, com seu próprio estilo no final do arquivo — se quiser ajustar o espaçamento
ou o tamanho de algo específico de uma seção, é ali que fica.

## 6. Como gerar uma nova versão do site

Quando quiser publicar uma versão atualizada (depois de mudar textos, cases ou fotos), gere o
build de produção:

```bash
npm run build
```

Isso cria a pasta `dist/` com o site pronto — arquivos estáticos (HTML, CSS, imagens já
otimizadas) que podem ser hospedados em qualquer serviço (Vercel, Netlify, etc.). Publicação e
escolha de hospedagem ainda não fazem parte desta entrega — isso é tratado em uma etapa
seguinte, com sua aprovação.

Para conferir como o build final ficou antes de publicar, rode:

```bash
npm run preview
```

## Estrutura do projeto

```
src/
├── components/     # Header, Hero, Atuacao, Cases, Sobre, Contato — uma seção, um arquivo
├── data/
│   ├── copy.js     # todos os textos gerais + navegação + contato
│   └── cases.js    # conteúdo dos 3 cases
├── assets/
│   ├── fotos/          # foto do Hero e da seção Sobre
│   └── elementos-mao/  # ícone da pastinha usado nos cases
├── layouts/Layout.astro  # <head>: título, descrição, SEO, fontes
├── pages/index.astro     # monta a página juntando os componentes
└── styles/global.css     # cores, tipografia, reset

public/
├── identidade/     # SVGs oficiais da marca (wordmark, símbolo a, identificação, assinatura)
├── fonts/          # Fraunces e Space Grotesk (formato WOFF2)
└── favicon.svg
```

## O que não muda sem redesenho

Os arquivos SVG em `public/identidade/` são os ativos oficiais da marca — não têm geometria
alterada nesta entrega e não devem ser editados diretamente. Qualquer ajuste na identidade visual
(logotipo, símbolo, assinatura) deve passar por uma nova rodada de aprovação, não por edição
direta do arquivo.
