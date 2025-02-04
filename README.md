# docusaurus-ai-search

You can use this template to create a new Docusaurus project which has hybrid search and AI chat capability.

## Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator with the following commands, which are suggested to be used for creating a new Docusaurus project.

```bash
npx create-docusaurus@latest docusaurus-ai-search classic --typescript
```

```bash
npm install --save-dev typescript @docusaurus/module-type-aliases @docusaurus/tsconfig @docusaurus/types
```

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
