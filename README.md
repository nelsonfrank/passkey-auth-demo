# Passkey Authentication with NestJS and WebAuthn

This project demonstrates a complete passkey (WebAuthn) authentication flow using Node.js (NestJS), TypeScript, and React.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the Project](#running-the-project)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Features

- **Passkey Authentication**: Passwordless login using WebAuthn.
- **JWT Authentication**: Secure API access with JSON Web Tokens.
- **TypeORM**: Database integration with PostgreSQL.
- **JWT Module**: Complete JWT management for authentication.
- **Cross-Platform Support**: Works with touch ID, face ID, and Windows Hello.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher (or access to a PostgreSQL database)
- **npm** or **yarn** or **pnpm**

## 🛠️ Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/passkey-auth.git
cd passkey-auth
```

### 2. Backend Setup

```bash
cd backend
npm install
# or
yarn install
# or
pnpm install
```

Create a `.env` file in the `backend` directory based on the `.env.example`:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_secret
JWT_EXPIRES_IN=3600
```

### 3. Frontend Setup

```bash
cd ../client
npm install
# or
yarn install
# or
pnpm install
```

Create a `.env` file in the `client` directory:

```bash
cp .env.example .env
```

Update the `.env` file:

```env
VITE_API_URL=http://localhost:3000
VITE_BASE_URL=http://localhost:5173
```

## 🚀 Running the Project

### Backend

Start the backend server in development mode:

```bash
cd backend
npm run start:dev
# or
yarn run start:dev
# or
pnpm run start:dev
```

The server will start at `http://localhost:3000`.

### Frontend

Start the frontend development server:

```bash
cd client
npm run dev
# or
yarn dev
# or
pnpm dev
```

The frontend will be available at `http://localhost:5173`.

## 🧪 Testing

### Register a User

1. Open your browser and go to `http://localhost:5173`
2. Click "Register" or navigate to the registration page
3. Enter an email address and click "Register"
4. Follow the browser prompts to create a passkey (using Touch ID, Face ID, or Windows Hello)

### Login with Passkey

1. Go to the login page
2. Enter the same email address
3. Click "Login"
4. Authenticate with your passkey
5. You should be redirected to the dashboard

### Validate Token

Check if the token is valid:

```bash
curl -X GET http://localhost:3000/auth/validate \
  -H "Authorization: Bearer <your_jwt_token>"
```

## 🔐 Environment Variables

### Backend (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `admin123` |
| `DB_NAME` | Database name | `passkey_db` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration time (seconds) | `3600` |

### Frontend (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |
| `VITE_BASE_URL` | Frontend base URL | `http://localhost:5173` |

## 📁 Project Structure

```
passkey-auth/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/         # User management
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── common/        # Shared utilities
│   │   └── main.ts        # Application entry point
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── PasskeyRegister.tsx
│   │   │   ├── PasskeyLogin.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/         # Route pages
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── router.tsx     # TanStack Router configuration
│   │   ├── utils/         # Utility functions
│   │   └── App.tsx        # Root component
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📝 Notes

- For local development, ensure both backend and frontend are running
- Use secure, random secrets for the JWT secret in production
- Consider using environment-specific configuration management for production
