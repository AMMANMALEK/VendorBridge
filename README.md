# VendorBridge

A hackathon-ready procurement and vendor management ERP built with React/Vite frontend and TypeScript/Express backend.

## 🚀 Project Overview

VendorBridge streamlines procurement workflows for enterprise buyers and vendor partners. It provides:

- Vendor onboarding and registration
- Authentication with role-based access
- RFQ creation, assignment, and quoting
- Approval workflows and status tracking
- Purchase order and invoice generation
- Activity logs and audit-style reporting

This repository includes separate `backend` and `frontend` apps so the developer experience is clean and easy to run locally.

## 🔧 Tech Stack

- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL-compatible database
- Frontend: React, Vite, React Router
- Auth: JWT bearer tokens
- Styling: Tailwind-inspired utility patterns and custom app UI
- API docs: Swagger UI

## 📁 Repository Structure

```
VendorBridge/
├── backend/            # Express API server written in TypeScript
│   ├── src/
│   │   ├── app.ts
│   │   ├── config/
│   │   ├── modules/    # auth, users, rfqs, quotations, approvals, vendors, invoices, etc.
│   │   ├── middleware/
│   │   ├── prisma/
│   │   └── swagger.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/           # React frontend built with Vite
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── context/
│   ├── package.json
│   └── vite.config.js
```

## ✅ Key Features

- Vendor signup with pending approval workflow
- Admin/Officer/Manager dashboards and authorization
- RFQ publishing, vendor assignment, and quotation submission
- Approval workflows with approve/reject actions
- Purchase order and invoice generation
- Notifications and activity logs
- Role-based UI routing and protected routes

## 🧪 Local Development

### Backend setup

1. Open a terminal and go to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with values like:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/vendorbridge"
JWT_SECRET=vendorbridge_jwt_secret_key_2024
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

4. Generate Prisma client and migrate the database:

```bash
npm run prisma:generate
npm run prisma:migrate dev
```

5. Seed sample data (optional):

```bash
npm run seed
```

6. Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000` by default.

### Frontend setup

1. Open another terminal and go to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend dev server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` by default.

## 🌐 API Base URL

The frontend uses:

```js
http://localhost:5000/api/v1
```

If you need to customize it, set the Vite environment variable in `frontend/.env`:

```env
VITE_API_BASE=http://localhost:5000/api/v1
```

## 🎯 Usage Notes

- Vendors register through the registration page, then wait for admin approval before logging in.
- Admin and procurement roles can create RFQs, manage vendors, and approve quotations.
- Vendors can submit quotations and review purchase orders once approved.
- The app uses JWTs for authentication, and protected API routes require the `Authorization: Bearer <token>` header.

## 📌 Helpful Scripts

### Backend

- `npm run dev` — start backend in development mode
- `npm run build` — compile TypeScript to JavaScript
- `npm run start` — run built backend
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:migrate dev` — apply database migrations
- `npm run seed` — seed initial data

### Frontend

- `npm run dev` — start Vite dev server
- `npm run build` — build production frontend
- `npm run preview` — preview production build

## 💡 Hackathon Tips

- Focus on the core buyer/vendor workflow first: register, login, create RFQs, submit quotations, approve.
- Use the modular backend routes to add one feature at a time.
- The frontend context layer already supports centralized state and API handling.
- Add new UI pages under `frontend/src/pages` and wire them through `App.jsx`.

## 📚 Notes

- The backend supports Swagger docs via `/api-docs`.
- The project is designed for easy extension and rapid prototyping for hackathon demos.
- If you want to remove the remote Tailwind CDN warning, install Tailwind locally and configure it as a PostCSS plugin.

## 🙌 Contribution

Feel free to extend the system with:

- role-based dashboards for analytics
- email notifications for approval flows
- richer vendor profiles and RFQ filters
- PDF export for invoices and purchase orders

---

Built for fast prototyping and enterprise procurement demos.
