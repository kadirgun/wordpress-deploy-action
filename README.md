# WordPress Deploy Action

[![CI](https://github.com/kadirgun/wordpress-deploy-action/actions/workflows/ci.yml/badge.svg)](https://github.com/kadirgun/wordpress-deploy-action/actions/workflows/ci.yml)
[![Check dist/](https://github.com/kadirgun/wordpress-deploy-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/kadirgun/wordpress-deploy-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/kadirgun/wordpress-deploy-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/kadirgun/wordpress-deploy-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This action deploys a WordPress plugin to the WordPress plugin repository using
the SVN command-line.

## Usage

Here's an example of how to use this action in a workflow file:

```yaml
name: Deploy to WordPress

on:
  push:
    branches:
      - main

jobs:
  detect:
    name: Deploy
    runs-on: ubuntu-latest

    steps:
      - name: Deploy
        uses: kadirgun/wordpress-deploy-action@v1
        with:
          slug: my-plugin
          svn-username: ${{ secrets.WP_USERNAME }}
          svn-password: ${{ secrets.WP_PASSWORD }}
```

## Inputs

| Input          | Description                                          |
| -------------- | ---------------------------------------------------- |
| `slug`         | The slug of the plugin to deploy.                    |
| `svn-username` | The username to use for the SVN repository.          |
| `svn-password` | The password to use for the SVN repository.          |
| `dry-run`      | Whether to run the deployment in dry-run mode.       |
| `mode`         | The mode to use for the deployment.                  |
| `version`      | The version of the plugin to deploy.                 |
| `build-dir`    | The directory containing the built plugin to deploy. |
| `assets-dir`   | The directory containing the assets to deploy.       |
| `readme-name`  | The readme filename in the build directory.          |
| `main-name`    | The main PHP filename in the build directory.        |

## Outputs

| Output     | Description                                |
| ---------- | ------------------------------------------ |
| `revision` | The SVN revision number of the deployment. |
| `changes`  | The changes made in the deployment.        |
| `version`  | The version of the plugin deployed.        |
