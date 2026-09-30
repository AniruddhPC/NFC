# Dynamic Context-Aware NFC Web System — Implementation Plan

## 1. Project Overview & Architectural Foundation
The **Dynamic Context-Aware NFC Web System** implements dynamic, time-sensitive and context-aware behavior from an **immutable NFC tag URL** (e.g., `https://ourdomain.com/tag/TAG001` or `http://localhost:5173/tag/TAG001`). 

### Core Architectural Principle
* **Immutable Physical Layer:** The physical NFC tag is programmed once and is **never rewritten**.
* **Authoritative Backend State Engine:** Every time a user taps or visits `/tag/:tagId`, the frontend makes a query to `GET /api/tags/:tagId/state`.
* **State Branching:**
  * **Default / Expired State (`configuration`):** The system displays the **Context Configuration** interface where an authenticated owner can set the active function, context parameters, access level, and temporary duration.
  * **Active State (`active`):** The system loads the designated function viewer (e.g., Vehicle Details, Medical Information, Emergency Info, Contact, Personal Info) after enforcing access control rules.
* **Separation of Concerns:** Tag documents only track state & context metadata. Actual information (Vehicle, Medical, Emergency, etc.) is isolated in separate database collections.

---

## 2. Requirements to be Fulfilled by You (User Prerequisites)

Before or during testing, please ensure the following:

1. **MongoDB Connection (`MONGO_URI`):**
   * **Option A (Local MongoDB):** If MongoDB Community Server is installed locally:
     `mongodb://127.0.0.1:27017/nfc_dynamic_system`
   * **Option B (MongoDB Atlas):** A free M0 cluster connection string:
     `mongodb+srv://<username>:<password>@cluster0.mongodb.net/nfc_dynamic_system?retryWrites=true&w=majority`
   * *Note:* You will put this inside `server/.env` (we will provide `.env.example` and a default fallback to local MongoDB).

2. **Environment Variables Configuration:**
   * **Server (`server/.env`):**
     * `PORT=5000`
     * `MONGO_URI=mongodb://127.0.0.1:27017/nfc_dynamic_system`
     * `JWT_SECRET=supersecret_jwt_key_nfc_system_2026`
     * `CLIENT_URL=http://localhost:5173`
   * **Client (`client/.env`):**
     * `VITE_API_BASE_URL=http://localhost:5000/api`

3. **For Physical NFC Phone Tap Testing (Optional / Demo):**
   * If testing from a smartphone NFC tap:
     * Your phone and computer should be on the same Wi-Fi network.
     * Use your computer's local IP address (e.g. `http://192.168.1.50:5173/tag/TAG001`) or a local tunnel (ngrok / Cloudflare tunnel).
     * Program the tag using the free mobile app **NFC Tools** as an NDEF URL record.
   * Direct testing can also be performed seamlessly on desktop and mobile browsers via the URL bar or device emulation.

---

## 3. Technology Stack

* **Frontend:**
  * React 18 / Vite
  * Tailwind CSS (modern, mobile-responsive UI with animations & feedback)
  * React Router v6
  * Axios (centralized client with JWT request/response interceptors)
  * Lucide React (clean visual icons for vehicle, health, emergency, clock, location, etc.)
* **Backend:**
  * Node.js & Express.js
  * MongoDB & Mongoose
  * JWT (`jsonwebtoken`) & `bcryptjs`
  * CORS, Dotenv
* **Database Collections:**
  * `User` (owners / authorized users)
  * `Tag` (tagId, name, permanentUrl, ownerId, activeState with location, duration, expiresAt, accessLevel)
  * `Vehicle` (registrationNumber, model, owner, insuranceStatus, registrationStatus, vin, notes)
  * `MedicalInformation` (bloodGroup, allergies, emergencyContact, chronicConditions, medications)
  * `EmergencyInformation` (primaryContact, emergencyServicesNotes, evacuationPoint, instructions)
  * `ContactInformation` (fullName, organization, email, phone, address, website)
  * `PersonalInformation` (fullName, bio, identityReference, socialLinks, emergencyNotes)

---

## 4. Detailed Component & System Architecture

```
[ Physical NFC Tag ] ── Tap (Browser URL) ──> [ React Frontend: /tag/:tagId ]
                                                          │
                                         1. GET /api/tags/:tagId/state
                                                          │
                                                          ▼
                                            [ Express Backend API ]
                                                          │
                                               [ Context Engine ]
                                                          │
                             ┌────────────────────────────┴──────────────────────────┐
                             ▼                                                       ▼
                [ Active & currentTime < expiresAt ]                  [ Expired or Inactive ]
                             │                                                       │
                             ▼                                                       ▼
                Status: "active"                                        Status: "configuration"
                Access control validation                               Render Context Config UI:
                Fetch Function Data (Vehicle/Medical/...)                - Function Selection
                Render Function View + Live Expiry Timer                - GPS / Manual Location
                                                                        - Duration (30s, 1m, 5m, etc.)
                                                                        - Access Level
                                                                        - Activate Button
```

---

## 5. Phased Implementation Roadmap

