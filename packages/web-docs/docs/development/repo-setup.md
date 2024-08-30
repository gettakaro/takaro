---
sidebar_position: 2
---

# Repo setup

This repo is a monorepo, using [NPM workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

There are three types of packages; libraries (`lib-*`), applications (`app-*`) and web apps (`web-*`).

## Libraries

- Can be imported by other packages.
- Do not have a `start` script.
- Do have a `start:dev` script, typically, this runs the Typescript compiler in watch mode.

## Applications

- Can NOT be imported by other packages.
- Do have a `start` script, which runs the application in production mode.
- Do have a `start:dev` script, which runs the application with auto-reloading functionality.

## Web

- Similar to apps, but are intended to be deployed to a web server.
- Do have a `start:dev` script, which runs the application with auto-reloading functionality.
- Do have a `build` script, that outputs static HTML, CSS and JS files.
