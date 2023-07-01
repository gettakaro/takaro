## Database migrations

Creating a new migration:

```bash
npm -w packages/lib-db run migrate:create:domain
# or
npm -w packages/lib-db run migrate:create:system
```

This will create an empty file with the current timestamp in the name and place it in the migrations' folder (`packages/lib-db/src/migrations`). You can now give it a meaningful name and add the SQL statements you want to run. (pro-tip: look at the previous migrations for general structure of the file)

You do not need to manually run migrations to apply them, Takaro will do it automatically when required.
