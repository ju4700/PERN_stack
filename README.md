# How to get started with Prisma and Express: Todo App (Walkthrough)

You will build a Todo app where users can:

- Sign up
- Sign in
- Add todos
- Edit todos
- Mark todos completed
- Delete todos

This walkthrough is written for beginners and includes all required code + explanations.

## Prerequisites

- Node.js installed
- PostgreSQL installed and running
- A PostgreSQL database created (example: `tododb`)

## Important Prisma setup (follow exactly)

This guide uses a setup that works reliably:

- Uses `prisma.config.ts` to read the database URL using `env("DATABASE_URL")`
- Generates Prisma Client into `generated/prisma`
- Compiles that generated client into `dist/generated/prisma`
- Connects Prisma to Postgres using `@prisma/adapter-pg`

Why this matters:

- Your runtime code imports Prisma Client from `dist/generated/prisma/client.js`
- That means you must run both `npx prisma db push` and `npx tsc`

---

## Concepts you’ll learn (quick definitions)

- **Validation**: checking that a request has the correct fields and types (example: email must be an email).
- **Zod**: a library that makes validation easy with schemas and nice error messages.
- **JWT (JSON Web Token)**: a signed token string used to prove a user is logged in.
- **Middleware**: a function that runs before your route handler (example: check a JWT token).
- **Controller**: the function that contains the business logic (example: create a todo in the DB).

---

## Section 1 — Project init

---

## Section 1 — Project init

#### PS D:\Development\PERN_stack\todo_session> `npm init -y`

#### PS D:\Development\PERN_stack\todo_session> `npm install express prisma @prisma/client @prisma/adapter-pg pg dotenv bcrypt jsonwebtoken zod typescript`

#### PS D:\Development\PERN_stack\todo_session> `npm install --save-dev nodemon ts-node`

What you just installed (short explanations)

- `express`: the web server framework (handles routes like `/auth/sign-in`)
- `prisma`: Prisma CLI (init, db push, generate)
- `@prisma/client`: the Prisma Client package (used by the generated client)
- `pg`: PostgreSQL driver
- `@prisma/adapter-pg`: bridges Prisma to Postgres through the `pg` driver
- `dotenv`: loads `.env` variables into `process.env`
- `bcrypt`: hashes passwords securely
- `jsonwebtoken`: creates and verifies JWT tokens
- `zod`: validates request bodies (input validation)
- `typescript`: compiles the generated Prisma client into `dist/`
- `nodemon` (dev): restarts the server when files change
- `ts-node` (dev): run TypeScript files directly (optional, but common)

Now edit `package.json`:

- set ESM: `"type": "module"`
- add start script: `"start": "nodemon index.js"`

Example:

```json
{
  "name": "todo_session",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "nodemon index.js"
  }
}
```

Create a `.gitignore` (recommended)

If you plan to use git, create a `.gitignore` so you don’t commit dependencies, build output, or secrets:

```gitignore
node_modules/
dist/
generated/
.env
```

---

## Section 2 — Prisma init + config

#### PS D:\Development\PERN_stack\todo_session> `npx prisma init`

This creates:

- `prisma/schema.prisma`
- `prisma.config.ts`
- `.env`
- `.gitignore`

### 2.1 Set your `.env`

Edit `.env`:

```dotenv
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/tododb?schema=public"
JWT_SECRET="<generate one>"
```

Generate a good secret:

#### PS D:\Development\PERN_stack\todo_session> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Paste the output into `JWT_SECRET`.

### 2.2 Make sure `prisma.config.ts` uses env URL

Your `prisma.config.ts` should look like this:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Concept: why `prisma.config.ts`?

- Prisma can load the DB URL from this config.
- That’s why `schema.prisma` can omit `url = env("DATABASE_URL")` in the datasource.

---

## Section 3 — Schema for Todo app (User + Todo)

Edit `prisma/schema.prisma`.

This schema uses snake_case columns and keeps the model names simple (`users`, `todos`).

Important (Postgres UUIDs)

