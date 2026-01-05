# fin

Check out the [product overview](./docs/initial-design.md) and [final report](./docs/final-report.md)

View the [presentation](https://colstate-my.sharepoint.com/:v:/g/personal/smith_walker_students_columbusstate_edu/IQC-sxdsBycrSat8Z6v3-EorARehXvQO10uurpzgQi44Fwk?e=OSShmG)

## Development

### Setup

Install dependencies:

```bash
yarn install
```

### Environment

Fetch the .env file locally

```bash
yarn run env:login
```

Pull the latest .env file updates

```bash
yarn run env:pull
```

### Web server

```bash
yarn workspace @fin/web dev
```

### CLI

> Unlike the web server the CLI does not support reading environment variables from files. Therefore the mongoDB URI and Claude AI api key must be provided directly.

```bash
yarn workspace @fin/ctl dev bill list
```

## "Production"

### Web server

```bash
yarn workspace @fin/web build
yarn workspace @fin/web start
```

### CLI

> Unlike the web server the CLI does not support reading environment variables from files. Therefore the mongoDB URI and Claude AI api key must be provided directly.

```bash
yarn workspace @fin/ctl build
cd packages/ctl
npm install -g .
finctl --version
```
