# Docusaurus AI Search Template

A Docusaurus template with hybrid search capabilities and AI-powered response functionality. This template enables your documentation to have:
- 🔍 Vector-based semantic search
- 🤖 AI-powered responses based on your documentation

## Features
- Semantic search powered by Upstash Vector
- AI chat responses using OpenAI
- Serverless functions for handling search and AI requests
- Modern and responsive UI
- Dark/Light mode support

## Quick Start

1. Click the `Use this template` button to create a new repository
2. Clone your new repository and install dependencies:
   ```bash
   npm install
   ```
3. Add your documentation to the `docs` directory
4. Set up your environment:
   - Create an index in [Upstash Console](https://console.upstash.com)
   - Copy `.env.example` to `.env` and fill in your credentials
5. Index your documentation:
   ```bash
   npm run index-docs
   ```
6. Deploy to Vercel:
   ```bash
   vercel
   ```

> **Important**: After deploying, make sure to add your environment variables in your Vercel project dashboard.

## Development

### Local Development

```bash
vercel dev
```

This starts a local development server with full functionality, including search and AI features.

> **Note**: While `npm run start` is available, it only serves static content. Use `vercel dev` for full functionality including serverless features.

### Why Vercel?

This template uses a hybrid architecture:
- Static content: Your documentation pages (handled by Docusaurus)
- Dynamic features: Search and AI functionality (handled by serverless functions)

Vercel provides both:
- Static site hosting for your documentation
- Serverless function hosting for search and AI features

### Code Formatting

```bash
npm run format
```

Formats the codebase using Prettier.

### Deployment

```
vercel
```

Deploys your site to Vercel.

### Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator with the following commands, which are suggested to be used for creating a new Docusaurus project.

```bash
npx create-docusaurus@latest docusaurus-ai-search classic --typescript
```

```bash
npm install --save-dev typescript @docusaurus/module-type-aliases @docusaurus/tsconfig @docusaurus/types
```
