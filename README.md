# TravelTrouve 🌍

A modern travel photo sharing application built with Next.js, Firebase, and a beautiful glass morphism UI design.

## ✨ Features

### 🔐 Authentication

- Secure user authentication with Firebase Auth
- Email/password and social login support
- Protected routes and user sessions

### 👥 Group Management

- Create and manage travel groups
- Public and private group options
- Unique group codes for easy sharing
- Admin controls and member management
- Real-time group updates

### 📸 Photo Sharing

- Upload and share travel photos
- Beautiful photo gallery with grid and list views
- Photo reactions and comments
- Location tagging with maps integration
- Tag-based organization

### 🎨 Modern UI/UX

- Glass morphism design with dark theme
- Responsive mobile-first design
- Smooth animations with Framer Motion
- Auto-hiding navigation on scroll
- Beautiful loading states and transitions

### ⚙️ Profile Management

- Comprehensive profile settings page
- Editable user information
- Account management and deletion
- Privacy controls

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Glass morphism design
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Animations**: Framer Motion
- **UI Components**: Radix UI, shadcn/ui
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Firebase project with Firestore and Authentication enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/traveltrouve-app.git
   cd traveltrouve-app
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up Firebase**

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Storage
   - Copy your Firebase config

4. **Environment Variables**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Set up Firestore Security Rules**

   ```javascript
   // Copy the rules from firestore.rules file
   ```

6. **Run the development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Application Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Main dashboard
│   ├── groups/           # Group management
│   ├── profile/          # User profile
│   ├── login/            # Authentication
│   └── signup/           # User registration
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── groups/           # Group-related components
│   ├── auth/             # Authentication components
│   └── layout/           # Layout components
├── lib/                  # Utility functions
│   ├── firebase.ts       # Firebase configuration
│   ├── auth-utils.ts     # Authentication utilities
│   └── group-utils.ts    # Group management utilities
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
└── context/              # React context providers
```

## 🎨 Design System

The app uses a consistent glass morphism design with:

- **Dark theme**: Primary background colors and glass effects
- **Typography**: Clean, modern fonts with proper hierarchy
- **Components**: Consistent button styles, cards, and form elements
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first design that works on all devices

## 🔧 Key Features Implementation

### Glass Morphism Theme

- Consistent use of `backdrop-blur` and `bg-opacity` for glass effects
- Dark color palette with subtle transparency
- Smooth transitions and hover effects

### Real-time Updates

- Firebase Firestore real-time listeners
- Optimistic UI updates
- Error handling and retry mechanisms

### Photo Management

- Image upload with compression
- Cloud storage integration
- Lazy loading and optimization

### Group Collaboration

- Real-time member management
- Permission-based access control
- Group activity feeds

## 📄 Scripts

- `dev` - Start development server
- `build` - Build for production
- `start` - Start production server
- `lint` - Run ESLint
- `type-check` - Run TypeScript compiler

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Radix UI](https://www.radix-ui.com/) for accessible components

## 📞 Support

If you have any questions or need help with setup, please open an issue or contact [your-email@example.com](mailto:your-email@example.com).

---

Made with ❤️ by [Your Name](https://github.com/yourusername)