- This schema uses `uuid_generate_v4()`.
- If your database doesn’t have it, run this once:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model users {
  id            String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  email         String   @unique @db.VarChar(255)
  first_name    String   @db.VarChar(100)
  last_name     String   @db.VarChar(100)
  password_hash String   @db.VarChar(255)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  todos         todos[]
}

model todos {
  id          String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  user_id     String   @db.Uuid
  title       String   @db.VarChar(200)
  description String?  @db.VarChar(1000)
  completed   Boolean  @default(false)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  users       users    @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

### 3.1 Apply schema to DB

#### PS D:\Development\PERN_stack\todo_session> `npx prisma db push`

Because we set `output = "../generated/prisma"`, Prisma generates a client into `generated/prisma/`.

### 3.2 Compile the generated client to `dist/`

Why do we compile?

- Prisma generates TypeScript files into `generated/prisma/`.
- Our runtime import will come from `dist/generated/prisma/client.js`.
- So we compile once using TypeScript.

#### PS D:\Development\PERN_stack\todo_session> `npx tsc --init`

Edit `tsconfig.json` to keep it simple and aligned with your setup:

```jsonc
{
  "compilerOptions": {
    "outDir": "./dist",
    "module": "nodenext",
    "target": "esnext",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

Now compile:

#### PS D:\Development\PERN_stack\todo_session> `npx tsc`

After this you should have:

- `dist/generated/prisma/client.js`

> Anytime you change schema and rerun `prisma db push`, run `npx tsc` again.

---

## Section 4 — Folder structure

Create:

```
todo_session/
  controllers/
  database/
  middlewares/
  routes/
  prisma/
  frontend/
  index.js
  package.json
  prisma.config.ts
  .env
```

Why this structure?

- `index.js`: app entry point (server setup + mount route groups)
- `routes/`: defines URL paths (example: `/auth/sign-in`) and maps them to controllers
- `controllers/`: contains the “real logic” (validation, DB queries, responses)
- `middlewares/`: reusable functions that run before controllers (example: auth check)
- `database/`: Prisma client setup and DB connection
- `prisma/`: schema definition
- `frontend/`: static files served by Express to quickly test your API

---

## Section 5 — Prisma client setup

Create `database/prisma.js`:

```js
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../dist/generated/prisma/client.js";

const connectionString = String(process.env.DATABASE_URL);
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

export { prisma };
```

---

## Section 6 — Auth middleware

What is middleware?

- Middleware is a function that runs **before** your route handler.
- In this app, it protects routes so only logged-in users can access them.

How we send auth from the client:

- We send a header: `Authorization: Bearer <token>`
- The word `Bearer` is a common convention meaning “this is an access token”.

Create `middlewares/auth.js`:

```js
import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = decoded.userId;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      omit: { password_hash: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  });
};
```

Concept: What is a JWT (JSON Web Token)?

JWT stands for **JSON Web Token**.

At a high level:

- When a user logs in, the server creates a token that “represents” that user.
- The client stores the token.
- On protected endpoints, the client sends the token.
- The server verifies the token and knows which user is calling.

### JWT is *signed*, not *encrypted*

- **Signed** means: the server can detect if the token was changed.
- It does **not** mean the contents are secret.
- So: never put passwords or private data inside a JWT.

### What’s inside a JWT?

A JWT has 3 parts:

1. **Header** (algorithm + token type)
2. **Payload** (your data, like `userId`)
3. **Signature** (proof it wasn’t modified)

It looks like:

`header.payload.signature`

### What is `JWT_SECRET`?

- It’s the secret key used to create and verify the signature.
- Anyone without the secret **cannot** create a valid signature.
- If you change `JWT_SECRET`, all old tokens become invalid.

### How do we create the token?

In the sign-in controller we do something like:

```js
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);
```

This means:

- The payload contains `userId` (the most important part).
- The token expires in 1 hour (so it can’t be used forever if stolen).

### How does the client send the token?

The standard approach is the `Authorization` header:

`Authorization: Bearer <token>`

Why “Bearer”?

- It’s a convention that means: “whoever *bears* (has) this token is allowed”.
- That’s why you must keep the token safe.

### How do we verify the token?

In `authMiddleware` we do:

```js
jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
  if (err) return res.status(401).json({ message: "Unauthorized" });
  const userId = decoded.userId;
  // ...load user, attach to req.user
});
```

If verification fails, it usually means:

- token is expired
- token was edited/tampered
- token was signed with a different secret

### Why do we still fetch the user from DB?

Even if the token is valid, we fetch the user so we can:

- confirm the account still exists
- attach a clean user object to `req.user` for controllers

### Security notes (important)

- Do **not** store JWT in plain text inside your database.
- In production, avoid storing JWT in `localStorage` if you can (XSS risk). Cookies with `httpOnly` are often safer.
- Always use HTTPS in production so tokens aren’t sent over plain HTTP.

Concept: Why do we fetch the user from DB in middleware?

- A valid token proves the user logged in, but the user could be deleted later.
- Fetching the user ensures the account still exists and gives controllers access to `req.user`.

---

## Section 7 — Auth controller + routes (signup/signin/me)

Concept: What is validation?

- Validation means checking input before using it.
- Example: ensure `email` is a real email and `password` is at least 8 characters.

Concept: Why Zod?

- Zod lets you define a schema and validate `req.body`.
- `safeParse()` prevents crashes and gives you a clean `{ success, data, error }` result.

Concept: Why bcrypt?

- Storing raw passwords is dangerous.
- We store a bcrypt hash in the DB (`password_hash`).
- On login we compare the entered password against the stored hash.

### 7.1 Controller

Create `controllers/authController.js`:

```js
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma.js";

