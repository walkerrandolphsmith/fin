# Project Summary

**Name:** Fin  
**Team:** Walker Smith

## Work Done

At this phase of the project, significant architectural, infrastructure, and feature-level milestones have been completed. The system is organized as a **monorepository** using **Yarn Workspaces**, with a clean, modular structure aligned to domain-driven design principles. The repository includes dedicated packages for the application, domain, and infrastructure layers, as well as supporting packages for dependency injection, SDK access, a **Next.js web application**, **and** a **command-line interface application**.

### Current Architecture

#### Domain Layer

`@fin/domain` package encapsulates all domain entities, business rules, validations, and domain services. Bills and payment sources are fully modeled here.

### Infrastructure Layer

`@fin/infrastructure` package implements persistence using `mongoose` to interface with **MongoDB**, including repositories, mappers, and transaction support. This layer is shared by both the web application and the command-line tool.

### Application Layer

`@fin/application` package exposes use cases and application services that orchestrate domain logic and infrastructure operations.

### IOC Container

`@fin/ioc` package provides the centralized dependency injection configuration used across packages using the `tsyringe` and `reflect-metadata`.

### Software Development Kit (SDK)

`@fin/sdk` package serves as the typed client for interacting with the web server's HTTP API. This abstracts the API layer for use by internal tools or future external integrations.

### Webserver

`@fin/web` package implements a `Next.js` application with both server-side rendered pages and a full Web API. Client application uses `React` to declaratively build user interfaces, `TanStack Query` to manage data fetching including loading states, error states and a local cache.

Consumes the application, domain, infrastructure, and SDK packages.

### Command line application

`@fin/ctl` (controller) package implements a command-line tool using `Commander.js`.

Uses domain and infrastructure layers to perform scripted operations.

### Features Completed

1. Full CRUD for Bills and Payment Sources
2. Bills support names, amounts, due dates, reoccurring flag, assigning new or existing payment sources, and payment portal sites
3. Bills can be reordered via a drag and drop experience.
4. Bill due dates support calendar date selection interface
5. Bills can be assigned to existing payment sources as well as an user experience that supports creating a new payment source directly during assignment.
6. Ability to filter bills by time horizons such as bills due next week and bills due in two weeks.
7. All fields support validation, enforced via the domain layer, and surfaced in the user interface
8. Optimistic updates, leveraging TanStack Query local cache, for a snappy user experience.
9. Transactional operations are supported for deleting a payment source and all related bills as a transactional unit of work.
10. OpenAPI specification is exposed by the web server
11. Fully functional Swagger UI allows browsing all web APIs.
12. Comprehensive operational diagnostic are exposed via diagnostic endpoints
    1. Healthcheck - verifies system health
    2. Liveness - verifies service is running
    3. Readiness - ensures the service is ready to accept traffic
    4. Service info - exposes metadata about the system such as name and version
13. Lightweight landing page that acts as a marketing site for the product
14. Fully functional command line tool for listing bills to the terminal

## Changes Encountered

Since the initial design phase, several significant architectural improvements have been introduced to increase modularity, reuse, and maintainability across the system.

### 1. Migration to a Mono-repository Structure

Initially, all the layers were co-located inside the lib directory of the Next.js web application. This design raised two critical issues. The CTL package (command-line tool) could not reuse these layers, even though it required the same business logic and persistence capabilities. Despite using the same language (TypeScript), the runtime environments for the web app and CLI tool differ, making it inappropriate for them to share code through direct file references. The shift to yarn workspaces resolved these issues by decoupling the layers into dedicated, versioned packages which can be shared across both applications. The build phase of each package can be adjusted to support outputting different artifacts for each runtime environment.

### 2. Introduction of a Dedicated IoC Package

In the initial system, classes were instantiated directly ("newed up") within the web application, creating tight coupling and duplicated dependency-graph setup.

This became problematic when introducing the CTL package, which would have required repeating the same object construction logic and dependency wiring.

The `@fin/ioc` package addressed this issue by centralizing dependency registration and resolution.

### 3. Introduction of a Unit of Work for Transactional Operations

In the original design, there was no formal mechanism for handling transactional operations. However, deleting a payment source and all of its related bills should be treated as an atomic operation to ensure data integrity. MongoDB supports atomic operations via sessions, however we want to avoid leaking MongoDB-specific details into the domain or application layers. To avoid this cross-layer leakage, a dedicated Unit of Work abstraction was introduced. The abstraction enables the expression of the intent to perform a transactional operation without leaking the implementation details of the infrastructure layer.

### 4. Introduction of a Domain Query Abstraction for Repository Filtering

Another architectural enhancement added during this phase was the introduction of a reusable, infrastructure-agnostic filtering mechanism to the repository interface. This took the form of an IDomainQuery and a `find(query: IDomainQuery)` member.

This design change was introduced to support scenarios such as finding all bills associated with a payment source during deletion. In the initial design, the repository interface lacked any abstraction for querying by criteria, which created two undesirable options:

