## Iocaste Query

_I am bad at naming things, will change it to something better before releasing_

### What is this?

A react query inspired query client for Svelte.

**Why not just use tanstack query for svelte?**

- It does not use the svelte 5 runes system
- It has not been updated in a while
- There is a lot of heavy stuff in there that I really don't need/want. All I really need is a good way to make queries and mutations
- I wanted to learn how to make this myself lol

### Want to try it?

_This is a work in progress, things will break, and it is not yet published to npm_

- Clone the repo
- Run `pnpm install`
- Run `pnpm run dev`
- Go to `http://localhost:5173`
- You can play around with the demo queries and mutations in the `src/routes` folder

### What is done

- Basic queries are ready
- Basic mutations are ready
- Queries are cached so that if they share a key they will not run twice
- Invalidation of queries is ready
- Creating a client is ready

### TODO

- Proper caching of queries. Right now if they share a key they will share data between them. I also need to setup cache lifetime and stuff like that.
- Documentation
- Tests
- Making it so that you can pass state variables into queries and then have the queries automatically rerun when those state variables change
- Abort controller support
- Make it so that when you refetch a query that is currently loading it will cancel the previous request
- License (will be MIT)
- Naming (I am bad at naming things, will change it to something better before releasing)
- More examples
- Release it to npm

### Previous scratch work

This project took me about 4 days to make. It started out as trying to make a TRPC for svelte, and I realized after building a server side version of it that TRPC is not something that should be rebuilt.

I then worked on a couple versions of a react query for svelte. I made a first version that was kind of a shit show. I then worked on porting the current tanstack query svelte package to runes and kinda decided it's not worth it. May go back to it later.

I also made a version that used Effect for the resolver. I personally like this better tbh, but I know it's gonna kill adoption.

Finally I made this version, it's the best one so far. Very much a WIP but I think it's a good start.

- Server side mini TRPC: https://github.com/bmdavis419/effect-plus-sveltekit/tree/main/src/routes/mini-query
- First attempt at react query for svelte: https://github.com/bmdavis419/effect-plus-sveltekit/tree/main/src/routes/europa
- Attempt with Effect: https://github.com/bmdavis419/effect-plus-sveltekit/tree/main/src/routes/metis
- This version: https://github.com/bmdavis419/iocaste-query
