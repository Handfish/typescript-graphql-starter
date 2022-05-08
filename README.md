# Typescript GraphQL Template

## 📌 Getting Started

1. Install any needed dev dependencies:

```console
yarn install
```

2. Boot up local Postgres database (steps differ based on OS)
3. If not yet created, create a file named `.env` in the project's base directory. See `.env.example` for required properties.
4. Boot up Typescript compiler:

```console
yarn watch
```

5. Start dev server:

```console
yarn dev
```

## ⚙️ Advanced Config

- If you need to add additional properties to the `.env` file, run the following:

```console
yarn gen-env
```

This will update the `.env.d.ts` and `.env.example` files with the correct properties and type declarations.

## 📦 Running SQL Migrations

- To run SQL migrations, run the following command:

```console
yarn migrate
```

This will use Mikro-ORM's migration generator to construct and execute SQL migrations on your database.

## 🐳 Usage with Docker

**Build an Image**

```console
docker build -t {username}/{image-name}:{tag-name}
```

**Login with Docker Hub**

```console
docker login
```

**Push to Docker Hub**

```console
docker push {username}/{image-name}:{tag-name}
```

## 🐳 Usage with Dokku

https://dokku.com/docs~v0.23.9/deployment/methods/images/#docker-image-tag-deployment

## 👨‍💻 Deploy

- First, make the `deploy.sh` file executable by running the following:

```console
chmod +x deploy.sh
```

- Next, simply run the executable on the server:

```console
deploy.sh
```

## 🚧 Testing

**To run tests with Mocha**

```console
yarn test
```
