# Rewards App Frontend

A premium "Neo-Bank" style frontend for the Rewards App, built with Angular 16 and TailwindCSS.

## Prerequisites
- Node.js v18+
- Angular CLI v16 (`npm install -g @angular/cli@16`)

## Setup & Run

1. **Navigate to the directory**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm start
   ```
   This will run `ng serve` and proxy `/api` requests to your backend at `http://localhost:8088`.

4. **Open Browser**:
   Navigate to `http://localhost:4200`.

## Architecture
- **Tech Stack**: Angular 16, TailwindCSS, RxJS.
- **Design**: Dark mode, Glassmorphism, "Eye Candy" aesthetics.
- **State**: RxJS Observables + SessionStorage for JWT.

## Features
- **Auth**: JWT Login with visual split-screen design.
- **Dashboard**: Modern overview with CSS-only 3D Credit Card.
- **Transactions**: List view integrated with backend API.

## API Integration
The app is configured to look for the backend at port 8088. Ensure your Spring Boot app is running on this port.
