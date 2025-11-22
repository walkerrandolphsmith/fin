@fin/application

The **Application layer** coordinates the execution of use-cases in the system.

```
.
|-- bill
|   |-- dtos              # Data transfer objects
|   |-- index.ts
|   |-- mappers           # DTO <-> Entities
|   |-- mutations         # Encapsulate modifications
|   |-- services          # orchestrate use-cases
|   `-- types.ts
|-- index.ts
`-- paymentSource
```
