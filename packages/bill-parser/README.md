# @fin/sdk

`@fin/sdk` provides a client-side software development kit (SDK) to interact with the `@fin/web` APIs.

It abstracts all HTTP requests to backend endpoints, providing strongly-typed functions and DTOs that can be safely used in React components or **other client code**.

Extracting this from the web client enables the reuse across other clients that may collaborate with this web service via HTTP and contracts defined in the our `openAPI specification`.

## Swagger

The webserver exposes an openAPI specification at the public endpoint `~/api/swagger`. This manifest provides a contract with the web APIs that can be coded against by external collaborators.

## Swagger UI

In addition to a specification, the webserver exposes a friendly user interface for interacting wit the web APIs via `~/swagger`
