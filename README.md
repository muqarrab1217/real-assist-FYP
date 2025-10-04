# RealAssist - AI-Powered Real Estate Automation

A modern, visually-attractive SaaS website frontend for RealAssist, built with React, Tailwind CSS, and TypeScript. This application provides a comprehensive platform for real estate investment management with separate interfaces for clients and administrators.

## 🚀 Features

### 🎨 Design & UX
- **Modern SaaS Design**: Clean, professional interface with gradient backgrounds and smooth animations
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Interactive Elements**: Framer Motion animations and hover effects
- **AI Chatbot**: Floating assistant for instant support
- **Accessibility**: WCAG-compliant design patterns

### 👥 User Roles

#### Client (Investor/Buyer/Overseas Client)
- **Dashboard**: Overview cards with investment progress, payments, and project updates
- **Payments**: Make installment payments with Stripe integration (mock)
- **Ledger**: Auto-updated transaction history with PDF/Excel export
- **Project Updates**: Milestone tracker with photo galleries and announcements

#### Admin (Developer/Sales Team)
- **Dashboard**: KPIs including leads, payments, active clients, and revenue metrics
- **Lead Management**: AI-sorted leads (Hot/Warm/Cold/Dead) with search, filter, and sorting
- **Customer Management**: Client profiles with complete investment history
- **Payments & Ledger**: Real-time transaction monitoring with export capabilities
- **Analytics**: Interactive charts and engagement metrics

### 🔧 Technical Features
- **React 18**: Modern functional components with hooks
- **TypeScript**: Full type safety and better development experience
- **Tailwind CSS**: Utility-first styling with custom design system
- **React Router v6**: Modern routing with nested layouts
- **Framer Motion**: Smooth animations and transitions
- **shadcn/ui**: High-quality, accessible UI components
- **Mock APIs**: Complete data layer for development and testing

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui, Radix UI primitives
- **Icons**: Heroicons
- **Build Tool**: Vite
- **Package Manager**: npm

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Button, Card, etc.)
│   ├── layout/          # Layout components (Sidebar, Navbar)
│   └── ui/Chatbot.tsx   # AI Assistant chatbot
├── pages/               # Page components
│   ├── Landing/         # Public landing page
│   ├── Auth/           # Authentication pages
│   ├── Client/         # Client dashboard pages
│   └── Admin/          # Admin dashboard pages
├── layouts/            # Layout wrappers
├── routes/             # Routing configuration
├── services/           # API services and mock data
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── data/               # Mock data and constants
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd realassist-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Key Pages

### Public Pages
- **Landing Page** (`/`) - Hero section, features, testimonials, and CTA
- **Authentication** (`/login`, `/register`, `/forgot-password`) - User authentication flows

### Client Pages
- **Dashboard** (`/client/dashboard`) - Investment overview and quick actions
- **Payments** (`/client/payments`) - Payment history and installment management
- **Ledger** (`/client/ledger`) - Transaction history with export functionality
- **Project Updates** (`/client/updates`) - Construction progress and milestones

### Admin Pages
- **Dashboard** (`/admin/dashboard`) - Business metrics and KPIs
- **Lead Management** (`/admin/leads`) - AI-powered lead scoring and management
- **Customer Management** (`/admin/customers`) - Client relationship management
- **Payments** (`/admin/payments`) - Payment monitoring and reporting
- **Analytics** (`/admin/analytics`) - Business intelligence and insights

## 🎨 Design System

### Colors
- **Primary**: Purple to Blue gradient (`from-purple-600 to-blue-600`)
- **Success**: Green variants for positive states
- **Warning**: Yellow variants for pending states
- **Error**: Red variants for critical states
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Headings**: Bold, modern font weights
- **Body**: Clean, readable text with proper contrast
- **Gradient Text**: Eye-catching gradient text for branding

### Components
- **Cards**: Elevated cards with subtle shadows
- **Buttons**: Gradient primary buttons with hover effects
- **Forms**: Clean input fields with focus states
- **Tables**: Responsive tables with hover effects
- **Modals**: Smooth modal dialogs with backdrop blur

## 🤖 AI Chatbot

The floating AI assistant provides:
- **Real-time Support**: Instant answers to user questions
- **Context Awareness**: Understands user's current page and role
- **Smooth Animations**: Framer Motion powered interactions
- **Responsive Design**: Adapts to different screen sizes

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for tablet screens
- **Desktop Enhancement**: Rich desktop experience with sidebars and expanded views
- **Touch Friendly**: Large touch targets and gesture support

## 🔒 Security Features

- **Role-based Access**: Separate interfaces for clients and admins
- **Input Validation**: Form validation and sanitization
- **Secure Routing**: Protected routes with proper authentication checks
- **CSRF Protection**: Built-in protection against cross-site attacks

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
The project is configured for easy deployment to modern hosting platforms:

1. Connect your repository to Vercel/Netlify
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@realassist.com
- Documentation: [Link to documentation]
- Issues: [GitHub Issues](link-to-issues)

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
