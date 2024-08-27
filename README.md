
# Movies Back-End

## Description

The main technologies involved:

- [TypeScript](https://www.typescriptlang.org) (`.ts` files) is the evolution of the JavaScript. TypeScript is a strongly typed programming language that builds on JavaScript, giving you better developer tooling at any scale. TypeScript enables better code scanning which avoid introducing defects from human error in your JavaScript code.
- [Nest Js](https://nestjs.com/) Nest (NestJS) is a framework for building efficient, scalable Node.js server-side applications. It uses progressive JavaScript, is built with and fully supports TypeScript and combines elements of OOP (Object-Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).

## Getting started

### Software to install on your development environment or computer

- [Git source code management](https://github.com/git-guides/install-git) Install the latest version. If you have Linux or Mac, Git is probably installed by default.
- [Node.js runtime and npm package manager](https://nodejs.org/en/download/) Install LTS (Long-Term Support) or Current version.
- Optional: You can easily switch between your local version numbers with a [Node.js package manager](https://nodejs.org/en/download/package-manager/)
- [Visual Studio Code](https://code.visualstudio.com) Microsoft VS Code is a free code editor that this repository has settings for in the `/.vscode` directory. The settings will help with things like correcting TypeScript mistakes and ignore whitespace in file comparisons.

### Clone this repository
- Once VS Code is installed you can open this repository and VS Code will recommend you install the syntax extensions in `.vscode/extensions.json` (Prettier, ESLint)


### Data Base

- Create a POSTGRES database


### Environment Variables

- To run this project, you will need to add the following environment variables to your .env file. There is an .env.example to copy


PORT

JWT_EXPIRATION_TIME

JWT_SECRET

DATABASE_URL



## Run Locally

- Go to the project directory

```bash
  cd movies-backend
```

Install dependencies

```bash
  npm install
```

Prisma

```bash
  npm install @prisma/client
  npx prisma generate
  npm prisma migrate dev --name init
  npm prisma migrate push
```


Start the server

```bash
  npm run start:dev
```

