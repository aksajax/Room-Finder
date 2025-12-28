<p align="center">
  <img src="https://img.icons8.com/fluency/96/real-estate.png" alt="RoomFinder Logo" width="80" height="80">
</p>

<h1 align="center">🏠 RoomFinder</h1>

<p align="center">
  <strong>Find Your Perfect Room with Ease</strong>
</p>

<p align="center">
  A modern, full-stack room rental platform built with React, TypeScript, and Supabase. Discover verified rental properties across major cities - from cozy studios to spacious apartments.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#database-schema">Database</a> •
  <a href="#api-reference">API</a> •
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</p>

---

## ✨ Features

### 🏡 For Users
- **Browse Rooms** - Explore a wide variety of rental properties with detailed information
- **Advanced Search & Filters** - Filter by location, budget, room type (1BHK, 2BHK, Studio, PG, etc.)
- **Wishlist** - Save favorite rooms for later viewing
- **Secure Booking** - Book rooms with integrated Razorpay payment gateway
- **Coupon System** - Apply discount coupons during checkout
- **Booking History** - Track all your bookings in one place
- **User Authentication** - Secure signup/login with email

### 🔧 For Admins
- **Dashboard** - Overview of bookings, rooms, and revenue statistics
- **Room Management** - Add, edit, and delete room listings
- **Booking Management** - View and manage all bookings with status updates
- **Coupon Management** - Create and manage discount coupons
- **Image Upload** - Upload room images to cloud storage

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Library |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **Tailwind CSS** | Styling |
| **Shadcn/ui** | UI Components |
| **Framer Motion** | Animations |
| **React Router v6** | Routing |
| **TanStack Query** | Data Fetching & Caching |
| **React Hook Form** | Form Management |
| **Zod** | Schema Validation |

### Backend
| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend as a Service |
| **PostgreSQL** | Database |
| **Supabase Auth** | Authentication |
| **Supabase Storage** | File Storage |
| **Edge Functions** | Serverless Functions |
| **Razorpay** | Payment Processing |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **bun** package manager
- **Supabase Account** (for backend services)
- **Razorpay Account** (for payments - optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/akashray398/roomfinder.git
   cd roomfinder
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## 📁 Project Structure

```
roomfinder/
├── public/                 # Static assets
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/            # Images and media files
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Shadcn/ui components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── RoomCard.tsx
│   │   ├── BookingForm.tsx
│   │   └── SearchFilters.tsx
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── WishlistContext.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useRooms.ts
│   │   ├── useBookings.ts
│   │   └── useAdmin.ts
│   ├── integrations/      # Third-party integrations
│   │   └── supabase/
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components
│   │   ├── Index.tsx
│   │   ├── Rooms.tsx
│   │   ├── RoomDetail.tsx
│   │   ├── Login.tsx
│   │   ├── MyBookings.tsx
│   │   ├── Wishlist.tsx
│   │   └── admin/        # Admin pages
│   │       ├── Dashboard.tsx
│   │       ├── AdminRooms.tsx
│   │       ├── AdminBookings.tsx
│   │       └── AdminCoupons.tsx
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── supabase/
│   ├── config.toml        # Supabase configuration
│   └── functions/         # Edge functions
│       ├── create-razorpay-order/
│       └── verify-razorpay-payment/
├── tailwind.config.ts     # Tailwind configuration
├── vite.config.ts         # Vite configuration
└── package.json
```

---

## 🗄 Database Schema

### Tables

#### `rooms`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Room title |
| description | TEXT | Room description |
| location | TEXT | Full address |
| city | TEXT | City name |
| price_per_day | NUMERIC | Daily rental price |
| price_per_month | NUMERIC | Monthly rental price |
| room_type | ENUM | 1BHK, 2BHK, 3BHK, studio, pg, hostel, flat, villa |
| bedrooms | INTEGER | Number of bedrooms |
| bathrooms | INTEGER | Number of bathrooms |
| area_sqft | INTEGER | Area in square feet |
| amenities | TEXT[] | List of amenities |
| images | TEXT[] | Image URLs |
| rating | NUMERIC | Average rating |
| is_available | BOOLEAN | Availability status |

#### `bookings`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| room_id | UUID | Foreign key to rooms |
| user_id | UUID | Foreign key to auth.users |
| full_name | TEXT | Customer name |
| email | TEXT | Customer email |
| phone | TEXT | Customer phone |
| check_in_date | DATE | Check-in date |
| check_out_date | DATE | Check-out date |
| status | ENUM | pending, confirmed, cancelled, completed |
| payment_method | TEXT | online, cash |
| total_amount | NUMERIC | Total booking amount |
| coupon_id | UUID | Applied coupon (optional) |
| discount_amount | NUMERIC | Discount applied |

#### `coupons`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| code | TEXT | Coupon code |
| discount_type | TEXT | percentage, fixed |
| discount_value | NUMERIC | Discount value |
| min_booking_amount | NUMERIC | Minimum order value |
| max_discount | NUMERIC | Maximum discount cap |
| usage_limit | INTEGER | Max usage count |
| valid_from | TIMESTAMP | Start date |
| valid_until | TIMESTAMP | Expiry date |
| is_active | BOOLEAN | Active status |

#### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| full_name | TEXT | User's full name |
| phone | TEXT | Phone number |
| avatar_url | TEXT | Profile picture URL |

#### `wishlists`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| room_id | UUID | Foreign key to rooms |

#### `user_roles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| role | ENUM | admin, user |

---

## 🔐 Authentication

RoomFinder uses Supabase Auth for secure authentication:

- **Email/Password** - Traditional signup and login
- **Auto-confirm** - Email confirmation enabled for seamless onboarding
- **Role-based Access** - Admin and User roles
- **First User Admin** - The first registered user automatically becomes admin

---

## 💳 Payment Integration

RoomFinder integrates with **Razorpay** for secure payment processing:

1. User initiates booking
2. Edge function creates Razorpay order
3. User completes payment via Razorpay checkout
4. Edge function verifies payment signature
5. Booking status updated to confirmed

### Edge Functions

- `create-razorpay-order` - Creates payment order
- `verify-razorpay-payment` - Verifies payment signature

---

## 🎨 Design System

### Color Palette

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| Primary | `hsl(174, 62%, 40%)` | `hsl(174, 62%, 50%)` |
| Accent | `hsl(15, 85%, 60%)` | `hsl(15, 85%, 55%)` |
| Background | `hsl(30, 20%, 98%)` | `hsl(220, 20%, 10%)` |
| Foreground | `hsl(220, 20%, 15%)` | `hsl(30, 20%, 95%)` |

### Typography

- **Font Family**: DM Sans
- **Headings**: Semibold, tight tracking
- **Body**: Regular weight

---

## 📱 Responsive Design

RoomFinder is fully responsive and optimized for:

- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥 Large screens (1280px+)

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
# or
bun run build
```

The build output will be in the `dist/` directory.




