# docusaurus-ai-search

You can use this template to create a new Docusaurus project which has hybrid search and AI chat capability.

## How to Use This Template

1. Create a new repository by clicking the `Use this template` button.
2. Install the dependencies using `npm install`.
3. Add your docs to the `docs` directory.
4. Create an index in [Upstash Console](https://console.upstash.com).
5. Create a `.env` file in the root directory and add the environment variables in the `.env.example` file.
6. Run `npm run index-docs` to index your docs.
7. Run `vercel` to deploy your site.

Note: Do not forget to add your environment variables in your vercel dashboard as well.

#### Why are we using Vercel?

We both need to deploy our static site and our serverless functions.

### Installation

```
npm install
```

This command installs the dependencies listed in the `package.json` file.

### Local Development

```
vercel dev
```

This command starts a local development server. Most changes are reflected live without having to restart the server.

When you run `npm run start`, Docusaurus starts a local development server that only serves the static content of your site. This means that any serverless functions (like those used for querying the index or generating AI responses) won't be available because they're not part of the static build.

On the other hand, running `vercel dev` launches the Vercel development server, which emulates the serverless functions locally. This allows you to test and use dynamic features—such as querying your index and receiving AI responses—right on your local machine.

In short, `npm run start` is for static content only, whereas `vercel dev` provides a full environment including the serverless functions.

### Format

```
npm run format
```

This command formats the codebase using Prettier.

### Deployment

```
vercel
```

This command deploys your site to Vercel.

### Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator with the following commands, which are suggested to be used for creating a new Docusaurus project.

```bash
npx create-docusaurus@latest docusaurus-ai-search classic --typescript
```

```bash
npm install --save-dev typescript @docusaurus/module-type-aliases @docusaurus/tsconfig @docusaurus/types
```
