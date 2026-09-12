# HavenMatch AI — SNS Workbench Workflow Architecture & Guide

**Brand**: Right Home. Right Lifestyle. Right Match.  
**Platform**: SNS Agent Workbench + MongoDB Atlas (`havenmatch`) + Gemini 2.5 Flash  

---

## 1. Quick Start: How to Run Everything

### Option A: One-Click Launcher (Recommended)
Double-click [`start-havenmatch.bat`](file:///C:/Users/balap/Downloads/havenmatch/start-havenmatch.bat) in the `havenmatch` folder. It will start:
1. **Backend Database API Server**: `http://localhost:5000` (Connected to MongoDB Atlas)
2. **Frontend Vite Application**: `http://localhost:5173`

---

## 2. SNS Workbench Workflow Pipeline Breakdown

The workflow file [`havenmatch_workbench_workflow.json`](file:///C:/Users/balap/Downloads/havenmatch/havenmatch_workbench_workflow.json) is organized into 5 sequential processing stages:

```
[ POST /havenmatch/match ] ──► [ Action Dispatcher ] ──► [ MongoDB Atlas Fetch ]
                                                               │
                                                               ▼
[ HTTP 200 JSON Response ] ◄── [ Lifestyle Scoring ] ◄── [ Hard Constraints Filter ]
```

### Stage 1: Webhook Trigger (`node-webhook-gateway`)
- **Type**: `webhook`
- **Method**: `POST`
- **Path**: `havenmatch/match`
- **Response Mode**: `respondWithNode` (Synchronous HTTP response)

### Stage 2: Action Router & Normalizer (`node-action-router`)
- **Type**: `code.execute`
- **Purpose**: Normalizes payloads from both Buyer and Seller clients.
- **Supported Actions**:
  - `matching/buyer`: Full lifestyle matching & scoring
  - `auth/login` / `auth/register`: User authentication
  - `properties/create`: New listing upload
  - `properties/list`: Retrieve marketplace inventory
  - `location/poi`: Nearby amenities & travel matrix
  - `visits/schedule`: In-person walkthrough scheduling

### Stage 3: Real-Time MongoDB Atlas Ingestion (`node-mongo-fetch`)
- **Type**: `mongodb.find_document`
- **Database**: `havenmatch`
- **Collection**: `properties`
- **Behavior**: Retrieves all live active properties in real time. Whenever a seller uploads a new property, it is instantly included in subsequent fetches.

### Stage 4: Hard Constraints & Lifestyle Scoring Engine
- **Hard Constraints Filter (`node-hard-filter`)**: Filters out non-matching intent (Buy vs Rent), incompatible cities, and properties exceeding the budget ceiling by >15%.
- **Lifestyle Scoring Matrix (`node-lifestyle-scoring`)**: Computes a 100-point composite score:
  - **Budget Compatibility (25 pts)**
  - **Property & Vastu Fit (20 pts)**
  - **Location & Commute Radius (30 pts)**
  - **Healthcare, Schools, Quietness (25 pts)**

### Stage 5: Response Gateway (`node-response-gateway`)
- **Type**: `respondWithNode`
- **Status Code**: `200 OK`
- **Headers**: `Content-Type: application/json`, `Access-Control-Allow-Origin: *`

---

## 3. Database Schema Reference (MongoDB Atlas)

### `users` Collection
```json
{
  "_id": "ObjectId('...')",
  "userId": "usr-1789057866435",
  "name": "Balapriya",
  "email": "balapriya@havenmatch.ai",
  "phone": "+91 98765 43210",
  "role": "SELLER",
  "intent": "SELL",
  "createdAt": "2026-09-10T20:30:00.000Z",
  "lastLogin": "2026-09-10T20:30:00.000Z"
}
```

### `properties` Collection
```json
{
  "_id": "ObjectId('...')",
  "id": "prop-cbe-01",
  "title": "Mayflower Sakthi Garden",
  "propertyType": "Apartment",
  "intent": "BUY",
  "city": "Coimbatore",
  "locality": "Peelamedu",
  "price": 6800000,
  "priceDisplay": "₹68 Lakhs",
  "bhk": 3,
  "builtUpAreaSqFt": 1550,
  "vastuCompliant": true,
  "waterSupply": "Corporation (Siruvani) + Borewell",
  "images": ["https://images.unsplash.com/..."],
  "seller": {
    "id": "S001",
    "name": "Dr. K. Senthil Kumar",
    "phone": "+91 98422 11223"
  }
}
```

---

## 4. How to Import the Workflow into SNS Workbench
1. Go to **SNS Agent Workbench** (`https://agents.snsihub.ai`).
2. Click **Create New Workflow** or open an existing canvas.
3. Click the **Import / JSON** button on the top right.
4. Select or paste the contents of [`havenmatch_workbench_workflow.json`](file:///C:/Users/balap/Downloads/havenmatch/havenmatch_workbench_workflow.json).
5. Click **Publish** to make the webhook live!
