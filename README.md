# Dynamic Context-Aware NFC Web System (MERN)

A complete full-stack web application implementing dynamic context-aware functionality on **immutable physical NFC tags** with **Role-Based Access Control (Admin & Normal User)** and a **Dynamic Context Form Engine**.

---

## 1. Core Architectural Principle

```
[ Physical NFC Tag ] ── Contains Permanent URL ──> https://ourdomain.com/tag/TAG001
                                                                    │
                                                                    ▼
                                                            [ React Frontend ]
                                                                    │
                                                     GET /api/tags/TAG001/state
                                                                    │
                                                                    ▼
                                                        [ Express Context Engine ]
                                                                    │
                                           ┌────────────────────────┴────────────────────────┐
                                           ▼                                                 ▼
                             [ ACTIVE & Valid Duration ]                        [ EXPIRED or Default ]
                                           │                                                 │
                                           ▼                                                 ▼
                               Fetch Function Data from DB                         Fetch Dynamic Tag Schema
                             (Vehicle / Medical / Emergency)                     (Admin-Configured Fields)
                                                                                             │
                                                                                             ▼
                                                                                   Dynamic Form Rendered
                                                                                 (Location, Dropdowns, Custom)
```

* **Physical Tag is Never Rewritten:** The tag stores a permanent URL (e.g. `http://<your-ip>:5173/tag/TAG001`).
* **Admin Configures Dynamic Schema:** Administrators can define custom context fields per tag (Location, Dropdowns, Text, Numbers, DateTime), dropdown options, allowed functions, and access levels in MongoDB.
* **No Hard-coded Forms on Frontend:** When a normal user selects a tag or a visitor taps the tag, the form is generated **dynamically** from the backend schema with zero frontend code changes.
* **Normal User Experience:** Normal users manage their profile, upload and edit domain records (Vehicle, Medical, Emergency, Contact, Personal), and activate temporary context on their tags. Normal users **cannot** see the admin configuration interface.
* **Authoritative Lazy Expiration:** State transitions from active to expired on-demand when requested. No background cron job required.

---

## 2. User Roles & Demo Credentials

| Role | Email | Password | Person ID | Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `password123` | `ADMIN001` | Dynamic Field Builder, Tag fleet management, User role management |
| **Normal User / Owner** | `owner@example.com` | `password123` | `USER001` | My NFC Tags, Dynamic Context activation, Profile & Document record editing |
| **Authorized Responder**| `user@example.com` | `password123` | `USER002` | Authenticated visitor viewing authorized-level context |

*(1-click demo login buttons are available on `/login` for all roles).*

---

## 3. Quick Start & Setup

### Prerequisites
* **Node.js** v18+ (tested on Node v22)
* **MongoDB** (A live MongoDB Atlas cluster connection is already configured in `server/.env`)

### Step 1: Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### Step 2: Seed the Database
Populate demo users, tags with dynamic schemas, and functional records:
```bash
cd server
npm run seed
```

---

## 4. Running the Application

### Start the Backend (Terminal 1)
```bash
cd server
npm run dev
```
*Backend runs on: `http://localhost:5001`*

### Start the Frontend (Terminal 2)
```bash
cd client
npm run dev
```
*Frontend runs on: `http://localhost:5173` (also accessible via LAN IP for mobile NFC testing)*

---

## 5. End-to-End Walkthrough

### Scenario A: Admin Configures What the Tag Needs
1. Log in as **Administrator** (`admin@example.com` / `password123`).
2. Go to **Admin Portal** (`/admin`).
3. Select **TAG001**.
4. Use the **Context Field Builder**:
   * Add a new field: Name `vehicleType`, Label `Vehicle Category`, Type `Dropdown`.
   * Add options: `Electric Sedan`, `Commercial Van`, `Heavy Truck`.
   * Click **Save Configuration**.
5. The configuration is now stored in MongoDB.

### Scenario B: Normal User / Visitor Provides Current Context
1. Log in as **Normal User** (`owner@example.com` / `password123`) or visit `/tag/TAG001`.
2. Notice the form **automatically includes the new `Vehicle Category` dropdown** without any frontend code changes!
3. Detect or enter current location, select options, select duration (e.g. 1 minute), and click **ACTIVATE CONTEXT**.

### Scenario C: Public Tag Tap (Authoritative State)
1. Tap or visit the immutable URL: `http://localhost:5173/tag/TAG001`.
2. The page loads the active state and displays the relevant information (e.g. Vehicle details) along with the live countdown timer.
3. Once the duration expires, the tag immediately resets to the dynamic context form.

### Scenario D: Managing Information Documents
1. In the Normal User Dashboard (`/dashboard`), navigate to the **Information & Documents** tab.
2. Select your tag and update Vehicle, Medical, Emergency, Contact, or Personal records.
3. Click **Save Document to MongoDB**.

---

## 6. API Reference

### Authentication & Users
* `POST /api/auth/register` — Register a normal user
* `POST /api/auth/login` — Sign in and get JWT token
* `GET /api/auth/me` — Current user profile *(Protected)*
* `GET /api/user/profile` — User profile & owned tags *(Protected)*
* `PUT /api/user/profile` — Update personal profile details *(Protected)*
* `GET /api/user/documents/:tagId` — Fetch functional records for tag *(Protected)*
* `PUT /api/user/documents/:tagId/:function` — Save/update functional records *(Protected)*

### Admin Management
* `GET /api/admin/tags` — Overview of all system tags *(Admin only)*
* `POST /api/admin/tags` — Register a new tag *(Admin only)*
* `PUT /api/admin/tags/:tagId/config` — Update dynamic context schema *(Admin only)*
* `GET /api/admin/users` — List all registered users *(Admin only)*
* `PUT /api/admin/users/:userId/role` — Update user role *(Admin only)*

### Tag & Context Engine
* `GET /api/tags/:tagId/state` — Authoritative dynamic state check (Public)
* `GET /api/tags/:tagId/config` — Dynamic schema definition for rendering form (Public)
* `POST /api/tags/:tagId/activate` — Submit dynamic context & activate temporary state
* `POST /api/tags/:tagId/deactivate` — Reset tag state manually
* `GET /api/tags/:tagId/data/:function` — Retrieve functional data (Vehicle, Medical, Emergency, Contact, Personal)