export const userSignup = async (req, res) => {
  const schema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request data", errors: parsed.error.flatten() });
  }

  const { firstName, lastName, email, password } = parsed.data;

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const created = await prisma.users.create({
    data: { first_name: firstName, last_name: lastName, email, password_hash },
    omit: { password_hash: true },
  });

  res.json({ message: "User created successfully", user: created });
};

export const userSignin = async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request data", errors: parsed.error.flatten() });
  }

  const user = await prisma.users.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const ok = await bcrypt.compare(parsed.data.password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ message: "Sign-in successful", data: { token } });
};

export const getCurrentUser = async (req, res) => {
  res.json({
    status: "success",
    message: "User profile fetched successfully",
    data: { user: req.user },
  });
};
```

### 7.2 Routes

Create `routes/authRoutes.js`:

```js
import express from "express";
import { userSignin, userSignup, getCurrentUser } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/sign-in", userSignin);
router.post("/sign-up", userSignup);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
```

---

## Section 8 — Todo controller + routes (add/list/update/delete)

### 8.1 Controller

Create `controllers/todoController.js`:

```js
import { z } from "zod";
import { prisma } from "../database/prisma.js";

export const createTodo = async (req, res) => {
  const schema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request data", errors: parsed.error.flatten() });
  }

  const todo = await prisma.todos.create({
    data: {
      user_id: req.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
    },
  });

  res.json({ message: "Todo created", todo });
};

export const getMyTodos = async (req, res) => {
  const todos = await prisma.todos.findMany({
    where: { user_id: req.user.id },
    orderBy: { created_at: "desc" },
  });

  res.json({ todos });
};

export const updateTodo = async (req, res) => {
  const schema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    completed: z.boolean().optional(),
  });

  const parsed = schema.safeParse({
    id: req.params.id,
    title: req.body.title,
    description: req.body.description,
    completed: req.body.completed,
  });

  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request data", errors: parsed.error.flatten() });
  }

  const existing = await prisma.todos.findUnique({ where: { id: parsed.data.id } });
  if (!existing || existing.user_id !== req.user.id) {
    return res.status(404).json({ message: "Todo not found" });
  }

  const updated = await prisma.todos.update({
    where: { id: parsed.data.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description === undefined ? undefined : parsed.data.description,
      completed: parsed.data.completed,
    },
  });

  res.json({ message: "Todo updated", todo: updated });
};

