# Frontend Test - Traffic Report Application

Aplikasi ini dibangun dengan Next.js 15, menggunakan Domain-Driven Design (DDD), Atomic Design Pattern, dan responsive design.

## 🏗️ Arsitektur & Metodologi

### Domain-Driven Design (DDD)
Project ini mengimplementasikan DDD untuk memisahkan business logic dari infrastruktur:

```
src/
├── domain/           # Business logic & entities
│   ├── entities/     # Domain entities (User, Gerbang, Lalin)
│   ├── repositories/ # Repository interfaces
│   └── value-objects/# Value objects (PaymentMethod)
├── application/      # Use cases & business rules
│   └── use-cases/    # Business use cases
├── infrastructure/   # External concerns
│   ├── api/        # API client
│   └── repositories/# Repository implementations
└── presentation/   # UI layer
    ├── components/ # UI components
    ├── hooks/      # Custom hooks
    └── contexts/   # React contexts
```

### Atomic Design Pattern
Komponen UI diorganisir berdasarkan kompleksitas:

```
src/presentation/components/
├── atoms/          # Basic building blocks
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Select.tsx
├── molecules/      # Simple combinations
│   ├── BaseTable.tsx
│   ├── DataTable.tsx
│   └── FilterForm.tsx
├── organisms/      # Complex components
│   ├── LaporanTable.tsx
│   ├── MasterDataContainer.tsx
│   └── Header.tsx
└── templates/      # Page layouts
    ├── LaporanTemplate.tsx
    └── MasterDataTemplate.tsx
```

### Responsive Design
- **Desktop First**: Optimized untuk desktop dengan fallback mobile
- **Breakpoints**: 
  - `sm`: 640px
  - `lg`: 1024px
  - `xl`: 1280px
- **Mobile Strategy**: 
  - Card view untuk tabel kompleks
  - Incompatible message untuk laporan lalin
  - Responsive navigation dan layout

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Backend API running on `http://localhost:8080`

### Installation
```bash
# Clone repository
git clone <repository-url>
cd fe-test

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Configuration

#### 1. Buat file `.env.local` di root project:
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_API_TIMEOUT=10000

# Environment
NODE_ENV=development
```

#### 2. Atau buat file `.env` (alternatif):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_API_TIMEOUT=10000
NODE_ENV=development
```

#### 3. Environment Variables:
- `NEXT_PUBLIC_API_BASE_URL`: URL base untuk API backend
- `NEXT_PUBLIC_API_TIMEOUT`: Timeout untuk request API (ms)
- `NODE_ENV`: Environment mode (development/production)

## 📁 Struktur Project

```
src/
├── app/                    # Next.js App Router
│   ├── (private)/         # Protected routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── laporan-lalin/ # Traffic report pages
│   │   └── master-gerbang/# Master data pages
│   ├── login/             # Authentication page
│   └── layout.tsx         # Root layout
├── application/           # Application layer (DDD)
│   └── use-cases/        # Business use cases
├── domain/               # Domain layer (DDD)
│   ├── entities/         # Domain entities
│   ├── repositories/     # Repository interfaces
│   └── value-objects/    # Value objects
├── infrastructure/       # Infrastructure layer (DDD)
│   ├── api/             # API client
│   └── repositories/    # Repository implementations
├── presentation/         # Presentation layer
│   ├── components/      # UI components (Atomic Design)
│   ├── hooks/           # Custom React hooks
│   └── contexts/        # React contexts
└── shared/              # Shared utilities
    ├── container/       # Dependency injection
    ├── types/           # TypeScript types
    └── utils/           # Utility functions
```

## 🎨 Design System

### Atomic Design Components

#### Atoms
- **Button**: Reusable button component
- **Input**: Form input component  
- **Select**: Dropdown select component
- **TableCell**: Table cell component
- **TableHeader**: Table header component

#### Molecules
- **BaseTable**: Basic table component
- **DataTable**: Enhanced table with sorting
- **ResponsiveTable**: Mobile-responsive table
- **FilterForm**: Search and filter form
- **PaginationControls**: Table pagination

#### Organisms
- **LaporanTable**: Traffic report table
- **MasterDataContainer**: Master data management
- **Header**: Application header
- **Sidebar**: Navigation sidebar

#### Templates
- **LaporanTemplate**: Report page layout
- **MasterDataTemplate**: Master data page layout

### Responsive Strategy

#### Desktop (≥1024px)
- Full table view dengan semua kolom
- Sidebar navigation
- Complete functionality

#### Mobile (<1024px)
- **Laporan Lalin**: Incompatible message
- **Master Data**: Card view untuk tabel
- **Navigation**: Collapsible sidebar
- **Forms**: Stacked layout

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Quality
- **ESLint**: Code linting dengan Next.js config
- **TypeScript**: Type safety
- **Prettier**: Code formatting (recommended)

### Testing
```bash
# Run tests (if available)
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Build Production
```bash
npm run build
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
NEXT_PUBLIC_API_TIMEOUT=15000
NODE_ENV=production
```

## 📱 Mobile Compatibility

### Supported Features
- ✅ Dashboard
- ✅ Master Data (Gerbang)
- ✅ Authentication
- ❌ Laporan Lalin (Desktop only)

### Mobile Strategy
- **Responsive Tables**: Card view untuk data kompleks
- **Touch-friendly**: Large buttons dan touch targets
- **Performance**: Optimized untuk mobile networks

## 🔐 Security

### Environment Variables
- File `.env*` di-ignore oleh Git
- Sensitive data tidak di-commit
- Production secrets via deployment platform

### Authentication
- JWT token management
- Protected routes dengan middleware
- Session management

## 📊 Performance

### Optimizations
- **Code Splitting**: Automatic dengan Next.js
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in analyzer
- **Caching**: API response caching

### Monitoring
- **Core Web Vitals**: Performance metrics
- **Bundle Size**: Optimized chunks
- **Loading States**: User feedback

## 🤝 Contributing

### Code Standards
1. **DDD Principles**: Maintain layer separation
2. **Atomic Design**: Use appropriate component level
3. **TypeScript**: Strict type checking
4. **Responsive**: Mobile-first approach
5. **Clean Code**: Readable and maintainable

### Git Workflow
```bash
# Feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

### Common Issues

#### Environment Variables Not Loading
```bash
# Check file exists
ls -la .env.local

# Restart development server
npm run dev
```

#### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

#### TypeScript Errors
```bash
# Check types
npm run type-check

# Restart TypeScript server
# In VS Code: Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

### Getting Help
- Check existing issues
- Create new issue dengan detail
- Provide error logs dan steps to reproduce