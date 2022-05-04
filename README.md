<div >
  <img style="display:block;margin-left:auto;margin-right:auto;width:40%;height:40%;" alt="GraphQL Logo" src="https://graphql.org/img/og-image.png" />
</div>

# Typescript GraphQL Template

## Getting Started

1. Install any needed dev dependencies:

```console
foo@bar:~$  yarn install
```

2. Boot up local Postgres database (steps differ based on OS)
3. If not yet created, create a file named `.env` in the project's base directory. See `.env.example` for required properties.
4. Boot up Typescript compiler:

```console
foo@bar:~$  yarn watch
```

5. Start dev server:

```console
foo@bar:~$  yarn dev
```

## Advanced Config

- If you need to add additional properties to the `.env` file, run the following:

```console
foo@bar:~$  yarn gen-env
```

This will update the `.env.d.ts` and `.env.example` files with the correct properties and type declarations.

## Running SQL Migrations

- To run SQL migrations, run the following command:

```console
foo@bar:~$  yarn migrate
```

This will use Mikro-ORM's migration generator to construct and execute SQL migrations on your database.

## Usage with Docker

Coming soon...

## Testing

Coming soon...
