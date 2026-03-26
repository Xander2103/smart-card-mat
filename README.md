# 🃏 Smart Card Mat – Interactive Card Game System

A real-time interactive card game system combining hardware and software.

This project uses an ESP32 with NFC readers to detect physical playing cards on a custom mat and sends events via Bluetooth (BLE) to a web application built in React.

---

## 🚀 Overview

The Smart Card Mat allows players to play card games using real physical cards while a web application tracks the game in real time.

The system works across multiple devices such as desktop, tablet, and mobile (iPad, smartphone), allowing players to follow the game state live on screen.

Features include:
- Real-time card detection using NFC
- Physical gameplay with real cards
- Cross-device web application (PC, tablet, mobile)
- Bluetooth communication between hardware and app
- Automated game logic and scoring
- Visual feedback via LED strips

## 🛠️ Technologies

### Hardware
- ESP32
- NFC readers 
- External antennas
- WS2812 LED strips

### Software
- React (Vite)
- JavaScript (modular state architecture)
- Web Bluetooth API
- Embedded C++ (Arduino / ESP32)

---

## ⚙️ How It Works

1. A card is placed on the mat
2. NFC reader detects the UID
3. ESP32 maps UID → card
4. Event is sent via BLE:
