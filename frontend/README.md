# E-Commerce Frontend

A modern Next.js e-commerce frontend that integrates with a FastAPI backend.

## Features

- **Authentication**: JWT-based login/register with role-based access control
- **Product Management**: Browse products with filtering and search
- **Cart Management**: Guest cart with localStorage, user cart with API integration
- **Order Management**: Complete checkout process and order tracking
- **Admin Dashboard**: Product, category, and order management for administrators

## Getting Started

### Prerequisites

- Node.js 18+ 
- Your FastAPI backend running on `http://localhost:8000`

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create environment file:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

3. Update `.env.local` with your FastAPI backend URL:
\`\`\`
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

This frontend is designed to work with a FastAPI backend that provides:

- Authentication endpoints (`/users/token`, `/users/`, `/users/me`)
- Product management (`/products/`, `/categories/`)
- Cart management (`/carts/`)
- Order management (`/orders/`)
- Admin endpoints for managing products, categories, and orders

## Project Structure

- `app/` - Next.js app router pages
- `components/` - Reusable React components
- `hooks/` - Custom React hooks for auth and cart management
- `lib/` - Utility functions and API client
- `public/` - Static assets

## Technologies Used

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Radix UI components
- Lucide React icons