export const deleteTodo = async (req, res) => {
  const schema = z.object({ id: z.string().uuid() });
  const parsed = schema.safeParse({ id: req.params.id });
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request data", errors: parsed.error.flatten() });
  }

  const existing = await prisma.todos.findUnique({ where: { id: parsed.data.id } });
  if (!existing || existing.user_id !== req.user.id) {
    return res.status(404).json({ message: "Todo not found" });
  }

  const deleted = await prisma.todos.delete({ where: { id: parsed.data.id } });
  res.json({ message: "Todo deleted", todo: deleted });
};
```

### 8.2 Routes

Create `routes/todoRoutes.js`:

```js
import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { createTodo, getMyTodos, updateTodo, deleteTodo } from "../controllers/todoController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTodo);
router.get("/", getMyTodos);
router.patch("/:id", updateTodo);
router.delete("/:id", deleteTodo);

export default router;
```

---

## Section 9 — Express entry point

Create `index.js`:

```js
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";

const app = express();
const port = 3000;

app.use(express.static("frontend"));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/todos", todoRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
```

What is happening in `index.js`?

- `express.static("frontend")` lets the browser load `frontend/index.html` and `frontend/app.js`.
- `express.json()` lets your server read JSON bodies (so `req.body` works).
- `app.use("/auth", authRoutes)` means all auth endpoints start with `/auth`.
- `app.use("/todos", todoRoutes)` means all todo endpoints start with `/todos`.

Concept: Routes vs Controllers

- Routes define *URLs*.
- Controllers contain the *logic* (validation + DB queries + response).

---

## Section 10 — Minimal frontend (no heavy styling)

Create `frontend/index.html`:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Todo App</title>
  </head>
  <body>
    <h1>Todo App</h1>

    <h2>Auth</h2>
    <div>
      <h3>Sign up</h3>
      <input id="suFirst" placeholder="first name" />
      <input id="suLast" placeholder="last name" />
      <input id="suEmail" placeholder="email" />
      <input id="suPass" placeholder="password (min 8)" type="password" />
      <button id="btnSignup">Sign up</button>
    </div>

    <div>
      <h3>Sign in</h3>
      <input id="siEmail" placeholder="email" />
      <input id="siPass" placeholder="password" type="password" />
      <button id="btnSignin">Sign in</button>
      <button id="btnMe">Me</button>
    </div>

    <p><b>Token:</b> <span id="token"></span></p>

    <hr />

    <h2>Todos</h2>
    <div>
      <input id="todoTitle" placeholder="title" />
      <input id="todoDesc" placeholder="description (optional)" />
      <button id="btnAdd">Add</button>
      <button id="btnRefresh">Refresh</button>
    </div>

    <ul id="list"></ul>

    <pre id="out"></pre>

    <script src="./app.js"></script>
  </body>
</html>
```

Create `frontend/app.js`:

