# 🃏 Smart Card Mat

**Smart Card Mat** is an interactive card game system that combines physical playing cards with a digital scoring application.

The project connects a custom NFC/RFID card mat, an ESP32, Bluetooth Low Energy, LED feedback, a React frontend and a Laravel backend. The goal is to keep the feeling of playing with real cards while automating scoring, match history, player accounts and statistics.

---

## 🚀 What it does

Players use real cards on a physical mat. When a card is placed on a zone, the hardware detects it and sends the event to the web application. The app then updates the game state, validates turns and calculates scores.

The system supports local play, online accounts, friends, match history and player statistics.

---

## ✨ Features

### Frontend

- React + Vite web application
- Responsive layout for desktop, tablet and mobile
- Player selection system
- Support for account players, friends, guests and local profiles
- Match history
- Match detail modal
- Player statistics
- Reusable avatar and player identity components
- Local storage fallback for offline/local matches
- Bluetooth-ready architecture for hardware events
- QR-based friend sharing
- QR friend scanner with confirmation before sending a friend request

### Backend

- Laravel REST API
- User registration and login
- Token-based authentication with Laravel Sanctum
- Friend system
  - send friend requests
  - accept requests
  - reject requests
  - cancel outgoing requests
  - remove friends
- Online match saving
- Online match history
- Account-based statistics
- Password reset by email using Resend
- Password reset rate limiting: max 2 reset emails per user per day

### Hardware

- ESP32 controller
- NFC/RFID card detection
- Multiple mat zones
- Bluetooth Low Energy communication
- WS2812 LED feedback
- Physical prototype support

---

## 🎮 Game modes

### Dobbelkingen

Dobbelkingen is implemented with:

- player setup
- contract selection
- score calculation
- contract history
- winner detection
- match saving
- match detail overview
- statistics

The match detail screen shows contract rounds, chooser, score changes and final ranking.

### Kleurenwiezen

Kleurenwiezen is implemented with:

- contract setup
- declarant and partner selection
- trump selection
- dealer and starter logic
- trick tracking
- attack/defense trick calculation
- success/fail result
- score changes
- match saving
- statistics

---

## 🧠 How it works

Basic event flow:

```txt
Physical card
→ NFC/RFID reader
→ ESP32
→ Bluetooth Low Energy event
→ React application
→ Game state update
→ UI / scoring / LED feedback
```

Example hardware events:

```txt
P|zone|uid    Card placed
R|zone|uid    Card removed
T|zone        Turn zone update
```

The frontend can also be used without hardware during development by simulating card/game events.

---

## 👥 Player system

The app supports different player types:

### Account players

Registered users that are linked to online match history and statistics.

### Friends

Users can add each other as friends and select friends directly as players in a match.

The friend system supports:

- searching users by name or username
- sending friend requests
- accepting incoming requests
- rejecting incoming requests
- cancelling outgoing requests
- removing existing friends
- showing a personal friend QR code
- scanning another player's QR code
- confirming before sending a QR-based friend request

### Guests

Temporary players for one match. Guests appear in match history but do not count toward online account statistics.

### Local profiles

Profiles stored only on the current device. Useful for recurring local players without an online account.

---

## 📊 Match history and stats

Finished matches are saved locally and, when logged in, synced to the Laravel backend.

The History screen supports:

- local matches
- online matches
- synced matches
- failed sync states
- match detail view

The Stats screen shows account-based statistics such as:

- matches played
- wins
- win percentage
- game-specific results
- contract insights
- friend comparison

Guests and local profiles are intentionally excluded from online statistics.

---

## 🛠️ Tech stack

### Frontend

- React
- Vite
- JavaScript
- Web Bluetooth API
- LocalStorage

### Backend

- Laravel
- PHP 8+
- Laravel Sanctum
- SQLite for local development
- REST API
- Eloquent ORM

### Hardware

- ESP32
- NFC/RFID readers
- External antennas
- WS2812B LED strips
- Arduino / Embedded C++

---

## 📁 Project structure

```txt
SmartCardMat/
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── core/
│   │   │   ├── api/
│   │   │   ├── games/
│   │   │   ├── matches/
│   │   │   ├── state/
│   │   │   ├── stats/
│   │   │   └── storage/
│   │   ├── transport/
│   │   └── ui/
│   │       ├── auth/
│   │       ├── components/
│   │       ├── history/
│   │       ├── players/
│   │       ├── play/
│   │       └── screens/
│   └── package.json
│
├── Backend/
│   ├── app/
│   │   ├── Http/Controllers/
│   │   └── Models/
│   ├── database/
│   │   └── migrations/
│   ├── routes/
│   │   └── api.php
│   └── composer.json
```

---

## ⚙️ Running locally

### Backend

```bash
cd Backend
composer install
php artisan migrate
php artisan serve
```

The API runs on:

```txt
http://127.0.0.1:8000
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs through Vite.

---

## 🔌 API overview

### Authentication

```txt
POST /api/register
POST /api/login
POST /api/logout
GET  /api/me
POST /api/forgot-password
POST /api/reset-password
```

### Users

```txt
GET /api/users/search
```

### Friends

```txt
GET    /api/friends
POST   /api/friends
POST   /api/friends/{friendship}/accept
POST   /api/friends/{friendship}/reject
DELETE /api/friends/{friendship}
```

### Matches

```txt
GET  /api/matches
GET  /api/matches/{match}
POST /api/matches
```

---

## 🧪 Testing

The application can be tested in two ways:

1. **With hardware**  
   Cards are detected by the ESP32/NFC setup and sent to the frontend over BLE.

2. **Without hardware**  
   Game flow and match saving can be tested using simulation/dev tools inside the frontend.

API endpoints can be tested with Thunder Client, Postman.

---

## 📌 Current status

Implemented:

- React frontend
- Laravel backend
- login/register/logout
- friend system
- player selection
- local profiles
- guest players
- online match saving
- local match saving
- match history
- match details
- player statistics
- Dobbelkingen game mode
- Kleurenwiezen game mode
- reusable avatar/player identity UI
- hardware/BLE-ready architecture
- Password reset flow with email support

---

## 🔮 Future improvements

Possible next steps:

- profile picture upload
- email verification for new accounts
- change password while logged in
- QR-based friend sharing
- backend-generated official statistics endpoints
- public leaderboards
- more card games
- improved match filtering
- replay/timeline view for matches
- match export/share summary
- better hardware diagnostics screen
- BLE reconnect and connection recovery improvements
- improved physical enclosure
- PCB design for cleaner hardware
- improved antenna layout and detection reliability
- automated tests for API endpoints and game scoring logic
- production deployment

---

## 🧩 Note about the hardware code

The project includes hardware integration with ESP32, NFC/RFID readers, BLE communication and LED feedback.

Depending on the repository version, not all embedded C++ / Arduino code may be included directly in this repository. The physical prototype can be demonstrated separately.

---

## 👤 About this project

This project was built as a full-stack and hardware/software prototype. It demonstrates:

- React frontend development
- Laravel backend development
- REST API design
- authentication
- database modeling
- real-time game state handling
- hardware/software integration
- Bluetooth communication
- embedded systems
- UX/UI design
- product-oriented thinking

The goal is to turn traditional card games into an interactive physical-digital experience.
