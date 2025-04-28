# SwimFit App

Enhanced swim training app with QR-based attendance tracking, client management features, and secure Firebase authentication.

## Features

- **Client Management**: Add, view, and edit client profiles
- **QR Code System**: Generate unique QR codes for each client
- **Attendance Tracking**: Scan QR codes to log attendance
- **Session Management**: Schedule and manage swim training sessions
- **Firebase Integration**: Real-time database with secure authentication
- **User Authentication**: Secure login, signup, and profile management

## Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Deployment**: Vercel (recommended)

## Recent Enhancements

- **Package Limit Tracking**: Monitor client session usage with color-coded indicators
- **Usage Notifications**: Dashboard alerts for clients approaching or exceeding their package limits
- **Adjustable Limits**: Easily modify package limits for each client as needed
- **Attendance Integration**: Session attendance automatically updates package usage metrics

- Complete Firebase integration with Firestore database
- Secure authentication system with protected routes
- User profile management
- Improved QR scanner with automatic camera access
- Enhanced client identification with multi-strategy matching
- Smart session selection for attendance logging

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase account

### Setup

1. Clone the repository
2. Install dependencies with `npm install` or `yarn`
3. Copy `.env.local.example` to `.env.local` and fill in your Firebase credentials
4. Run the development server with `npm run dev` or `yarn dev`

### Firebase Configuration

You'll need to create a Firebase project and add the configuration to your `.env.local` file. The required variables are:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```