- Fetching all entities and filtering in memory
  - This avoids leaking persistence details into the domain layer, but results in severe inefficiencies due to overfetching.

  - The database is not leveraged for its strengths in query optimization, indexing, and filtering.

- Adding many specialized methods to the repository (e.g., getByRelatedPaymentId(id))
  - This avoids exposing infrastructure details in the domain layer, but leads to the repository interface exploding with variations for every filtering scenario.

  - This tightly couples interface design to current use cases and makes evolution difficult.

## Design Patterns

### Strategy Pattern

The `BillService.updateBill()` method receives an `UpdateBillDTO`, which describes what kind of mutation should be applied to a bill. The **Strategy Pattern** is used to encapsulate each operation into its own class implementing the IBillMutation interface. Updating a bill renames open to extension and closed to modification by allowing new mutation strategies to be added without changing the implementations of existing mutations.

```typescript
private chooseStrategy(dto: UpdateBillDTO): IBillMutation {
    switch (dto.mutationType) {
      case "rename":
        return new RenameBillMutation();
      case "setDueDate":
        return new SetDueDateMutation();
      case "setAmount":
        return new SetAmountMutation();
      case "assignPaymentSource":
        return new AssignPaymentSourceMutation();
      case "clearDueDate":
        return new ClearDueDateMutation();
      case "setPaymentPortal":
        return new SetPaymentPortalMutation();
    }
  }

  async updateBill(dto: UpdateBillDTO): Promise<BillDTO> {
    const updateStrategy = this.chooseStrategy(dto);
    return updateStrategy.execute(dto, this.domainService);
  }
```

```typescript
export interface IBillMutation {
  execute(dto: UpdateBillDTO, domainService: BillService): Promise<BillDTO>;
}

export class RenameBillMutation implements IBillMutation {
  async execute(
    dto: RenameBillDTO,
    domainService: BillService
  ): Promise<BillDTO> {
    const updated = await domainService.renameBill(dto.id, dto.name);
    return BillDTOMapper.toDTO(updated);
  }
}
```

### Template pattern

**Template pattern** is also leveraged in this use case. `BillDueInNWeeksSpecificationBase` defines an algorithm skeleton and subclasses customize `weekOffset` to alter parts of the algorithm. This pattern allowed me to quickly create multiple time horizon filters without duplicating logic.

```typescript
export abstract class BillDueInNWeeksSpecificationBase
  implements ISpecification<Bill>
{
  protected abstract weekOffset: number;

  isSatisfiedBy(bill: Bill): boolean {
    if (!bill.dueDate) return false;

    const { start, end } = this.getWeekRange(this.weekOffset);
    return bill.dueDate >= start && bill.dueDate <= end;
  }

  private getWeekRange(offsetWeeks = 0): { start: Date; end: Date } {
    const now = new Date();

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek + offsetWeeks * 7);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }
}
```

### Specification Pattern

The **Specification Pattern** is used to encapsulate the business rules for filtering bills by their due dates. Concrete classes implement the `ISpecification<Bill>` interface and the BillService delegates filtering bills to the specification, calling `isSatisfiedBy` on each bill to determine if the criteria is met. Encapsulating the filtering criteria into a specification enables new specifications to be created without changing existing filtering logic.

```typescript
export interface ISpecification<T> {
  isSatisfiedBy(entity: T): boolean;
}

export class BillDueThisWeekSpecification extends BillDueInNWeeksSpecificationBase {
  protected weekOffset = 0;
}

async getBillsDueThisWeek(): Promise<Bill[]> {
  const bills: Bill[] = await this.repo.getAll();
  const spec = new BillDueThisWeekSpecification();
  return bills.filter((b) => spec.isSatisfiedBy(b));
}

async getBillsDueNextWeek(): Promise<Bill[]> {
  const bills: Bill[] = await this.repo.getAll();
  const spec = new BillDueNextWeekSpecification();
  return bills.filter((b) => spec.isSatisfiedBy(b));
}
```

### Facade Pattern

The **facade pattern** is used by the `@fin/sdk` to provide a simplified, high level interface to the underlying HTTP API. The presentation layer can use single methods from the SDK instead of knowing exact HTTP endpoints, HTTP methods, HTTP headers, request body shapes, or query parameters. The SDK acts as a unified interface for set of interfaces exposed by multiple routes/controllers of the web server.

```typescript
// sdk
export async function getBills(filter?: BillFilter): Promise<BillDTO[]> {
  const queryParameters = filter ? `?filter=${filter}` : "";
  const res = await fetch(`${API_BASE}/api/bills${queryParameters}`);
  if (!res.ok) throw new Error("Failed to fetch bills");
  const dto = (await res.json()) as BillDTO[];
  return dto;
}

// web application
const query = useQuery({
  queryKey: ["bills", filter],
  queryFn: () => sdk.getBills(filter),
  refetchOnWindowFocus: false,
});
```

### Adapter Pattern

The **adapter pattern** is used to decouple the domain layer form a specific data persistence technology in the infrastructure layer. The domain layer interfaces with the `IBillRepository` interface to get, update, and delete bills. The `BillRepository` acts as an adapter translating calls from the domain layer to comply with the contracts of the Mongoose interfaces. The BillRepository exists to convert one interface to another so that a client, domain layer, can use it without knowing the underlying implementation.

