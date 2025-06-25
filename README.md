# TravelTrouve 🌍

A modern travel group photo sharing application built with Next.js, Firebase, and TypeScript. Create travel groups, share memories, and collaborate with your travel companions in a beautiful, responsive interface.

## ✨ Features

### 🔐 Authentication

- **Email/Password Authentication** - Secure user registration and login
- **Google OAuth Integration** - Quick sign-in with Google accounts
- **Protected Routes** - Automatic redirection for unauthenticated users
- **User Profile Management** - Automatic profile creation and updates

### 👥 Group Management

- **Create Travel Groups** - Set up groups for your trips with custom names and descriptions
- **Join Groups via Code** - Easy group joining using 6-character codes
- **Role-based Access** - Admin and Member roles with different permissions
- **Group Statistics** - View member count, photo count, and creation dates
- **Member Management** - Invite, view, and remove group members (Admin only)

### 📸 Photo Sharing & Management

- **Smart Photo Upload** - Drag & drop or click to upload with real-time preview
- **Image Compression** - Automatic compression with size optimization
- **File Type Validation** - Support for JPEG, PNG, WebP with size limits
- **Metadata Support** - Add descriptions, locations, and tags to photos
- **User Attribution** - Display uploader's name and avatar with each photo
- **Search & Filter** - Search photos by description, location, tags, or uploader name
- **Grid/List Views** - Toggle between grid and list display modes

### 💖 Social Features

- **Like System** - Like/unlike photos with real-time count updates
- **Comment System** - Add, view, and manage comments on photos
- **Interactive Comments Modal** - Dedicated modal for viewing and adding comments
- **User Avatars** - Automatic avatar generation using user initials

### 📱 Download Features

- **Flexible Downloads** - Download photos in original or compressed quality
- **Proper File Naming** - Maintains original file types and descriptive names
- **Batch Operations** - Individual photo download with progress feedback

### 🎨 User Interface

- **Modern Design** - Clean, gradient-based dark theme interface
- **Responsive Layout** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - Framer Motion animations for enhanced UX
- **Loading States** - Skeleton loaders and progress indicators
- **Toast Notifications** - Real-time feedback for user actions
- **Modal Dialogs** - Elegant modals for group creation, comments, and invitations

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Shadcn/ui** - Component library with Radix UI primitives

### Backend & Database

- **Firebase Authentication** - User management and authentication
- **Firestore** - NoSQL database for real-time data
- **Firebase Security Rules** - Database security and access control

### Development Tools

- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **pnpm** - Fast, efficient package manager

## 📁 Project Structure

```
traveltrouve-app/
├── app/                          # Next.js App Router pages
│   ├── dashboard/               # Dashboard page
│   ├── groups/[id]/            # Dynamic group pages
│   ├── hero/                   # Landing page
│   ├── login/                  # Authentication pages
│   ├── signup/
│   └── layout.tsx              # Root layout
├── components/                  # Reusable UI components
│   ├── auth/                   # Authentication components
│   ├── groups/                 # Group-related components
│   │   ├── modals/            # Group creation/join modals
│   │   └── sections/          # Group feed, members, settings
│   ├── layout/                # Layout components
│   └── ui/                    # Base UI components (shadcn/ui)
├── context/                    # React Context providers
│   └── auth-context.tsx       # Authentication state management
├── hooks/                      # Custom React hooks
├── lib/                        # Utility functions and configurations
│   ├── firebase.ts            # Firebase configuration
│   ├── auth-utils.ts          # Authentication utilities
│   ├── photo-utils.ts         # Photo management utilities
│   ├── group-utils.ts         # Group management utilities
│   ├── user-utils.ts          # User profile utilities
│   └── utils.ts               # General utilities
├── types/                      # TypeScript type definitions
│   ├── group.ts               # Group-related types
│   ├── photo.ts               # Photo and comment types
│   └── user.ts                # User-related types
├── public/                     # Static assets
└── styles/                     # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd traveltrouve-app
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up Firebase**

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Enable Firestore Database
   - Copy your Firebase configuration

4. **Environment Configuration**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Configure Firestore Security Rules**
   Copy the rules from `firestore.rules` to your Firebase project:

   ```bash
   # Install Firebase CLI if not already installed
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Deploy security rules
   firebase deploy --only firestore:rules
   ```

6. **Run the development server**

   ```bash
   pnpm dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

