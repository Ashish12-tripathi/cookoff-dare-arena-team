# OmiChef Cook-Off Dare Arena - Solo + Team

Mobile-first MERN viral cooking game for Shopify.

## Setup

### Backend
```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
```
Backend runs on http://localhost:3000

### Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Frontend runs on http://localhost:5175

## Features
- Solo Cook-Off mode
- Team Cook-Off mode, up to 6 teams
- Email/mobile contact validation
- Cloudinary direct upload with image compression
- WhatsApp share links
- Vote once per email/mobile per challenge
- Premium mobile-first UI
- IPL-style leaderboard
- Auto winner after 12 hours when page/API is loaded

## Important MongoDB Cleanup for Existing Project
If migrating from old version, delete old votes indexes:
- challengeId_1_voterEmail_1
- challengeId_1_voterName_1
- challengeId_1_browserId_1
- challengeId_1_voterIp_1

Keep only:
- _id_
- challengeId_1_voterContact_1
