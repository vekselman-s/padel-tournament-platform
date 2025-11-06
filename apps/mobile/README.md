# Padel Tournament Mobile App

Mobile application for the Padel Tournament Platform built with Expo and React Native.

## Features

- **Authentication**: Login and registration with token persistence
- **Tournaments**: Browse, search, and register for tournaments
- **Matches**: View and manage your matches
- **Match Reporting**: Report match results with photo proof
- **Bracket Viewing**: Interactive tournament brackets
- **Push Notifications**: Match reminders and tournament updates
- **Offline Support**: Report results offline with automatic sync
- **Deep Linking**: Support for deep links to specific screens

## Tech Stack

- **Expo SDK 52**: Mobile development framework
- **React Native 0.76**: Mobile UI framework
- **TypeScript**: Type safety
- **NativeWind**: Tailwind CSS for React Native
- **React Navigation 6**: Navigation library
- **React Query**: Server state management
- **Zustand**: Client state management
- **AsyncStorage**: Local data persistence
- **Expo Notifications**: Push notifications
- **Expo Image**: Optimized image handling
- **Expo Image Picker**: Camera and gallery access

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device (for development)

### Installation

1. Install dependencies:
```bash
cd apps/mobile
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update API URL in `.env`:
```
API_URL=http://YOUR_IP:3001/api
```

### Development

Start the development server:
```bash
npm start
```

Run on specific platform:
```bash
npm run android  # Android
npm run ios      # iOS
npm run web      # Web (experimental)
```

### Building for Production

#### Android

```bash
# Build APK
npm run build:android

# Build AAB (Play Store)
eas build --platform android --profile production
```

#### iOS

```bash
npm run build:ios
```

## Project Structure

```
apps/mobile/
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI components (Button, Input, Card, etc)
│   │   ├── tournaments/    # Tournament-specific components
│   │   ├── matches/        # Match-specific components
│   │   └── bracket/        # Bracket components
│   ├── screens/            # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── home/          # Home screen
│   │   ├── tournaments/   # Tournament screens
│   │   ├── matches/       # Match screens
│   │   └── profile/       # Profile screens
│   ├── navigation/         # Navigation configuration
│   ├── lib/               # Utilities and core logic
│   │   ├── api/          # API client and endpoints
│   │   ├── queries/      # React Query hooks
│   │   ├── store/        # Zustand stores
│   │   ├── utils.ts      # Utility functions
│   │   ├── constants.ts  # App constants
│   │   ├── storage.ts    # AsyncStorage wrapper
│   │   └── notifications.ts # Push notification setup
├── App.tsx                 # Root component
├── index.js               # Entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Key Features Implementation

### Authentication
- Token-based authentication with JWT
- Automatic token refresh
- Persistent login with AsyncStorage

### Navigation
- Bottom tab navigation for main sections
- Stack navigation within each tab
- Deep linking support for sharing

### State Management
- **React Query**: Server state with automatic caching
- **Zustand**: Client state (auth, UI)
- **AsyncStorage**: Persistent storage

### Offline Support
- Match results saved locally when offline
- Automatic sync when connection restored
- Visual indicators for pending sync

### Push Notifications
- Match reminders (1 hour before)
- Tournament updates
- Result notifications

### Photo Upload
- Camera integration for match results
- Gallery selection
- Image compression before upload

## Environment Variables

```bash
API_URL=http://localhost:3001/api  # Backend API URL
```

## Deep Linking

The app supports the following deep links:

- `padel://login` - Login screen
- `padel://tournaments` - Tournaments list
- `padel://tournaments/:id` - Tournament detail
- `padel://matches` - Matches list
- `padel://matches/:id` - Match detail

## Troubleshooting

### Cannot connect to API
- Ensure your device and computer are on the same network
- Use your computer's IP address in `.env`, not `localhost`
- Check that the backend API is running

### Images not loading
- Check network permissions
- Verify API URL is correct
- Check console for CORS errors

### Push notifications not working
- Ensure permissions are granted
- Test on a physical device (not simulator)
- Check Expo notification configuration

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run build:android` - Build Android app
- `npm run build:ios` - Build iOS app

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow NativeWind conventions for styling
4. Test on both iOS and Android
5. Ensure offline functionality works

## License

MIT
