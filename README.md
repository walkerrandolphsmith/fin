# fin

[product overview](./docs/README.md)

## Directory Structure

```
.
|-- README.md
|-- docker-compose.yml
|-- docs
|-- package.json
|-- packages
|   |-- application
|   |-- ctl
|   |-- docs-generator
|   |-- domain
|   |-- infrastructure
|   |-- ioc
|   |-- sdk
|   `-- web
|-- tsconfig.base.json
`-- yarn.lock
```

```
.
|-- README.md
|-- docker-compose.yml
|-- docs
|-- package.json
|-- packages
|   |-- application
|   |   |-- package.json
|   |   |-- src
|   |   |   |-- bill
|   |   |   |-- index.ts
|   |   |   `-- paymentSource
|   |   |-- tsconfig.build.json
|   |   |-- tsconfig.json
|   |   |-- tsconfig.tsbuildinfo
|   |   `-- tsup.config.ts
|   |-- ctl
|   |   |-- README.md
|   |   |-- package.json
|   |   |-- src
|   |   |   |-- commands
|   |   |   |-- index.ts
|   |   |   |-- types
|   |   |   `-- utils
|   |   |-- tsconfig.json
|   |   `-- tsconfig.tsbuildinfo
|   |-- docs-generator
|   |   `-- generate-document.js
|   |-- domain
|   |   |-- package.json
|   |   |-- src
|   |   |   |-- bill
|   |   |   |-- common
|   |   |   |-- index.ts
|   |   |   `-- paymentSource
|   |   |-- tsconfig.build.json
|   |   |-- tsconfig.json
|   |   |-- tsconfig.tsbuildinfo
|   |   `-- tsup.config.ts
|   |-- infrastructure
|   |   |-- package.json
|   |   |-- src
|   |   |   |-- index.ts
|   |   |   `-- mongodb
|   |   |-- tsconfig.build.json
|   |   |-- tsconfig.json
|   |   |-- tsconfig.tsbuildinfo
|   |   `-- tsup.config.ts
|   |-- ioc
|   |   |-- package.json
|   |   |-- src
|   |   |   `-- index.ts
|   |   |-- tsconfig.build.json
|   |   |-- tsconfig.json
|   |   `-- tsup.config.ts
|   |-- sdk
|   |   |-- package.json
|   |   |-- src
|   |   |   |-- bills.ts
|   |   |   |-- index.ts
|   |   |   `-- paymentSources.ts
|   |   |-- tsconfig.build.json
|   |   |-- tsconfig.json
|   |   `-- tsup.config.ts
|   `-- web
|       |-- Dockerfile.Development
|       |-- eslint.config.mjs
|       |-- next-env.d.ts
|       |-- next.config.ts
|       |-- package.json
|       |-- postcss.config.mjs
|       |-- public
|       |-- src
|       |   |-- app
|       |   |   |-- api
|       |   |   |   |-- bills
|       |   |   |   |   |-- [id]
|       |   |   |   |   |-- reorder
|       |   |   |   |   `-- route.ts
|       |   |   |   |-- diagnostic
|       |   |   |   |   |-- healthcheck
|       |   |   |   |   |-- liveness
|       |   |   |   |   |-- readiness
|       |   |   |   |   `-- serviceInfo
|       |   |   |   |-- paymentSources
|       |   |   |   |   |-- [id]
|       |   |   |   |   `-- route.ts
|       |   |   |   `-- swagger
|       |   |   |       `-- route.ts
|       |   |   |-- bills
|       |   |   |   |-- components
|       |   |   |   |   |-- Bill.tsx
|       |   |   |   |   |-- BillDetails.tsx
|       |   |   |   |   |-- BillsLayout.tsx
|       |   |   |   |   |-- BillsList.tsx
|       |   |   |   |   |-- CandidateBill.tsx
|       |   |   |   |   |-- DueDateSelector.tsx
|       |   |   |   |   |-- Filters.tsx
|       |   |   |   |   `-- PaymentPortalSelector.tsx
|       |   |   |   |-- context
|       |   |   |   |   `-- BillSelectionContext.tsx
|       |   |   |   |-- hooks
|       |   |   |   |   |-- useBills.ts
|       |   |   |   |   `-- usePaymentSources.ts
|       |   |   |   `-- page.tsx
|       |   |   |-- favicon.ico
|       |   |   |-- globals.css
|       |   |   |-- home
|       |   |   |   `-- components
|       |   |   |       |-- DataSourceConnection.tsx
|       |   |   |       |-- DataSourceIllustration.tsx
|       |   |   |       |-- Examples.tsx
|       |   |   |       |-- Hero.tsx
|       |   |   |       `-- Icons.tsx
|       |   |   |-- layout.tsx
|       |   |   |-- page.tsx
|       |   |   |-- paymentSources
|       |   |   |   |-- components
|       |   |   |   |   |-- CandidatePaymentSource.tsx
|       |   |   |   |   |-- PaymentSource.tsx
|       |   |   |   |   |-- PaymentSourceDetails.tsx
|       |   |   |   |   |-- PaymentSourceSelector.tsx
|       |   |   |   |   |-- PaymentSources.tsx
|       |   |   |   |   `-- PaymentSourcesLayout.tsx
|       |   |   |   `-- page.tsx
|       |   |   |-- settings
|       |   |   |   `-- page.tsx
|       |   |   `-- swagger
|       |   |       `-- page.tsx
|       |   |-- components
|       `-- tsconfig.json
|-- tsconfig.base.json
`-- yarn.lock
```

## Getting Started

First, run the development server:

```bash
yarn dev
```