```js
let token = localStorage.getItem("token") || "";

function out(x) {
  const outEl = document.getElementById("out");
  outEl.textContent = typeof x === "string" ? x : JSON.stringify(x, null, 2);
}

function setToken(t) {
  token = t;
  localStorage.setItem("token", t);
  document.getElementById("token").textContent = t ? t.slice(0, 20) + "..." : "";
}

setToken(token);

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

async function refreshTodos() {
  const data = await api("/todos");
  const list = document.getElementById("list");
  list.innerHTML = "";

  for (const t of data.todos) {
    const li = document.createElement("li");

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = t.completed;
    chk.onchange = async () => {
      try {
        await api(`/todos/${t.id}`, { method: "PATCH", body: JSON.stringify({ completed: chk.checked }) });
        await refreshTodos();
      } catch (e) {
        out(e);
      }
    };

    const txt = document.createElement("span");
    txt.textContent = ` ${t.title} ${t.description ? "- " + t.description : ""} `;

    const btnDel = document.createElement("button");
    btnDel.textContent = "Delete";
    btnDel.onclick = async () => {
      try {
        await api(`/todos/${t.id}`, { method: "DELETE" });
        await refreshTodos();
      } catch (e) {
        out(e);
      }
    };

    const btnEdit = document.createElement("button");
    btnEdit.textContent = "Edit";
    btnEdit.onclick = async () => {
      const title = prompt("New title", t.title);
      if (title === null) return;
      const description = prompt("New description (blank = empty)", t.description || "");
      if (description === null) return;

      try {
        await api(`/todos/${t.id}`, {
          method: "PATCH",
          body: JSON.stringify({ title, description }),
        });
        await refreshTodos();
      } catch (e) {
        out(e);
      }
    };

    li.appendChild(chk);
    li.appendChild(txt);
    li.appendChild(btnEdit);
    li.appendChild(btnDel);
    list.appendChild(li);
  }
}

document.getElementById("btnSignup").onclick = async () => {
  try {
    const data = await api("/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({
        firstName: document.getElementById("suFirst").value,
        lastName: document.getElementById("suLast").value,
        email: document.getElementById("suEmail").value,
        password: document.getElementById("suPass").value,
      }),
    });
    out(data);
  } catch (e) {
    out(e);
  }
};

document.getElementById("btnSignin").onclick = async () => {
  try {
    const data = await api("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("siEmail").value,
        password: document.getElementById("siPass").value,
      }),
    });
    setToken(data.data.token);
    out(data);
    await refreshTodos();
  } catch (e) {
    out(e);
  }
};

document.getElementById("btnMe").onclick = async () => {
  try {
    const data = await api("/auth/me");
    out(data);
  } catch (e) {
    out(e);
  }
};

document.getElementById("btnAdd").onclick = async () => {
  try {
    const data = await api("/todos", {
      method: "POST",
      body: JSON.stringify({
        title: document.getElementById("todoTitle").value,
        description: document.getElementById("todoDesc").value || undefined,
      }),
    });
    out(data);
    await refreshTodos();
  } catch (e) {
    out(e);
  }
};

document.getElementById("btnRefresh").onclick = async () => {
  try {
    await refreshTodos();
  } catch (e) {
    out(e);
  }
};
```

Frontend concepts (what this code is doing)

- `document.getElementById("someId")`: returns the HTML element with that `id`.
  We use it to read inputs like email/password and to update the page.
- `element.onclick = () => { ... }`: adds a click handler to a button.
  When you click “Sign in”, we run code that sends a request to the backend.
- `localStorage`: a built-in browser key/value store.
  We save the JWT token in `localStorage` so the user stays logged in after refresh.
- `fetch(url, options)`: the browser API for making HTTP requests.
  We wrap it in `api()` so every request automatically:
  - sends JSON headers (`Content-Type: application/json`)
  - sends the JWT token as `Authorization: Bearer <token>`
- `JSON.stringify(...)`: converts a JS object into JSON text for the request body.
- `res.json()`: converts the response JSON text back into a JS object.

---

## Section 11 — Run it

Make sure your DB is reachable from `DATABASE_URL`.

Then:

#### PS D:\Development\PERN_stack\todo_session> `npx prisma db push`
#### PS D:\Development\PERN_stack\todo_session> `npx tsc`
#### PS D:\Development\PERN_stack\todo_session> `npm start`

Open:

- `http://localhost:3000/`

---

## Section 12 — API quick reference

### Auth
- `POST /auth/sign-up` body: `{ firstName, lastName, email, password }`
- `POST /auth/sign-in` body: `{ email, password }` → returns `{ token }`
- `GET /auth/me` header: `Authorization: Bearer <token>`

### Todos (protected)
- `POST /todos` body: `{ title, description? }`
- `GET /todos`
- `PATCH /todos/:id` body: `{ title?, description?, completed? }`
- `DELETE /todos/:id`

---

## Notes

- This setup imports Prisma Client from `dist/generated/prisma/client.js`, so always run `npx tsc` after `npx prisma db push`.
- If you get UUID errors, enable Postgres extension `uuid-ossp`.
- This is a minimal example; in production, consider better error handling, logging, and security practices - ju4700