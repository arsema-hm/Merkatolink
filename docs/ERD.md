# ERD (logical target)

```mermaid
erDiagram
 TERRAS ||--o{ TRADERS : groups
 TRADERS ||--o{ TRADER_MEMBERS : has
 TRADERS ||--o{ PRODUCTS : lists
 PRODUCTS ||--o{ PRODUCT_UNITS : sells_as
 PRODUCT_UNITS ||--o{ PRICE_TIERS : discounts
 PRODUCTS ||--o{ STOCK : stored_as
 TRADERS ||--o{ ORDERS : receives
 BUYERS ||--o{ ORDERS : places
 BROKERS ||--o{ ORDERS : introduces
 ORDERS ||--o{ ORDER_ITEMS : contains
 ORDERS ||--o{ PAYMENTS : settled_by
 ORDERS ||--o| BROKER_COMMISSIONS : accrues
 PRODUCTS ||--o{ PRODUCT_COSTS : costs
 EXCHANGE_RATES ||--o{ PRICE_HISTORY : reprices
 TERRAS ||--o{ PRICE_BOARD_REPORTS : reports
```

The migration is an initial implementation of core entities; some items in this target model are not implemented yet. See the SQL migration for current columns and constraints.
