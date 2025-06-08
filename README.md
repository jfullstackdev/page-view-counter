# Page View Counter

![452715000-717fa07b-20d3-40e5-849b-4c7315b84591-final](https://github.com/user-attachments/assets/86cb9c0d-74e7-4d08-8263-9bacc374a332)

A simple page view counter service that generates SVG badges to display view counts on websites.  
Inspired by [gjbae1212/hit-counter](https://github.com/gjbae1212/hit-counter), but built with the MERN stack
 — using **Redis** instead of MongoDB for fast, in-memory data storage.

## Features

- Generates SVG badges showing daily and total view counts
- Easy to use API endpoints
- Customizable badge colors and styles
- Built with Node.js, Express, and Redis

## Getting Started

### Prerequisites

- Node.js
- Redis server
- Docker and Docker Compose (optional, for containerized deployment)

but since I prepared the GitHub Codespaces, all are setup.

### Installation

1. there are 2 options for the Codespaces : 
    - **Open a Codespace directly from GitHub:**
      - If this repository is public, you can click the "Code" button on the
        repo page and select "Create codespace on main" (or another branch).
        No need to fork or clone first — GitHub will automatically provision a
        Codespace with the repo contents and devcontainer setup.
    - **Fork the repository:**
      - If you want your own copy of the repository (for making changes or
        keeping your own Codespace), fork it on GitHub, then open a Codespace
        from your fork.

2. Install all dependencies (backend and frontend):

Using npm scripts:
```bash
npm run install-all
```

Or manually:
```bash
# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

3. Run the application:

Using npm scripts:
```bash
# Run both backend and frontend concurrently
npm run dev

# Run only the backend
npm run server

# Run only the frontend
npm run client
```

Or manually:
```bash
# Run both backend and frontend concurrently
npx concurrently "cd server && npm run dev" "cd client && npm start"
```

### Environment Variables

- `PORT`: The port for the server to listen on (default: 3001)
- `REDIS_URI`: Redis connection URI (default: redis://localhost:6379)
- `REDIS_HOST`: Redis host (used if REDIS_URI is not provided)

## Using with GitHub Codespaces

### Port Visibility Issue

There is a known issue with port visibility in GitHub Codespaces during 
a fresh start or after a rebuild or other situations. 
If you encounter errors, simply toggle the port from Private to Public again and the problem will be solved.

### Data Persistence

The application is configured to maintain counter data between Codespace restarts and rebuilds:

- Redis is configured with both AOF (Append-Only File) and RDB persistence
- Data is stored in a named Docker volume (`redis-data`)
- Counter data will persist between:
  - Application restarts
  - Codespace stop/start operations
  - Container rebuilds

This ensures your page view statistics remain intact through development cycles and environment changes.
Note that each new codespace instance maintains its own isolated Redis database and is not connected to 
other instances. Every codespace will track and count page views independently.

## Use Case

**USE CASE** - Tested this on GitHub Repos and GitHub Pages, data is persistent after every
Codespaces restart and rebuild.

## Deployment

Currently, I'm not able to deploy this for others to use it publicly, but those interested in this 
project can deploy it themselves. The application can be deployed to any platform that supports:

- Node.js applications
- Redis database
- Docker containers (optional, but recommended)

Suitable hosting options include:
- Heroku with Redis add-on
- Digital Ocean with managed Redis
- AWS with ElastiCache
- Any VPS with Docker support

## Code Quality, Linting, Formatting, and Security

Both the frontend (client) and backend (server) are equipped with robust linting, formatting, and security tooling:

- **Linting:**
  - Run `npm run lint` in either the `client` or `server` directory to check for code style and quality issues.
  - Run `npm run lint:fix` to automatically fix many linting issues.
- **Formatting:**
  - Run `npm run format` in either the `client` or `server` directory to automatically format code using Prettier.
- **Vulnerability Checks:**
  - Run `npm audit` in either the `client` or `server` directory to check for security vulnerabilities in dependencies.
  - Run `npm audit fix` to attempt to automatically fix any found vulnerabilities.

These scripts help maintain code quality, consistency, and security across the project. 
It is recommended to run these checks regularly, especially before committing or deploying code.

---

- **ESLint (`eslint.config.js`):**
  - **Client (React/Vite):** Utilizes `eslint-plugin-react` for
    React-specific rules (including hooks and JSX best practices),
    `eslint-plugin-react-refresh` for Vite integration, and `globals`
    for browser environment. Prettier violations are treated as errors.
  - **Server (Node.js/Express):** Employs `eslint-plugin-n` for Node.js
    specific rules and `globals` for the Node.js environment. Prettier
    violations are treated as warnings.
  - Both use `@eslint/js` recommended rules as a base.
- **Prettier:** Integrated via `eslint-plugin-prettier` and
  `eslint-config-prettier` to handle all code formatting, ensuring a
  consistent style across the codebase. Formatting can be applied using
  `npm run format` in both `client` and `server` directories.
- **Consistency:** This setup helps maintain code quality, catch errors
  early, and enforce a uniform coding style throughout the project.

## License

MIT
