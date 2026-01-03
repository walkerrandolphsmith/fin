# CLAUDE.md — Fin Project Guidance

## Project Overview

**Fin** is a household financial coordination system.  
It is NOT a generic budgeting app.

Fin models **shared financial responsibility** across three roles:

- **Bill Organizer** (logistics, accuracy, payment systems)
- **Budget Manager** (planning, reallocation, forecasting)
- **Investor** (long-term optimization, liquidity awareness)

The system’s purpose is to provide clarity, control, and confidence by centralizing **bills, budgets, and payment sources**, while keeping responsibilities separated but transparent.

When generating code, designs, or recommendations:

- Optimize for **clarity, correctness, and explicit intent**
- Prefer **boring, readable solutions** over clever abstractions
- Respect role separation and domain boundaries

---

## Architectural Principles (Non-Negotiable)

### 1. Layered Architecture (Strict)

Fin follows a **DDD-inspired layered architecture**:

- **Domain Layer (`@fin/domain`)**
  - Pure business logic
  - Entities, value objects, domain services
  - NO framework, NO database, NO HTTP concerns
  - Depends on **interfaces only**

- **Application Layer (`@fin/application`)**
  - Orchestrates use cases
  - Converts DTOs ↔ domain objects
  - Selects strategies / mutations
  - No persistence details

- **Infrastructure Layer (`@fin/infrastructure`)**
  - MongoDB + Mongoose
  - Repository implementations
  - Persistence mappers
  - Transaction / unit-of-work support

- **Interface / Presentation**
  - Web API (Next.js routes)
  - SDK facade
  - React UI

❗ Claude MUST NOT:

- Put business rules in controllers or React components
- Let MongoDB types (`ObjectId`, `_id`) leak into the domain
- Skip repositories and “just query the DB”

---

### 2. Domain Purity Rules

The **domain is the source of truth**.

- All invariants live in entities or value objects
- Validation belongs in the domain, not UI or API
- Domain entities are mutated **only via methods**
- No setters, no public mutable props

Examples:

- `Bill.changeAmount()` ✔
- `bill.amount = 50` ❌

---

### 3. Explicit Patterns in Use

#### 1. Introduction of a Domain Query Abstraction for Repository Filtering

Another architectural enhancement added during this phase was the introduction of a reusable, infrastructure-agnostic filtering mechanism to the repository interface. This took the form of an IDomainQuery and a `find(query: IDomainQuery)` member.

This design change was introduced to support scenarios such as finding all bills associated with a payment source during deletion. In the initial design, the repository interface lacked any abstraction for querying by criteria, which created two undesirable options:

- Fetching all entities and filtering in memory
  - This avoids leaking persistence details into the domain layer, but results in severe inefficiencies due to overfetching.

  - The database is not leveraged for its strengths in query optimization, indexing, and filtering.

- Adding many specialized methods to the repository (e.g., getByRelatedPaymentId(id))
  - This avoids exposing infrastructure details in the domain layer, but leads to the repository interface exploding with variations for every filtering scenario.

  - This tightly couples interface design to current use cases and makes evolution difficult.

#### 1. Entity updates via strategy pattern

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

#### 2. filtering via Specification Pattern

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

#### 3. Query Object Pattern

A **Query Object pattern** uses a small, structured representation of a filtering operation that can be interpreted by the infrastructure layer. Instead of writing database specific queries, higher layers of the system express their intent using simple objects that describe which field to filter on. This allows the system domain layer to represent a way to get a subset of bills without coupling the system to a specific database mechanism.

#### 3. Unit of Work Pattern

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

## Data & Persistence Rules

- MongoDB is the primary store
- Mongoose is confined to the infrastructure layer
- Domain uses **string IDs**, not `ObjectId`
- Mapping boundary is enforced via persistence mappers

Claude SHOULD:

- Add fields via domain → mapper → schema
- Preserve backward compatibility when possible
- Avoid “quick schema hacks”

Stretch goal (keep in mind):

- Alternate in-memory infrastructure implementation

---

## Bill Domain Rules (Core Aggregate)

Bills are:

- Ordered
- Optionally recurring
- Optionally due-dated
- Optionally linked to a payment source
- Categorized

Key constraints:

- A bill always has a name
- Amount must be valid money
- Payment source deletion MUST unassign bills
- Reordering is persisted and stable

When modifying bill logic:

- Update entity methods first
- Then update service orchestration
- Then update repository + mapper

---

## Error Handling Philosophy

- Domain throws meaningful errors
- Application translates domain errors → API responses
- UI handles errors gracefully but does NOT reinterpret business rules

Avoid:

- Silent failures
- Boolean success flags instead of errors
- HTTP-only validation logic

---

## API & SDK Expectations

- SDK is the **only** consumer of raw HTTP details
- UI should never construct URLs manually
- Route handlers are thin
- DTOs are explicit and versionable

Claude SHOULD:

- Add SDK methods when adding endpoints
- Keep DTOs minimal and intention-revealing
- Avoid overloading PATCH endpoints with ambiguous payloads

Examples:

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

---

## UI Guidance (React)

- UI reflects domain state, it does not invent it
- Optimistic updates are allowed but must reconcile with server truth
- Sorting, filtering, and grouping should mirror domain behavior

Avoid:

- UI-only business rules
- Hidden magic defaults
- Over-coupling components to API shapes

---

## Testing Expectations

When suggesting tests:

- Prefer **domain tests first**
- Application tests second
- Infrastructure tests only when necessary

---

## How Claude Should Respond in This Repo

Claude Code should:

- Be explicit and opinionated
- Explain _why_ something belongs in a layer
- Reference existing patterns before proposing new ones
- Flag architectural violations clearly

Claude should NOT:

- “Simplify” by collapsing layers
- Suggest ORMs or frameworks that break domain isolation
- Optimize prematurely at the cost of clarity
