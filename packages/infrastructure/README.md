## @fin/infrastructure

This is the **Infrastructure** package which is the "outer layer" of the architecture.

**Purpose of this layer (in DDD):**

- Implements _technical concerns_ like databases, message brokers, logging, external APIs, caches, cloud services, etc.
- Provides **concrete implementations** for the _interfaces defined in the Domain layer_ (e.g., repositories, event publishers).
- Converts raw persistence models (Mongo documents, DTOs) into domain objects and vice-versa.
- _Never_ contains business rules or domain logic — only technical plumbing.