### Phase 1: Project Scaffolding & Setup
* Create clean folder structure: `client/` and `server/`.
* Initialize `server/package.json` with dependencies (`express`, `mongoose`, `dotenv`, `cors`, `jsonwebtoken`, `bcryptjs`).
* Initialize `client/` with Vite React, Tailwind CSS, `axios`, `react-router-dom`, `lucide-react`.
* Set up configuration files (`.env.example`, `tailwind.config.js`, `postcss.config.js`, `.gitignore`).

### Phase 2: MongoDB Models & Database Connection
* Implement `server/src/config/db.js` with auto-reconnect handling.
* Implement Schemas:
  * `User.js` (name, email, password hashed with bcrypt, role).
  * `Tag.js` (tagId unique, name, permanentUrl, ownerId, defaultFunction, activeState with nested context schema).
  * Functional Schemas: `Vehicle.js`, `MedicalInformation.js`, `EmergencyInformation.js`, `ContactInformation.js`, `PersonalInformation.js` with `tagId` references.

### Phase 3: Context Engine & Business Logic
* Implement `server/src/services/contextEngine.js`:
  * Evaluates authoritative state dynamically upon every read.
  * Formula: if `activeState` exists and `new Date() < new Date(activeState.expiresAt)` -> `active`, else -> `configuration`.
  * Context validation (GPS lat/lng boundary checks, duration validation, supported intent checks).
  * Access level resolution (`public`, `authorized`, `owner_only`).

### Phase 4: Express API Routes & Controllers
* **Authentication Controller & Routes (`/api/auth`):**
  * `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
* **Tag Controller & Routes (`/api/tags`):**
  * `GET /api/tags` (owner's tags for dashboard).
  * `GET /api/tags/:tagId` (tag details).
  * `GET /api/tags/:tagId/state` (authoritative state evaluator - public/unauthenticated access supported).
  * `POST /api/tags/:tagId/activate` (owner protected context activation).
  * `POST /api/tags/:tagId/deactivate` (manual deactivation).
  * `GET /api/tags/:tagId/data/:function` (secure data retrieval with access control).
* **Database Seeder (`server/src/utils/seed.js`):**
  * Script creating demo owner (`owner@example.com` / `password123`), authorized user (`user@example.com` / `password123`), tags `TAG001` & `TAG002`, and rich sample data for Vehicle, Medical, Emergency, Contact, and Personal info.

### Phase 5: Client API Client, Context & Location Services
* `src/api/axios.js`: Axios instance with token injection and 401 handling.
* `src/api/authApi.js` & `src/api/tagApi.js`.
* `src/context/AuthContext.jsx`: Owner authentication state, login, logout, token persistence.
* `src/hooks/useLocation.js`: Browser Geolocation API integration with automatic coordinates, permission state handling, error reporting, and manual coordinate override.

### Phase 6: Frontend UI Components & Pages
* **Components:**
  * `Navbar.jsx`: Brand, active user status, navigation, logout.
  * `CountdownTimer.jsx`: Live countdown showing remaining active seconds/minutes, auto-triggering state refresh when time reaches zero.
  * `ContextForm.jsx`: Dynamic configuration form with function dropdown, location picker (GPS/manual), access level selector, duration selector.
  * `DurationSelector.jsx`: Quick duration pills (30s, 1m, 5m, 10m, 30m, custom).
  * `StatusBadge.jsx`, `LoadingSpinner.jsx`, `ErrorMessage.jsx`.
* **Functional Viewers:**
  * `VehicleViewer.jsx`: Registration number, vehicle model, owner, insurance status, registration status, VIN, last service date.
  * `MedicalViewer.jsx`: Blood group, severe allergies, emergency contact, medications.
  * `EmergencyViewer.jsx`: High-visibility emergency protocols, contact cards, direct call buttons.
  * `ContactViewer.jsx`: Professional contact card with vCard / copy details.
  * `PersonalViewer.jsx`: Personal identity profile and bio.
* **Pages:**
  * `TagPage.jsx`: The primary routing hub for `/tag/:tagId`. Fetches backend state and cleanly delegates to either `ConfigureTag` or the matching functional viewer.
  * `Dashboard.jsx`: Authenticated overview of registered tags, active functions, remaining duration, quick activation/deactivation triggers.
  * `Login.jsx`: Clean, responsive owner authentication page.

### Phase 7: Verification & Testing
* Run backend seed script and verify MongoDB collections.
* Verify REST endpoints via API test calls.
* Verify full dynamic cycle:
  1. First visit `/tag/TAG001` -> Shows Context Configuration.
  2. Configure: Vehicle Details + 1 minute duration + GPS coordinates + Public access -> Activate.
  3. Second visit `/tag/TAG001` -> Displays Vehicle Details with 1-minute countdown.
  4. Wait 60 seconds (or manual deactivate) -> Refresh -> Back to Context Configuration.
* Verify Access Control (`owner_only`, `authorized`, `public`).
* Create complete README.md with step-by-step instructions.

---

## 6. Approval Request
Please review this plan. Once approved, I will begin implementing the project according to these specifications.
