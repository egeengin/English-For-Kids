# 🧱 Lego English Adventure (English for Kids)

> **Gamified, Voice-Interactive English Learning Platform for Early Readers**  
> *Tailored for 6–8 year-old bilingual children (English with German 🇩🇪 and Turkish 🇹🇷 audio and text helpers).*

[![Live Web App](https://img.shields.io/badge/Play_Live_Online-GitHub_Pages-brightgreen?logo=github)](https://egeengin.github.io/English-For-Kids/)
[![Gemini AI Powered](https://img.shields.io/badge/AI_Voice_Coach-Google_Gemini_2.5_Flash-blue?logo=google)](https://aistudio.google.com/)
[![Built for Early Readers](https://img.shields.io/badge/Pedagogy-Khan_Academy_Kids_%26_Duolingo_ABC-orange)](https://github.com/egeengin/English-For-Kids)

---

## 🌟 Live Demo

You can play **Lego English Adventure** directly in your browser on any computer, iPad, or tablet:
👉 **[https://egeengin.github.io/English-For-Kids/](https://egeengin.github.io/English-For-Kids/)**

---

## 🏆 Key Features Inspired by Educational Gurus

### 1. 🗺️ The "Lego Adventure Road" (Guided Quest Map)
*Inspired by **Khan Academy Kids** and **Duolingo ABC**.*
* 7-stage stepping-stone quest that eliminates decision fatigue for 7-year-olds:
  1. 🌈 **Rainbow Harbor**: Colors & Shapes
  2. 🔤 **Phonics Sound Lab**: Letter-Sound Blending
  3. 🦁 **Safari Sanctuary**: Animal Vocabulary & Spot 7 Differences
  4. 🏫 **Brick Academy**: Interactive School Story Dialogue
  5. 🎈 **Carnival Grounds**: Active Listening Balloon Pop Game
  6. 🏙️ **Lego City Town**: Creative Sticker Diorama Sandbox
  7. 🏆 **Master Builder Citadel**: 3D Lego Workshop & Graduation Diploma

### 2. 🧩 Phonics Letter-Brick Snapping (Phoneme Blending)
*Inspired by **Endless Alphabet** and **Duolingo ABC**.*
* Tapping 3D Lego letter bricks sounds out individual phonemes (*"/k/"*, *"/æ/"*, *"/t/"*).
* Snapping letters into the baseplate slots triggers the blend sound (*"C... A... T... CAT!"*), confetti, and awards Lego bricks!

### 3. 🎙️ Real-Time Voice Interaction & Speech Decoding
* **Built-in Phonetic Decoder (Zero-Config, Offline)**:
  Tolerant to 7-year-old German & Turkish pronunciation tendencies (*"gud morning"*, *"may nem is"*, *"ret"*, *"blu"*, *"ket"*).
* **Google Gemini AI Fallback (`gemini-2.5-flash`)**:
  When connected via Parent Hub, Gemini analyzes phonetic intent for ambiguous attempts and provides gentle bilingual guidance.

### 4. 📻 "Leo's Walkie-Talkie" (Open-Ended Gemini Voice Companion)
*Inspired by **Novakid** and **Speech Blubs**.*
* 2-way conversational walkie-talkie gadget where children can talk freely to their Lego friend Leo.
* Leo speaks back in short, joyful sentences (6–8 words) with Samantha's clear voice and German/Turkish subtitle helpers.

### 5. 🎶 Synchronized "Karaoke" Read-Along & Word Inspector
* As characters speak in stories, words light up in golden-yellow in exact audio sync.
* Tapping any individual word opens a popover showing native pronunciation and instant German & Turkish translations.

### 6. 🎨 "My Lego Town" Sticker Diorama
* Open-ended creative scene builder with 3 backdrops (Park 🌳, Schoolyard 🏫, Space 🚀).
* Children drag unlocked vocabulary stickers and tap them to hear words spoken aloud.
* **📸 SNAP PHOTO!**: Takes a snapshot with camera flash and saves it to the child's souvenir album.

### 7. 📜 Printable Refrigerator Diploma & Daily Streak
* **🔥 Daily Streak Tracker**: Encourages a 5-minute daily learning habit.
* **Official Certificate of Achievement**: Personalized with child's name, studs border, golden seal, date, and instructor signatures.
* **Print / Save PDF 🖨️**: Formatted for 1-click printing to hang proudly on the refrigerator!

---

## 👨‍👩‍👧 Parent Hub & Multi-Child White-Label Settings

* **Parent Protection**: Guarded by a math challenge (`3 + 4 = 7`).
* **Multi-Child Switcher**: Easily switch between child profiles (*"Deniz"*, *"Aylin"*, or add new students) with instant dynamic rebranding across all screens.
* **Gemini AI Settings**: Enter a free Google Gemini API key with live connection testing. Keys are stored strictly in the local browser (`localStorage`).
* **Custom Word Builder**: Parents can add custom family words with automatic pronunciation.

---

## 🛠️ Local Development & Setup

### Prerequisites
* Node.js (v18 or higher)
* npm

### Quick Start
```bash
# 1. Clone the repository
git clone https://github.com/egeengin/English-For-Kids.git
cd English-For-Kids

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
Open **`http://localhost:5173/`** in Google Chrome or Safari.

### Build for Production & GitHub Pages
```bash
npm run build
```
Builds to both `dist/` and `docs/` for seamless deployment.

---

## 📄 License
MIT License. Built with love for **Deniz** and early readers everywhere! 🧱
