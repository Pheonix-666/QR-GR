# QR-GR: Google Review QR Generator & Server System

The project is divided cleanly into **two separate folders**:

```
QR-GR/
├── server/          # Folder 1: The Review Server & Database
└── qr-generator/    # Folder 2: The QR & Link Creator Tool
```

---

## 📁 1. `server/` (The Review Server)

This folder contains the backend server, SQLite database, and mobile customer review screen.

- **Predefined Categories & Review Datasets**: Pre-loaded with authentic 5-star positive review templates for Hotels, Restaurants, Cafes, Salons, Healthcare, Services (including Design Houses), Retail, and Lodges.
- **Recency-Avoidance Randomizer**: When a customer scans a QR code, the server randomly picks an authentic review from that business's category and ensures consecutive customers do not get the same text.
- **Customer Mobile Screen (`/review/:id`)**:
  - Displays the business name, 5 stars, and the prefilled review.
  - **1-Tap Action ("Copy Text & Open Google Review")**: Copies the review text to the customer's phone clipboard and immediately opens the business's Google Review link so they can simply paste and submit.
  - **Shuffle Button**: Lets customers cycle through other review templates with one tap.

---

## 📁 2. `qr-generator/` (The QR & Link Creator)

This folder contains the creator tool where you input your review link and generate the QR code.

- **Input**:
  1. **Google Review URL**: Paste your Google review or search link (e.g., your Tarphe Design House link).
  2. **Business Name**: Friendly name for the business.
  3. **Category Dropdown**: Pick from predefined categories loaded directly from the server.
- **Output & Link Creation**:
  - Calls the server to register the link.
  - Generates the high-resolution QR code linked directly to the server scan URL (`http://localhost:3000/review/:id`).
  - **Download PNG** button.
  - **Print QR** button.
  - **Copy Link** button.
  - **Test Customer Scan** button to preview what customers will see when scanning.
  - Table of all active generated QR codes.

---

## 🚀 How to Run

1. **Start the Server**:
   ```powershell
   npm start
   ```
   *(Or `cd server && node server.js`)*

2. **Open the QR & Link Creator**:
   - Web browser: [http://localhost:3000](http://localhost:3000)
   - Or open `qr-generator/index.html` directly in any browser.

3. **Customer Scan URL**:
   - `http://localhost:3000/review/:businessId`
   - e.g., [http://localhost:3000/review/tarphe-design-house-a8uur](http://localhost:3000/review/tarphe-design-house-a8uur)
