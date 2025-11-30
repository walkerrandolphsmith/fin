# fin

Check out the [product overview](./docs/initial-design.md) and [final report](./docs/final-report.md)

## Development

### Web server

```bash
yarn
cp packages/web/sample.env packages/web/.env
# Populate the environment file with mongoDB URI and Claude AI token
yarn workspace @fin/web dev
```

### CLI

> Unlike the web server the CLI does not support reading environment variables from files. Therefore the mongoDB URI and Claude AI api key must be provided directly.

```bash
yarn
yarn workspace @fin/ctl build
cd packages/ctl
npm install -g .
finctl --version
```
