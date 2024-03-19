# WordPress Deploy Action

[![GitHub Super-Linter](https://github.com/kadirgun/wordpress-deploy-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/kadirgun/wordpress-deploy-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/kadirgun/wordpress-deploy-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/kadirgun/wordpress-deploy-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/kadirgun/wordpress-deploy-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/kadirgun/wordpress-deploy-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This action deploys a WordPress plugin to the WordPress plugin repository using the SVN command line.

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

| <div style="width:100px">Input</div> | Default                  | Description                                                                               |
| ------------------------------------ | ------------------------ | ----------------------------------------------------------------------------------------- |
| `slug`                               | _Required_               | The slug of the plugin to deploy.                                                         |
| `svn-username`                       | _Required_               | The username to use for the SVN repository.                                               |
| `svn-password`                       | _Required_               | The password to use for the SVN repository.                                               |
| `dry-run`                            | false                    | Whether to run the deployment in dry-run mode.                                            |
| `mode`                               | all                      | The mode to use for the deployment.Available mods are `all`, `assets`, `readme`, `plugin` |
| `version`                            | version in main PHP file | The version of the plugin to deploy.                                                      |
| `build-dir`                          | `GITHUB_WORKSPACE`       | The directory containing the built plugin to deploy.                                      |
| `assets-dir`                         | `.wordpress.org`         | The directory containing the assets to deploy.                                            |
| `readme-file`                        | `README.txt`             | The readme file name in the build directory.                                              |

## Outputs

| Output     | Description                                |
| ---------- | ------------------------------------------ |
| `revision` | The SVN revision number of the deployment. |
| `changes`  | The changes made in the deployment.        |
| `version`  | The version of the plugin deployed.        |
