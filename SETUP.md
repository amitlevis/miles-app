# Miles App — Setup Guide

## Prerequisites

Install these tools first:

1. **Node.js** — https://nodejs.org (download LTS version)
2. **Expo Go** app on your phone (App Store / Google Play) — for testing without a Mac/Xcode

## Getting Started

Open a terminal in this folder and run:

```bash
npm install
npx expo start
```

A QR code will appear. Scan it with:
- **iOS**: Camera app
- **Android**: Expo Go app

The app will load on your phone instantly.

## Project Structure

```
Miles/
├── App.tsx                          ← Entry point
├── src/
│   ├── constants/
│   │   ├── colors.ts                ← Design system colors
│   │   └── typography.ts            ← Fonts & sizes
│   ├── store/
│   │   └── coupleStore.ts           ← Global state (Zustand)
│   ├── utils/
│   │   ├── distance.ts              ← Haversine distance calc
│   │   └── timeZone.ts              ← Time zone utilities
│   ├── components/
│   │   ├── ui/                      ← Button, Card, Avatar
│   │   ├── widgets/                 ← 4 widget components
│   │   └── PartnerHeader.tsx        ← Partner status bar
│   ├── navigation/
│   │   ├── AppNavigator.tsx         ← Root navigator
│   │   └── TabNavigator.tsx         ← Bottom tab bar
│   └── screens/
│       ├── auth/                    ← Welcome, Login, CoupleLink
│       ├── home/                    ← Main home screen
│       ├── together/                ← Watch, Listen, Games
│       ├── widgets/                 ← Widget configuration
│       ├── dates/                   ← Calendar, Date Planner
│       ├── memories/                ← Photos, Memory Jar
│       └── shop/                    ← Plans, Gifts
```

## Demo Mode

On the Welcome screen, tap **"Try Demo"** to instantly load the app with sample data (Amit & Haley, 5,681 miles apart).

## Key Features Built

| Feature | Location |
|---------|----------|
| Distance Meter Widget | Home screen + Widgets tab |
| Countdown / Together Mode Widget | Home screen + Dates tab |
| SnapPresence Photo Widget | Home screen |
| SketchPresence Drawing Widget | Home screen + Memories tab |
| Watch Together | Together → Watch Together |
| Listen Together | Together → Listen Together |
| 4 Couple Games | Together → Games |
| AI Date Planner | Dates → Date Planner |
| Memory Jar | Memories → Memory Jar |
| Couple's Journal | Memories tab |
| Heartbeat Share | Home screen |
| Emotion Pulse (mood sharing) | Home screen |
| Habit Streaks | Memories tab |
| Premium Plans | Shop tab |
| Virtual + Real Gift Shop | Shop tab |
| Widget theme picker | Widgets tab |
| Lock screen phone preview | Widgets tab |

## Next Steps (Backend)

To go from prototype → real app:

1. **Auth**: Firebase Auth or Supabase
2. **Couple linking**: Firestore collection linking two UIDs
3. **Real-time**: Firebase Realtime DB or WebSocket server for Watch Together sync
4. **Push notifications**: Firebase Cloud Messaging for mood shares, photo widgets
5. **Widget data**: iOS WidgetKit extension + Android App Widget provider reading from shared UserDefaults/SharedPreferences
6. **Payments**: RevenueCat SDK (handles both iOS + Android subscriptions)
7. **AI Date Planner**: Claude API (Anthropic) with prompt including couple's preferences
8. **Photo storage**: Cloudflare R2 or AWS S3

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Yellow | `#FFB830` | Primary brand, CTAs |
| Coral | `#FF7A5C` | Accent, heartbeat |
| Lavender | `#C9B8E8` | Night mode, Listen Together |
| Cream | `#FFFDF5` | App background |
| Charcoal | `#2C2C2C` | Text |
