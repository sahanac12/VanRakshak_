# Van Rakshak (Forest Protector)

Van Rakshak is a digital forest patrol tracking and incident management system designed to empower forest officers and community members in protecting forest resources.

## Project Structure

This is a monorepo containing the following components:

- **`/backend`**: Node.js + Express REST API. Handles authentication, data persistence (MongoDB), and business logic.
- **`/admin-panel`**: React (Vite) web dashboard for administrators to monitor patrols, manage users, and review incident reports.
- **`/community-web`**: React (Vite) interface for community members to report incidents and view public safety information.
- **`/mobile`**: React Native (Expo) mobile application for forest officers to log patrols, report incidents in real-time, and access maps.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Running locally or via Atlas)
- [Expo Go](https://expo.dev/client) app on your mobile device (for testing the mobile app)

### Installation & Setup

1. **Backend**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on the provided sample
   npm run dev
   ```

2. **Admin Panel**:
   ```bash
   cd admin-panel
   npm install
   npm run dev
   ```

3. **Community Web**:
   ```bash
   cd community-web
   npm install
   npm run dev
   ```

4. **Mobile**:
   ```bash
   cd mobile
   npm install
   npx expo start
   ```

## Key Features

- **Real-time Tracking**: GPS-based patrol tracking for forest officers.
- **Incident Reporting**: Quick reporting of illegal logging, poaching, or forest fires.
- **Data Visualization**: Heatmaps and analytics for incident trends in the admin dashboard.
- **Community Engagement**: Public reporting portal to crowdsource forest monitoring.
