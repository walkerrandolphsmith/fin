## 1. Overview

**Name:** Fin  
**Team:** Walker Smith

Fin is a household financial coordination system that centralizes bills, budgets, and payment sources to bring clarity, control, and confidence to household money management. Unlike traditional budgeting apps that assume a single user manages everything, Fin recognizes that households often divide financial responsibilities among partners who specialize in bill payment, budget management, and investment planning. The system serves as a household financial operating system that enables partners to collaborate transparently and efficiently on their specialized roles while maintaining alignment toward shared financial goals.

## 2. Final State and System Capabilities

The system achieved a comprehensive feature set organized around bill management and payment source tracking, delivered through a well-architected monorepo structure using Yarn Workspaces and domain-driven design principles. Core functionality includes full CRUD operations for bills and payment sources, with bills supporting configurable attributes including names, amounts, due dates, recurrence patterns, payment source assignments, and payment portal references. The user experience layer implements drag-and-drop bill reordering, calendar-based due date selection, temporal filtering (next week, two weeks ahead), and optimistic UI updates via TanStack Query. Domain-layer validation ensures data integrity across all fields, while transactional operations enable atomic deletion of payment sources and their dependent bills. The domain-driven architecture enabled significant code reuse, with both the Next.js web application and command-line interface leveraging the same infrastructure layer and domain layer, which encapsulates business rules, invariants, and validation logic. The system exposes a complete OpenAPI specification with integrated Swagger UI and a software development kit to facilitate external integrations, along with comprehensive diagnostic endpoints such as health-check, liveness, readiness, and service metadata. The architecture supports multiple access patterns through its dual application interfaces such as a Next.js web application and a command-line interface tool. A notable feature is PDF bill parsing leveraging Claude LLM and text heuristics, allowing users to upload invoice PDFs, extract bill details, review or modify extracted data, and create bills directly from the parsed content. The primary unimplemented feature was income tracking, as significant development time was allocated to evaluating PDF parsing strategies, including experimentation with custom OCR model training and deployment, and assessment of Hugging Face models, which proved either ineffective in CPU-only environments or prohibitively expensive for the project scope.

## 3. Class Diagram and Comparison Statement

## 4. Third-Party code vs. original code Statement

### Original Code

All business logic, domain models, application services, and integration code within the following packages was developed specifically for this project:

- `@fin/application` - Application layer orchestration and use cases
- `@fin/domain` - Domain entities, value objects, repositories, and business rules
- `@fin/infrastructure` - MongoDB integration and repository implementations
- `@fin/ioc` - Dependency injection container configuration
- `@fin/sdk` - Client SDK for external integrations
- `@fin/bill-parser` - Core bill parsing abstractions and interfaces
- `@fin/bill-parser-decorator` - Decorator pattern implementation for bill parsers
- `@fin/bill-parser-claude` - Claude AI integration for bill parsing
- `@fin/bill-parser-pdf-parse` - PDF text extraction implementation
- `@fin/web` - Next.js application including UI components, API routes, and landing page
- `@fin/ctl` - Command-line interface implementation

### Third-Party Frameworks and Libraries

The project leverages industry-standard open-source frameworks and libraries as dependencies:

**Infrastructure and Backend:**

- `mongoose` - MongoDB object modeling
- `tsyringe` and `reflect-metadata` - Dependency injection container
- `swagger-jsdoc` and `swagger-ui` - OpenAPI specification generation and documentation UI

**Web Application:**

- `next` and `react` - Web framework and UI library
- `@tanstack/react-query` - Server state management and optimistic updates
- `@dnd-kit` - Drag and drop functionality
- `@radix-ui/react-accordion` and `@headlessui/react` - Accessible UI primitives
- `react-day-picker` - Date picker component
- `lucide-react` - Icon library

**Command-Line Interface:**

- `commander` - CLI framework
- `chalk`, `cli-table3`, `ora` - Terminal output formatting and user experience

**PDF Parsing:**

- `@anthropic-ai/sdk` - Claude API client for bill parsing
- `pdf-parse` - PDF text extraction

**Development and Tooling:**

- `typescript` - Type system and compiler
- `jest` - Testing framework
- `prettier` - Code formatting
- `yarn` - Package manager and monorepo workspace management
- `nodejs` - JavaScript runtime for web server and CLI execution
- `docker` - Application containerization
- `docker`-compose - Multi-container orchestration for local development

All framework and library usage follows standard documentation and best practices. No tutorial code or external examples were directly copied into the project. The architectural patterns, including domain-driven design, dependency injection, and the monorepo structure using Yarn Workspaces, represent standard software engineering practices applied specifically to the Fin use case.

## 5. Statement on the OOAD process for your overall Semester Project

1. Domain-Driven Design enabled persistence layer flexibility without domain contamination
   The clear separation between domain and infrastructure layers allowed the team to migrate from an in-memory persistence implementation to a MongoDB-backed database without requiring any changes to the domain layer, which encapsulated business rules and core logic. This architectural isolation meant the application layer and web application remained completely unchanged during the infrastructure migration, validating the effectiveness of the layered architecture and demonstrating that business logic was properly decoupled from technical implementation details.

2. Domain-Driven Design facilitated rapid multi-interface development through layer reuse
   Once the web application was established with its domain and infrastructure layers, the CLI application was developed by reusing these existing layers entirely. This architectural decision meant that CLI development required only building the novel command-line user experience, while all business logic, validation, and data persistence were immediately available. This significantly accelerated CLI development and ensured behavioral consistency between both interfaces, as they shared identical domain rules and infrastructure implementations.

3. Strategy pattern enabled extensible bill mutations while maintaining data integrity
   The strategy pattern was applied to bill update operations, allowing new modification capabilities to be added as discrete strategies without altering existing mutation logic. As features were added (including due date updates, payment portal references, and payment source assignments), each was implemented as a new strategy that operated on specific bill attributes in isolation. This approach kept the core update mechanism closed to modification while remaining open to extension. Additionally, this pattern provided critical data integrity benefits in the client application: update operations could execute with stale bill data without risking unintended overwrites of unrelated attributes. For example, when a user updated a bill's due date through the UI, the operation would not inadvertently overwrite the payment source if it had been modified out of band by another user or process, as each strategy operated only on its designated attributes rather than requiring a complete bill entity for updates.
