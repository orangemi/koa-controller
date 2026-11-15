# ESM example

A small Koa app using `@tng/koa-controller` from the repository root.

```sh
# in the repository root
pnpm install

# in example/esm
pnpm install
pnpm start        # builds the package, then serves http://localhost:4000
```

The example uses the package through `link:../..`, a symlink to the repository root, so it always sees the current build in `lib/`. `pnpm start` rebuilds it first. If your editor reports missing exports from `@tng/koa-controller`, run `pnpm build` in the repository root and restart the TypeScript server.

## Routes

`src/api.ts` has two plain routes. `src/api-comments.ts` shows `@stateInput` with `@validateState`:

```sh
# Create a comment: postId from the path, notify from the query, the rest from the body
curl -X POST 'localhost:4000/posts/1/comments?notify=true' \
  -H 'content-type: application/json' \
  -d '{"content":"Nice post","author":"ann","tags":["hello"]}'

# List comments: page and sort from the query
curl 'localhost:4000/posts/1/comments?page=1&sort=desc'

# Rejected by @validateState with a 400
curl 'localhost:4000/posts/abc/comments'          # /postId must be integer
curl 'localhost:4000/posts/1/comments?page=1.5'   # /page must be integer

# A body field cannot be supplied through the query string
curl -X POST 'localhost:4000/posts/1/comments?content=hi' \
  -H 'content-type: application/json' -d '{"author":"ann"}'

# @stateInput without @validateState: values are copied as they arrive
curl 'localhost:4000/posts/1/raw?page=2&other=ignored'
```
