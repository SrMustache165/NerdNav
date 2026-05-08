# NavNerd

**NavNerd** é um navegador desktop experimental desenvolvido com **Electron**, criado com foco educacional e de portfólio. O objetivo do projeto é explorar conceitos de aplicações desktop, navegação web embarcada, organização de interface, eventos, segurança básica no Electron e evolução gradual de um produto real.

Este projeto não tem a intenção inicial de competir com navegadores consolidados como Chrome, Firefox ou Edge. A proposta é construir, passo a passo, um navegador simples, funcional e bem estruturado, usando uma engine pronta baseada no Chromium.

---

## Objetivo do projeto

O principal objetivo do **NavNerd** é servir como um projeto público de estudo e demonstração técnica para portfólio/currículo.

Com ele, é possível demonstrar conhecimentos em:

- Desenvolvimento de aplicações desktop com Electron;
- JavaScript moderno;
- Estruturação de projetos front-end;
- Manipulação de eventos da interface;
- Navegação web embarcada;
- Organização de código;
- Boas práticas iniciais de segurança no Electron;
- Evolução incremental de funcionalidades;
- Criação de software com foco em usabilidade.

A ideia é começar simples e evoluir o projeto com recursos como histórico, favoritos, abas, página inicial personalizada, modo escuro e outras funcionalidades.

---

## Funcionalidades da versão atual

A versão inicial do NavNerd conta com:

- Janela desktop com Electron;
- Barra de endereço;
- Botão de voltar;
- Botão de avançar;
- Botão de atualizar;
- Botão de página inicial;
- Campo para digitar URL ou termo de pesquisa;
- Pesquisa automática no Google quando o texto digitado não é uma URL;
- Exibição do título da página atual;
- Status de carregamento;
- Atalhos de teclado básicos.

---

## Tecnologias utilizadas

- **Electron** — criação da aplicação desktop;
- **JavaScript** — lógica principal do projeto;
- **HTML5** — estrutura da interface;
- **CSS3** — estilização da aplicação;
- **Chromium/WebView** — renderização das páginas web.

---

## Estrutura do projeto

```txt
navnerd/
├── package.json
└── src/
    ├── main.js
    ├── preload.js
    ├── index.html
    ├── renderer.js
    └── styles.css
```

### Descrição dos arquivos

| Arquivo          | Função                                                      |
| ---------------- | ------------------------------------------------------------- |
| `main.js`      | Processo principal do Electron. Cria a janela da aplicação. |
| `preload.js`   | Arquivo de ponte segura entre o Electron e a interface.       |
| `index.html`   | Estrutura visual da aplicação.                              |
| `renderer.js`  | Controla os eventos da interface e da navegação.            |
| `styles.css`   | Estilos visuais do navegador.                                 |
| `package.json` | Configurações, scripts e dependências do projeto.          |

---

## Pré-requisitos

Antes de começar, é necessário ter instalado:

- **Node.js**
- **npm**
- **Git**

Para verificar se o Node.js e o npm estão instalados, execute:

```bash
node -v
npm -v
```

---

## Como instalar o projeto

Clone o repositório:

```bash
git clone https://github.com/SEU-USUARIO/navnerd.git
```

Acesse a pasta do projeto:

```bash
cd navnerd
```

Instale as dependências:

```bash
npm install
```

---

## Como executar

Para iniciar o NavNerd em modo de desenvolvimento:

```bash
npm start
```

ou:

```bash
npm run dev
```

Após executar o comando, a janela do navegador será aberta.

---

## Como usar

Na barra de endereço, você pode digitar uma URL completa:

```txt
https://www.google.com
```

Ou apenas o domínio:

```txt
google.com
```

Também é possível digitar um termo de pesquisa:

```txt
como criar um navegador com electron
```

Quando o texto digitado não parecer uma URL, o NavNerd realiza automaticamente uma pesquisa no Google.

---

## Atalhos disponíveis

| Atalho       | Ação                      |
| ------------ | --------------------------- |
| `Ctrl + L` | Focar na barra de endereço |
| `Ctrl + R` | Atualizar página           |
| `Alt + ←` | Voltar                      |
| `Alt + →` | Avançar                    |

---

## Roadmap

Funcionalidades planejadas para as próximas versões:

- [ ] Histórico de navegação;
- [ ] Favoritos;
- [ ] Sistema de abas;
- [ ] Página inicial personalizada;
- [ ] Tela de erro personalizada;
- [ ] Modo escuro/claro;
- [ ] Download manager simples;
- [ ] Bloqueador básico de anúncios;
- [ ] Empacotamento para Windows;
- [ ] Ícone personalizado do aplicativo;
- [ ] Melhorias de segurança;
- [ ] Refatoração para TypeScript futuramente.

---

## Aprendizados envolvidos

Durante o desenvolvimento deste projeto, são praticados conceitos como:

- Ciclo de vida de uma aplicação desktop;
- Comunicação entre processo principal e interface no Electron;
- Manipulação de eventos do DOM;
- Controle de navegação web;
- Validação e normalização de URLs;
- Organização de arquivos em um projeto real;
- Boas práticas iniciais de segurança;
- Planejamento de evolução de software.

---

## Segurança

Por carregar páginas externas, o projeto utiliza algumas configurações de segurança no Electron, como:

```js
nodeIntegration: false,
contextIsolation: true,
sandbox: true
```

Essas configurações ajudam a reduzir riscos ao impedir que páginas carregadas tenham acesso direto a recursos internos do Node.js.

---

## Status do projeto

O projeto está em fase inicial de desenvolvimento.

A versão atual é uma base funcional para estudos e evolução. Novas funcionalidades serão adicionadas gradualmente, mantendo o código simples, organizado e fácil de entender.

---

## Autor

Desenvolvido por **Diogo**.

Projeto criado com foco em aprendizado, prática de desenvolvimento desktop e composição de portfólio profissional.

---

## Licença

Este projeto está sob a licença MIT.

Você pode usar, estudar, modificar e distribuir livremente, mantendo os devidos créditos.
