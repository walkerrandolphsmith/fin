# FinCTL CLI

`finctl` (fin controller) is a command-line tool to manage bills using your financial application services. It provides commands to list bills, filter them, and view detailed bill information.

## Installation

Install dependencies and link the CLI locally:

```bash
cd ./packages/ctl
npm run clean && npm run build && npm install -g .
```

You can now use `finctl` globally on your machine.

## CLI Anatomy

All commands follow this structure:

```bash
finctl <command> [subcommand] [options]
```

- `<command>`: The main category of functionality (e.g., `bill`).
- `[subcommand]`: Specific action to perform (e.g., `list`, `show <id>`).
- `[options]`: Optional flags that modify the behavior of the command.

## Commands

### `bill` - Manage bills

**Usage:**

```bash
finctl bill <subcommand> [options]
```

#### Subcommands

1. **`list`** - List all bills

   **Options:**
   - `-w, --where <filter>` : Filter bills (e.g., `"dueThisWeek"`)
   - `-f, --format <format>` : Output format (`table` or `json`). Default is `table`.

   **Examples:**

   ```bash
   # List all bills in table format
   finctl bill list

   # List all bills in JSON format
   finctl bill list --format json

   # List bills due this week
   finctl bill list --where dueThisWeek
   ```

   **Output (table format):**

   ```
   ┌────┬───────────────┬────────┬────────────┬─────────┐
   │ ID │ Name          │ Amount │ Due Date   │ Status  │
   ├────┼───────────────┼────────┼────────────┼─────────┤
   │ 1  │ Electricity   │ 120    │ 2025-11-10 │ Paid    │
   │ 2  │ Water         │ 45     │ 2025-11-12 │ Pending │
   └────┴───────────────┴────────┴────────────┴─────────┘
   ```

2. **`show <id>`** - Show details of a specific bill

   **Parameters:**
   - `<id>` : ID of the bill to display

   **Example:**

   ```bash
   finctl bill show 1
   ```

   **Output:**

   ```
   Bill Details:
   ──────────────────────────────────────────────
   ID:           1
   Name:         Electricity
   Amount:       $120
   Due Date:     2025-11-10
   ```

## Notes

- The CLI uses [`ora`](https://www.npmjs.com/package/ora) for spinners while loading data.
- Errors are displayed in red using [`chalk`](https://www.npmjs.com/package/chalk).
- Supports multiple output formats (`table` or `json`) for flexibility.

## Development

### Without build

```bash
yarn workspace @fin/ctl dev --version
```

### Binary

```bash
yarn workspace @fin/domain build
yarn workspace @fin/application build
yarn workspace @fin/infrastructure build
cd ./packages/ctl
npm link
finctl --version
```
