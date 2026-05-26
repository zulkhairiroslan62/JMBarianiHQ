# JM Bariani HQ - Restaurant Management System

Smart restaurant management system with AI-powered stock forecasting and invoice OCR.

## Features

### 8 Core Modules
1. **Dashboard** - Global KPI overview, revenue charts, alerts
2. **Outlets** - Manage 4 outlets (Damansara, Subang, Cheras, Puchong)
3. **Smart Stock** - AI demand forecasting with Claude API
4. **Purchase Orders** - Supplier order management
5. **Smart Invoice** - OCR invoice scanning with Claude Vision
6. **Staff Management** - Attendance, shifts, roles
7. **Menu & Pricing** - Items, costs, margins
8. **Sales Reports** - Revenue trends, top items, outlet performance

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Prisma
- **Auth**: NextAuth.js (Owner/Manager/Staff roles)
- **AI**: Claude API (Anthropic) - for forecasting & OCR
- **UI**: Custom design matching mockup specifications

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zulkhairiroslan62/JMBarianiHQ.git
cd JMBarianiHQ
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Setup environment variables:
```bash
cp .env .env.local
# Edit .env.local with your credentials
```

4. Initialize database:
```bash
npx prisma db push
npx prisma generate
npm run db:seed
```

5. Run development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

### Owner Account
- Email: `owner@jmbariani.com`
- Password: `admin123`
- Access: All modules, all outlets

### Manager Accounts
- Email: `manager1@jmbariani.com` (Damansara)
- Email: `manager2@jmbariani.com` (Subang)
- Email: `manager3@jmbariani.com` (Cheras)
- Email: `manager4@jmbariani.com` (Puchong)
- Password: `manager123`
- Access: Own outlet only

## Database Schema

### Core Models
- **User** - Authentication & roles
- **Outlet** - 4 restaurant locations
- **MenuItem** - Menu items with pricing
- **Inventory** - Stock tracking per outlet
- **StockOrder** - AI-suggested orders
- **PurchaseOrder** - Supplier orders
- **Invoice** - OCR-scanned invoices
- **Staff** - Employee management
- **Attendance** - Daily attendance tracking
- **Sale** - Sales transactions
- **WasteLog** - Food waste tracking

## AI Features (Optional)

To enable AI features, add your Anthropic API key to `.env`:

```bash
ANTHROPIC_API_KEY="your-api-key-here"
```

### Smart Stock Forecasting
- Uses Claude Haiku for demand prediction
- Analyzes 90-day historical data
- Considers day of week, weather, events
- Suggests optimal order quantities

### Smart Invoice OCR
- Uses Claude Sonnet Vision for invoice scanning
- Extracts supplier, items, quantities, prices
- Confidence scoring (>95% auto-approve)
- Manual review for low-confidence scans

## Project Structure

```
JMBarianiHQ/
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
├── lib/                  # Utilities
├── prisma/               # Database schema & seed
├── types/                # TypeScript types
└── public/               # Static assets
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push schema to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database
- Development: SQLite (included)
- Production: Use Supabase PostgreSQL (free tier)

## Design System

### Colors
- Primary: `#7B3F00` (Brown)
- Accent: `#FAC775` (Gold)
- Success: `#27500A` (Green)
- Warning: `#854F0B` (Orange)
- Error: `#A32D2D` (Red)

### Typography
- Font: Inter (system font)
- Sizes: 10px - 24px

## License

Proprietary - JM Bariani House Sdn Bhd

## Support

For issues or questions, contact: zulkhairiroslan62@gmail.com