### Groups Collection (`/groups/{groupId}`)

```typescript
{
  id: string;
  name: string;
  description: string;
  code: string; // 6-character unique code
  adminIds: string[];
  memberIds: string[];
  memberCount: number;
  photoCount: number;
  recentPhotos: string[]; // Array of photo IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Photos Subcollection (`/groups/{groupId}/photos/{photoId}`)

```typescript
{
  id: string;
  url: string; // Base64 data URL
  imageData: string; // Base64 encoded image
  filename: string;
  originalName: string;
  fileSize: number;
  compressedSize: number;
  fileType: string;
  userId: string; // Photo uploader
  description: string;
  location: string;
  tags: string[];
  likes: string[]; // Array of user IDs
  likeCount: number;
  commentCount: number;
  createdAt: Timestamp;
  uploadDate: string; // YYYY-MM-DD
  month: number;
  year: number;
}
```

### Comments Subcollection (`/groups/{groupId}/photos/{photoId}/comments/{commentId}`)

```typescript
{
  id: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
}
```

### User Profiles Collection (`/userProfiles/{userId}`)

```typescript
{
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 🔒 Security Features

### Authentication

- Secure Firebase Authentication with email/password and Google OAuth
- Protected routes with automatic redirection
- User session persistence across browser sessions

### Database Security

- Firestore security rules ensuring users can only access their groups
- Role-based permissions for group management
- Secure photo upload and retrieval

### Data Validation

- Client-side file type and size validation
- Server-side data validation through Firestore rules
- Input sanitization for user-generated content

## 🎯 Key Features Implementation

### Photo Upload System

- **Image Compression**: Automatic compression using HTML5 Canvas API
- **Progress Tracking**: Real-time upload progress with visual feedback
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **File Validation**: Type, size, and format validation before upload

### Real-time Updates

- **Live Photo Feed**: Automatic updates when new photos are uploaded
- **Like Synchronization**: Real-time like count updates across all users
- **Comment Threading**: Instant comment updates and display

### Performance Optimizations

- **Image Optimization**: Compressed storage with original quality preservation
- **Lazy Loading**: Efficient loading of photos and comments
- **Caching**: User profile caching for improved performance
- **Batch Operations**: Efficient batch fetching of user data

## 🚦 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database
firebase deploy --only firestore:rules  # Deploy Firestore rules
```

## 📱 Responsive Design

The application is fully responsive and optimized for:

- **Desktop**: Full-featured experience with sidebar navigation
- **Tablet**: Adapted layouts with touch-friendly interactions
- **Mobile**: Mobile-first design with optimized touch targets

## 🔄 State Management

### Authentication State

- Managed through React Context (`AuthContext`)
- Persistent across browser sessions
- Automatic user profile synchronization

### Photo State

- Local state management with React hooks
- Optimistic updates for better UX
- Error boundary protection

## 🎨 UI/UX Features

### Design System

- **Consistent Color Palette**: Dark theme with blue/purple gradients
- **Typography**: Clear hierarchy with proper contrast ratios
- **Spacing**: Consistent spacing using Tailwind's spacing scale
- **Components**: Reusable components built on shadcn/ui

### Accessibility

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: WCAG compliant color combinations
- **Focus Management**: Clear focus indicators

## 🔮 Future Enhancements

### Planned Features

- [ ] **Photo Editing**: Basic editing tools (crop, rotate, filters)
- [ ] **Trip Planning**: Itinerary management and planning tools
- [ ] **Offline Support**: Progressive Web App capabilities
- [ ] **Push Notifications**: Real-time notifications for group activities
- [ ] **Advanced Search**: Geographic and date-based search filters
- [ ] **Export Options**: Generate trip albums and photo books

### Technical Improvements

- [ ] **Image Storage**: Migrate to Firebase Storage for better performance
- [ ] **CDN Integration**: Global content delivery for faster loading
- [ ] **Advanced Caching**: Service worker implementation
- [ ] **Analytics**: User behavior tracking and insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Authentication and database by [Firebase](https://firebase.google.com/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

---

**TravelTrouve** - Share your travel memories, one photo at a time! 🌟
"# TravelTrouve2.0" 
