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

## Security Best Practices

### API Key Protection

- **NEVER commit API keys or secrets to version control**
- Use environment variables via `.env.local` for all sensitive credentials
- The pre-commit hook will block commits containing API keys and other sensitive patterns
- If you receive a "Publicly accessible Google API key" warning, follow these steps:
  1. Immediately revoke and regenerate the compromised key in Google Cloud Console
  2. Apply API key restrictions in Google Cloud Console (HTTP referrers, API limitations)
  3. Ensure the key isn't in version control (check git history if needed)

### Environment Variables

- Copy `.env.template` to `.env.local` for local development
- Set up production environment variables in your deployment platform (Vercel)
- Use the `NEXT_PUBLIC_` prefix only for variables that are truly needed on the client side

### Access Controls

- Implement proper Firebase security rules to restrict database access
- Use the built-in role-based authentication system
- Regularly audit access patterns and user permissions

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

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Copy `.env.template` to `.env.local` 
3. Fill in your Firebase credentials in `.env.local`
4. **IMPORTANT: Never commit `.env.local` or any file containing API keys to version control**

The required environment variables are:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```
