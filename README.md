# FarmLink Backend

## Quick Project Setup

Follow these steps to set up the project locally:

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/FarmLink-ppp/farmlink-backend.git
   cd farmlink-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the required environment variables:

   ```bash
   cp .env.example .env
   ```

4. Start the database (if using Docker) or set up PostgreSQL locally:
   If you have Docker installed, you can start the PostgreSQL database using Docker Compose (recommended approach):

   ```bash
   docker-compose up -d database
   ```

   Or, if you have PostgreSQL installed locally, ensure the database is running.

   1- navigate to services in windows and start the PostgreSQL service.
   3- create a new user with the username `your_username` and password `your_password`.
   4- create a new database with the name `farmlink` and assign the user you created as the owner.
   5- update the `.env` file with the database connection details.

   ```bash
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/farmlink
   ```

5. Run database migrations to set up the initial schema:

   ```bash
   npx prisma migrate deploy
   ```

   This command will apply the migrations defined in the `prisma/migrations` directory to your database.

6. Start the development server:

   ```bash
   npm run start:dev
   ```

   This will start the server on `http://localhost:3000`.
   You can access the API documentation at `http://localhost:3000/api/docs`.
