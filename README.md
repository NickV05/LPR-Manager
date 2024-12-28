# Mini LPR Session Manager (Node.js + PostgreSQL)

## Overview

This project consists of two main components:

- **Client**: The frontend application.
- **Server**: The backend application.

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js**
- **NVM**
- **TypeScript**
- **npm**
- **PostgreSQL**

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/NickV05/LPR-Manager.git
cd LPR-Manager
```

### 2. Install Dependencies

#### Client

```bash
cd client
npm install
```

#### Server

```bash
cd ../server
npm install
```

---

## Database Setup

To set up a local PostgreSQL database:

1. Ensure PostgreSQL GUI is installed from official website (https://www.postgresql.org/download) and running on your machine.
2. Set up password, port.
3. Required databases will be intialized on the firts run of the server
4. Create the `.env` file in the `server` folder with the following configuration:
   ```env
   PORT = <your local port number>, default/suggested is 3000
   DB_HOST =  <your local port number>, default/suggested is localhost
   DB_USER =  <your local USER name>, default/suggested is postgres
   DB_PORT = <your local DB Port>, default/suggested is  5432
   DB_PASSWORD = <your local DB password>, default/suggested is  MyPassword05
   DB_NAME = <your local DB name>, default/suggested is  postgres

````

---

## Client Setup
To set up a local PostgreSQL database:
1. Ensure PostgreSQL is installed and running on your machine.
2. Required databases will be intialized on the firts run of the server
3. Create the `.env` file in the `client` folder with the following configuration:
```env
VITE_SERVER_URL = <your client localhost >, default/suggested is "http://localhost:3000"
````

---

## Running the Application

### Server

To start the backend server:

```bash
cd server
npm run start
```

### Client

To start the frontend development server:

```bash
cd client
npm run dev
```

---

## Testing

### Server

Run unit tests with Jest:

```bash
cd server
npm test

```

### Client

Keep Server running, Run end-to-end tests using Playwright:

```bash
cd client
npm run test:e2e
```

