<p align="center">
  <a href="https://sketch-ai-gpt.vercel.app/">
    <picture>
      <img src="public/app-icon.png" width="125" height="158">
    </picture>
    <h1 align="center">Sketch AI</h1>
  </a>
</p>

<!-- BUILT WITH -->

### Built With

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://prisma.io/)
- [Replicate](https://replicate.com/)
- [AWS](https://aws.amazon.com/)
- [Vercel](https://vercel.com/)

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running, please follow these simple steps.

### Prerequisites

- Node.js **(Version: >=18.x)**

<!-- Setup -->

### Setup

1. Clone the repo into a public GitHub repository
   ```sh
   git clone https://github.com/peterhangg/sketch-ai.git
   ```
2. Go to the project folder

   ```sh
   cd sketch-ai
   ```

3. Install packages with npm

- Use recommended node version

  ```sh
  nvm use
  ```

- Install app dependencies

  ```sh
  npm i
  ```

4. Set up your `.env` file

- Duplicate `.env.example` to `.env`.

5. Set up Replicate

- Visit [replicate](https://replicate.com/account/api-tokens) to generate keys and add to `.env` file.

6. Set up authentication

- Generate a secret key and add it to `NEXTAUTH_SECRET` in the `.env` file.
  ```
  openssl rand -base64 32
  ```
- Auth configuration with [Google](https://next-auth.js.org/providers/google) and [Discord](https://next-auth.js.org/providers/discord). Add keys to `.env` file.

7. Set up rate-limiting

- Create Redis client on [Upstash](https://docs.upstash.com/redis) and add keys to `.env` file.
- Currently set to **10 request per hour**. This can be updated in `lib/rate-limit.ts`.

8. Set up AWS for storage

- Create [S3 Bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html) on AWS and add keys to `.env` file.

9. Set up Prisma

- Database can be set up with either [Docker](https://www.docker.com/) or [PlanetScale](https://planetscale.com/).

  - With **Docker**:
    - In `prisma/schema.prisma` file, update `datasource db` with the following:
      ```sh
      datasource db {
          provider = "postgresql"
          url = env("DATABASE_URL")
      }
      ```
    - Run [postgresql](https://www.postgresql.org/) docker container.
      ```sh
      docker compose up
      ```
    - Generate schema on postgresql container.
      ```
      npx prisma migrate dev
      ```
    - Interactive visual editor [(Prisma Studio)](https://www.prisma.io/docs/concepts/components/prisma-studio) for data in the database. Run command in new terminal.
      ```
      npx prisma studio
      ```
  - With **PlanetScale**:

    - Visit [PlanetScale](https://planetscale.com/docs/tutorials/connect-nextjs-app) to create a new database.
    - After creating database, click `Connection String` and under `Connect with`, select `Prisma`.
    - Copy new `DATABASE_URL` value and update on `.env` file.
    - Push schema defintion onto PlanetScale.
      ```
      npx prisma db push
      ```
    - Proxy database for [local client](https://planetscale.com/docs/reference/connect) on a new terminal.

      ```
      pscale connect <DATABASE_NAME> <BRANCH_NAME> <FLAG> --port 3309
      ```

    - Open [MYSQL shell instance](https://planetscale.com/docs/reference/shell) on a new terminal.
      ```
      pscale shell <DATABASE_NAME> <BRANCH_NAME> <FLAG>
      ```

10. Run development server
    ```
    npm run dev
    ```

- Open http://localhost:3000 with your browser to see the result.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
