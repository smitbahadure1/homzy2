# Homzy - Vacation Rental & Homestay App 🏡✨

Homzy is a comprehensive, functional vacation rental and homestay mobile application built using React Native and Expo. It provides a platform where users can explore unique accommodations, save their favorites, book stays, and manage their profiles. Additionally, it features an Admin Dashboard for application management.

## 🌟 Key Features

### 👤 User Features

- **User Authentication:** Fully integrated with [Clerk](https://clerk.com/) for secure and seamless authentication (Login/Signup).
- **Home & Explore:** Browse a diverse list of vacation rentals, cabins, and unique homestays, with discovery features and a robust search mechanism to find exactly what you're looking for.
- **Favorites Management:** Users can bookmark properties they like into a "Favorites" tab for quick and easy access later.
- **Property Bookings & Calendar:** Integrated calendar functionality (using `react-native-calendars`) to seamlessly book property stays and select dates.
- **Detailed Property View:** Rich detail pages for individual listings showing specifications, pricing, amenities, and user reviews.
- **User Profile Management:** Dedicated section to manage account details and personal preferences.
- **In-App Notifications:** An in-app notification center that keeps users updated about their bookings, alerts, and other important events.

### 🛡️ Admin Features

- **Admin Dashboard:** A dedicated and secure administrative panel providing an overview of app usage, users, and overall data.
- **Listing Management:** Tools available directly from the app to manage property offerings.

## 🛠 Tech Stack

### Frontend & Core

- **[React Native](https://reactnative.dev/):** UI framework for building performant native apps.
- **[Expo](https://expo.dev/):** Framework and platform for universal React applications. The project uses File-based routing configured via Expo Router.
- **TypeScript:** Ensuring strict type-safe code throughout the project for better maintainability.

### Backend & Services

- **[Firebase](https://firebase.google.com/):** Scalable NoSQL real-time database (Firestore) powering all application data streams: Property listings, Bookings, Favorites, Reviews, and User metadata.
- **[Clerk for Expo](https://clerk.dev/):** Handling all identity and authentication operations safely across devices.

### UI / Navigation & Libraries

- **React Navigation:** Robust navigation structure featuring Stack and Bottom Tabs integration.
- **React Native Reanimated & Gesture Handler:** For 60fps animations and fluid touch interactions within the user interface.
- **React Native Calendars:** Used for visualizing the booking schedule explicitly and picking dates efficiently.
- **Expo Vector Icons / Google Fonts:** Custom cohesive typography and universal iconography styling.
- **AsyncStorage / SecureStore:** Managing local and secure persistence safely on-device.

## 📂 Project Structure

```bash
homzy2/
├── app/                  # Main Expo Router directory
│   ├── (tabs)/           # Application Main Tabs (Home, Explore, Favorites, Bookings, Profile)
│   ├── listing/          # Dynamic property listing detail pages [id].tsx
│   ├── admin.tsx         # Admin Dashboard Component
│   ├── login.tsx         # Authentication Screen
│   ├── notifications.tsx # Notification Center
│   └── _layout.tsx       # Root layout definition
├── components/           # Reusable UI components
├── context/              # Global React Application Contexts
├── services/             # Backend interactions (userService, realEstateService, bookingService, favoritesService, reviewService)
├── lib/                  # Utilities and configurations (Firebase initialization, Auth helper)
├── assets/               # Static assets (images, fonts)
└── package.json          # Dependency configuration manifest
```

## 🚀 Getting Started

Follow these steps to get the app running locally on your machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI or Expo Go app on your physical device

### 1. Install Dependencies

```bash
# Install the project dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root of the project to set up your environment variables. The project requires Configuration for **Clerk** and **Firebase**.

```env
# Clerk Authentication Configuration
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### 3. Run the App

```bash
# Start the Expo development server
npx expo start
```

From the terminal, you can:

- Press `a` to run on Android Emulator.
- Press `i` to run on iOS Simulator (Requires Mac & Xcode).
- Scan the QR code using the **Expo Go** app on your physical smartphone.

## 📜 Scripts

- `npm start`: Standard command to start the Expo router.
- `npm run android`: Custom build sequence for Android environment.
- `npm run ios`: Custom build sequence for iOS environment.
- `npm run web`: Start development server on Web Browser.
- `npm run lint`: Run ESLint to review the codebase for standards.

## 🤝 Contribution

Contributions, issues, and feature requests are welcome!

---

_Built with ❤️ utilizing Expo & React Native._
