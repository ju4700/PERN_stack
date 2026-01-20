# How to get started with prisma and express: (Walkthrough)

## Section 1
#### PS D:\Development\PERN_stack\practice_two> ``npm init -y``
Wrote to D:\Development\PERN_stack\practice_two\package.json:

{
  "name": "practice_two",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs"
}

#### PS D:\Development\PERN_stack\practice_two> ``npm install typescript tsx @types/node --save-dev``

added 34 packages, and audited 35 packages in 12s

2 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
PS D:\Development\PERN_stack\practice_two> npx tsc --init

Created a new tsconfig.json                                                                                             
                                                                                                                     TS 
You can learn more at https://aka.ms/tsconfig
#### PS D:\Development\PERN_stack\practice_two> ``npm install prisma``

added 91 packages, and audited 126 packages in 43s

13 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
#### PS D:\Development\PERN_stack\practice_two>  ``npx prisma init``

Initialized Prisma in your project

  prisma/
    schema.prisma
  prisma.config.ts
  .env
  .gitignore

Next, choose how you want to set up your database:

CONNECT EXISTING DATABASE:
  1. Configure your DATABASE_URL in prisma.config.ts
  2. Run prisma db pull to introspect your database.

CREATE NEW DATABASE:
  Local: npx prisma dev (runs Postgres locally in your terminal)
  Cloud: npx create-db (creates a free Prisma Postgres database)

Then, define your models in prisma/schema.prisma and run prisma migrate dev to apply your schema.

Learn more: https://pris.ly/getting-started

#### PS D:\Development\PERN_stack\practice_two> npx create-db
Need to install the following packages:
create-db@1.1.4
Ok to proceed? (y) y

┌  🚀 Creating a Prisma Postgres database
│
◇  Database created successfully!
│
│
●  Database Connection
│
│
│    Connection String:
│
│    postgresql://154c57983e2b4d47f7a455187987e343490a318446f742cf5a5ef8d3253fb209:sk_9Ck3lGVxfBGuepl5mSNA-@db.prisma.io:5432/postgres?sslmode=require
│
│
◆  Claim Your Database
│
│    Keep your database for free:
│
│    https://create-db.prisma.io/claim?projectID=proj_cmkl7qtaa0e9w09fmdbdu9rab&utm_source=create-db&utm_medium=cli
│
│    Database will be deleted on 1/20/2026, 7:40:56 PM if not claimed.
│
└  Done!

#### PS D:\Development\PERN_stack\practice_two> npm install express jsonwebtoken bcrypt zod

added 107 packages, and audited 207 packages in 6s

36 packages are looking for funding
  run `npm fund` for details

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
#### PS D:\Development\PERN_stack\practice_two> npm audit fix --force
npm warn using --force Recommended protections disabled.
npm warn audit Updating prisma to 6.19.2, which is a SemVer major change.

removed 56 packages, changed 7 packages, and audited 151 packages in 35s

31 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
PS D:\Development\PERN_stack\practice_two>

## Section 2
Now in the env file we will replace the database url with the given Connection String : `postgresql://154c57983e2b4d47f7a455187987e343490a318446f742cf5a5ef8d3253fb209:sk_9Ck3lGVxfBGuepl5mSNA-@db.prisma.io:5432/postgres?sslmode=require`

Let's make a `index.js` file in the root directory which basically be our main entry point.

As we have installed express, lets import express and then set a basic app on localhost:3000 which looks like this


```import express from 'express';
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});```
```

Now we will set `nodemon` so that if we make any changes to our entry point or where it redirects to restarts our server. in our package.json we will add a new script which is start: 'nodemon index.js'

```
"scripts": {
    "start": "nodemon index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },```
```

We will be practicing a to do app where users can signup, login and make changes in the to do list.
