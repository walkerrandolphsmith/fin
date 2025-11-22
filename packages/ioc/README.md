# @fin/ioc

`@fin/ioc` provides dependency injection for the entire monorepo.
It defines a centralized IoC container responsible for registering, configuring, and resolving services across the domain, application, and infrastructure layers.

This package ensures that object graphs are composed in one place and that higher-level layers depend only on interfaces (tokens), not concrete implementations.

- Register concrete implementations for domain services, repositories, and application services.
- Bind interfaces/tokens to implementations (e.g., TOKENS.IBillRepository → MongoBillRepository).
- Compose object graphs for all layers in a single place.
- Expose a single getContainer() function used by consumers (e.g., the web API).
- Enable swapping implementations (e.g., mocks, in-memory repos) during tests.
