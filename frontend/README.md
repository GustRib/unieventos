# UniEventos Frontend

React + TypeScript + Tailwind CSS SPA for the UniEventos platform.

## Stack

- React 19 + Vite 6
- TypeScript
- Tailwind CSS v4
- React Router v7

## Development

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and proxies `/api` to `http://localhost:8000`.

Ensure the Laravel API is running:

```bash
php artisan serve
```

## Routes

| Path | Role | Description |
|------|------|-------------|
| `/` | Public | Event discovery with search & filters |
| `/login` | Guest | Login |
| `/register/participant` | Guest | Expectador registration |
| `/register/organizer` | Guest | Organizador registration |
| `/events/:id` | Public | Event detail, registration, feedback |
| `/profile` | Participant | Edit profile |
| `/my-registrations` | Participant | Registration history |
| `/dashboard/organizer` | Organizer | Event CRUD |
| `/dashboard/organizer/events/:id/registrations` | Organizer | Approve/reject registrations |
| `/dashboard/admin` | Admin | Approve pending events |

## Build

```bash
npm run build
```