```typescript
interface IBillRepository {
  isValidObjectId(id: string): boolean;
  reorderBills(updates: { id: string; order: number }[]): Promise<Bill[]>;
  getAll(): Promise<Bill[]>;
  getById(id: string): Promise<Bill>;
  create(data: Bill): Promise<Bill>;
  update(updates: Partial<Bill>): Promise<Bill>;
  delete(id: string): Promise<Bill | null>;
  findWhere(query: IDomainQuery): Promise<Bill[]>;
  dispose(): Promise<void>;
}

// mongodb repository
async getAll(): Promise<Bill[]> {
  const context = asyncLocalStorage.getStore();
  const session = context?.session ?? null;
  const docs = await BillModel.find().sort({ order: 1 }).session(session).lean<IBillModel[]>();
  return docs.map(BillPersistenceMapper.fromModel);
}
```

### Singleton Pattern

The **singleton pattern** is used to ensure a global, single instance of the IoC container is used across the entire system. This allows dependencies to be registered once, avoid recomputing the dependency graph, and simplifies dependency resolution.

```typescript
let initialized = false;

async function getContainer() {
  if (!initialized) {
    await setupContainer();
    initialized = true;
  }
  return container;
}
```

### Query Object Pattern

A **Query Object pattern** uses a small, structured representation of a filtering operation that can be interpreted by the infrastructure layer. Instead of writing database specific queries, higher layers of the system express their intent using simple objects that describe which field to filter on. This allows the system domain layer to represent a way to get a subset of bills without coupling the system to a specific database mechanism.

### Factory Pattern (Static Factory Method)

The factory pattern is used to control how an object is constructed and enforce invariants or defaults during creation. The Bill entity uses a Static Factory Method to control how new Bill instances are created. By hiding the constructor and exposing createNew(), the entity ensures that required fields, invariants, and generated values (like id and createdAt) are consistently applied when a new bill is created.

```typescript
export class Bill {
  private props: BillProps;

  private constructor(props: BillProps) {
    this.props = props;
  }

  static createNew(props: Omit<BillProps, "id" | "order" | "createdAt">): Bill {
    return new Bill({
      ...props,
      id: randomUUID(),
      createdAt: new Date(),
      isReoccurring: true,
    });
  }
```

### Factory Pattern

The factory pattern is used to construct command objects that define the capabilities exposed by the CLI. By encapsulating command setup inside dedicated factory classes, each command's configuration, options, and execution logic remain cleanly organized and self-contained. This allows commands to be instantiated consistently, makes the CLI easier to extend, and keeps the application's entrypoint focused on composition rather than command wiring.

```typescript
import { Command } from "commander";

export interface IBuildCommand {
  build(): Command;
}

export class BillCommandFactory implements IBuildCommand {
  build() {
    return new Command("bill")
      .command("list")
      .description("List all bills")
      .option("-w, --where <filter>", 'Filter bills (e.g., "dueThisWeek")')
      .option("-f, --format <format>", "Output format (table|json)", "table")
      .action(async (options) => {
        const billService = container.resolve<BillService>(
          TOKENS.BillDomainService
        );
        console.log(
          JSON.stringify(billService.getBillsDueThisWeek(), null, 2)
        );
      });
  }
}

// entrypoint
program.addCommand(new BillCommandFactory().build());
```

### Unit of Work Pattern

The **unit of work pattern** enables the expression of an intent to perform a transactional operation without leaking the implementation details of the infrastructure layer. This will allow me to use MongoDB sessions or SQL transactions in the infrastructure layer without the need to change the domain and application layer when switching between persistence technologies.

```typescript
export interface IUnitOfWork {
  execute<T>(work: () => Promise<T>): Promise<T>;
}

export class UnitOfWork implements IUnitOfWork {
  async execute<T>(work: () => Promise<T>): Promise<T> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(() =>
        asyncLocalStorage.run({ session }, work)
      );
    } finally {
      await session.endSession();
    }
  }
}

//consumer
async delete(id: string) {
  this.unitOfWork.execute(async () => {
    const bills = await this.billRepo.findWhere({
      field: "paymentSourceId",
      value: id,
      operator: "=",
    });

    bills.forEach((bill) => bill.unAssignPaymentSource());
    const promises = bills.map((bill) => this.billRepo.update(bill));
    await Promise.all([...promises, this.repo.delete(id)]);
  });
}
```

## What's Next/Left

1. As the bill organizer, I can categorize my bills so that I can easily review how money is spent at a high level.
2. As a budget manager, I can view the total cost of all bills so that I can understand our fixed expenses and adjust discretionary budgets accordingly.
3. As a budget manager, I can manage income sources so that I can establish discretionary budgets
4. As a bill manager, I can manage debts so that an investor or budget manager can develop a plan to eliminate them. Instead of tracking a monthly minimum payment as a bill, the bill manager can capture the total remaining balance, the interest rate, and the minimum payment.
5. Expose bill creation via the command line interface
