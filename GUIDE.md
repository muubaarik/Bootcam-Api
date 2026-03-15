# 📚 Bootcam API — Student Learning Guide

This guide explains how the entire project was built, step by step, chapter by chapter.
Read it in order — each chapter builds on the previous one.

---

## 📋 Table of Contents

- [Chapter 1 — What is a REST API?](#chapter-1--what-is-a-rest-api)
- [Chapter 2 — Project Setup](#chapter-2--project-setup)
- [Chapter 3 — Express Server](#chapter-3--express-server)
- [Chapter 4 — Database (MongoDB)](#chapter-4--database-mongodb)
- [Chapter 5 — Models (Data Structure)](#chapter-5--models-data-structure)
- [Chapter 6 — Routes & Controllers](#chapter-6--routes--controllers)
- [Chapter 7 — Middleware](#chapter-7--middleware)
- [Chapter 8 — Authentication (JWT)](#chapter-8--authentication-jwt)
- [Chapter 9 — Advanced Features](#chapter-9--advanced-features)
- [Chapter 10 — Security](#chapter-10--security)
- [Chapter 11 — File Uploads](#chapter-11--file-uploads)
- [Chapter 12 — Deployment](#chapter-12--deployment)

---

## Chapter 1 — What is a REST API?

### 🤔 What is an API?
An API (Application Programming Interface) is a way for two programs to talk to each other.

Think of it like a **waiter in a restaurant**:
- You (the frontend/client) tell the waiter what you want
- The waiter (API) goes to the kitchen (database)
- The kitchen prepares the food (data)
- The waiter brings it back to you

### 🌐 What is REST?
REST is a set of rules for how APIs should work. The main rules are:

| HTTP Method | What it does | Example |
|------------|-------------|---------|
| `GET`      | Read data   | Get all bootcamps |
| `POST`     | Create data | Create a new bootcamp |
| `PUT`      | Update data | Update a bootcamp |
| `DELETE`   | Delete data | Delete a bootcamp |

### 📦 What is JSON?
JSON is how APIs send data. It looks like this:
```json
{
  "name": "My Bootcamp",
  "city": "Boston",
  "rating": 9
}
```

### ✅ What You Learned
- API = bridge between frontend and database
- REST = rules for how the API works
- HTTP Methods = GET, POST, PUT, DELETE
- JSON = the language APIs use to send data

---

## Chapter 2 — Project Setup

### 📁 Folder Structure
```
Bootcam-Api/
├── server.js          ← Main entry point (starts everything)
├── package.json       ← Project info + dependencies
├── config/
│   ├── config.env     ← Secret settings (never share this!)
│   └── db.js          ← Database connection
├── models/            ← Data shapes (what does a bootcamp look like?)
├── controllers/       ← Logic (what happens when a request comes in?)
├── routes/            ← URLs (which URL calls which controller?)
├── middleware/        ← Functions that run BEFORE controllers
└── utils/             ← Helper functions
```

### 📦 package.json — Dependencies
```json
"dependencies": {
  "express"         ← The web server framework
  "mongoose"        ← Talks to MongoDB database
  "dotenv"          ← Reads config.env file
  "bcryptjs"        ← Hashes (encrypts) passwords
  "jsonwebtoken"    ← Creates login tokens
  "morgan"          ← Logs every request in terminal
  "nodemailer"      ← Sends emails
  "express-fileupload" ← Handles file/photo uploads
  "node-geocoder"   ← Converts address to coordinates
  "helmet"          ← Security headers
  "cors"            ← Allows other websites to call your API
}
```

### ⚙️ config.env — Environment Variables
This file stores all secret settings. It is **never uploaded to GitHub**.
```env
NODE_ENV=development    ← Are we in dev or production?
PORT=5001               ← Which port to run on
MONGO_URI=mongodb+srv://...  ← Database URL
JWT_SECRET=abc123       ← Secret key for login tokens
```

> 🔑 **Rule**: Never put passwords or secrets in your code. Always use config.env.

### ✅ What You Learned
- How to organize a Node.js project
- What each folder does
- What npm packages are needed and why
- How environment variables keep secrets safe

---

## Chapter 3 — Express Server

### 📄 File: `server.js`

This is the heart of the project. It starts the server.

```javascript
const express = require('express');   // Import express
const app = express();                // Create the app

app.use(express.json());              // Allow reading JSON from requests

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 🔄 How a Request Works
```
Browser/Postman
      ↓
  server.js        ← receives the request
      ↓
  routes/          ← decides which controller to call
      ↓
  middleware/      ← checks auth, logs, etc.
      ↓
  controllers/     ← runs the logic
      ↓
  models/          ← talks to the database
      ↓
  Response sent back
```

### ✅ What You Learned
- How Express creates a web server
- How `app.listen()` starts the server
- How a request travels through the app

---

## Chapter 4 — Database (MongoDB)

### 🗄️ What is MongoDB?
MongoDB stores data in **documents** (like JSON objects), not tables like Excel.

```
SQL (Excel-like):          MongoDB (JSON-like):
┌──────┬──────────┐        {
│  id  │  name    │          "_id": "abc123",
├──────┼──────────┤          "name": "My Bootcamp",
│  1   │ Bootcamp │          "city": "Boston"
└──────┴──────────┘        }
```

### 📄 File: `config/db.js`
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
```

### ☁️ MongoDB Atlas
MongoDB Atlas is MongoDB in the cloud. Instead of running on your computer, it runs on the internet so anyone can access it.

```
Your App (Render) ──→ MongoDB Atlas (Cloud) ──→ Your Data
```

### ✅ What You Learned
- MongoDB stores data as JSON documents
- Mongoose is the library that connects Node.js to MongoDB
- MongoDB Atlas hosts your database in the cloud

---

## Chapter 5 — Models (Data Structure)

### 🏗️ What is a Model?
A model defines the **shape** of your data. Like a form that must be filled in a certain way.

### 📄 Example: `models/Bootcamps.js`
```javascript
const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],  // must have a name
    unique: true,                           // no duplicate names
    maxlength: [50, 'Max 50 characters']
  },
  description: {
    type: String,
    required: true
  },
  website: {
    type: String,
    match: [/https?:\/\/.../, 'Please use a valid URL']  // must be a real URL
  },
  careers: {
    type: [String],
    enum: ['Web Development', 'Mobile Development', 'Data Science']
  },
  averageRating: {
    type: Number,
    min: 1,
    max: 10
  },
  user: {
    type: mongoose.Schema.ObjectId,  // links to User model
    ref: 'User',
    required: true
  }
});
```

### 🔗 Model Relationships
```
User
 ├── creates → Bootcamp
 │               └── has many → Courses
 │               └── has many → Reviews
 └── writes → Review
```

### 📄 All Models in This Project

| Model | File | Purpose |
|-------|------|---------|
| Bootcamp | `models/Bootcamps.js` | Bootcamp data |
| Course | `models/Course.js` | Courses inside bootcamps |
| User | `models/User.js` | User accounts |
| Review | `models/Review.js` | Reviews for bootcamps |

### ✅ What You Learned
- Models define the shape/rules of your data
- Mongoose validates data before saving
- Models can reference each other (relationships)

---

## Chapter 6 — Routes & Controllers

### 🗺️ Routes
Routes map a **URL + method** to a controller function.

#### 📄 `routes/bootcamps.js`
```javascript
const express = require('express');
const router = express.Router();
const { getBootcamps, createBootcamp } = require('../controllers/bootcams');

router.route('/')
  .get(getBootcamps)      // GET  /api/v1/bootcamps → runs getBootcamps
  .post(createBootcamp);  // POST /api/v1/bootcamps → runs createBootcamp

module.exports = router;
```

### 🎮 Controllers
Controllers contain the **actual logic** — what to do when a request comes in.

#### 📄 `controllers/bootcams.js`
```javascript
// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();  // get all from database

    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    });
  } catch (err) {
    next(err);  // send error to error handler
  }
};
```

### 🔄 Routes + Controllers Together
```
POST /api/v1/bootcamps
        ↓
routes/bootcamps.js  →  finds the route
        ↓
controllers/bootcams.js  →  runs createBootcamp()
        ↓
Bootcamp.create(req.body)  →  saves to database
        ↓
res.json({ success: true, data: bootcamp })
```

### 🗂️ Nested Routes
Some resources belong to another resource:

```
GET /api/v1/bootcamps/:bootcampId/courses
           ↑ parent                ↑ child

GET /api/v1/bootcamps/:bootcampId/reviews
```

### ✅ What You Learned
- Routes decide which URL goes to which function
- Controllers contain the logic
- `req` = the incoming request (what the user sent)
- `res` = the response (what we send back)
- `next` = passes to the next middleware or error handler

---

## Chapter 7 — Middleware

### 🔌 What is Middleware?
Middleware is a function that runs **between** the request and the controller.

```
Request → Middleware 1 → Middleware 2 → Controller → Response
```

### 📄 `middleware/logger.js` — Logs every request
```javascript
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();  // IMPORTANT: always call next() to continue
};
```

### 📄 `middleware/error.js` — Handles all errors
```javascript
const errorHandler = (err, req, res, next) => {
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(404).json({ success: false, error: 'Resource not found' });
  }
  // Duplicate key (e.g. same email twice)
  if (err.code === 11000) {
    return res.status(400).json({ success: false, error: 'Duplicate field value' });
  }
  res.status(500).json({ success: false, error: 'Server Error' });
};
```

### 📄 `middleware/advancedResults.js` — Filtering & Pagination
This middleware adds powerful query features to any route:
```
GET /api/v1/bootcamps?housing=true&sort=-name&page=2&limit=3
```

### ✅ What You Learned
- Middleware runs before controllers
- Must call `next()` to continue the chain
- Error middleware catches all errors in one place
- advancedResults adds filtering/sorting/pagination automatically

---

## Chapter 8 — Authentication (JWT)

### 🔐 What is Authentication?
Authentication = **proving who you are** (login system).

### 🎫 What is JWT?
JWT (JSON Web Token) is like a **stamp on your hand** at an event.

```
1. You register/login
2. Server creates a token: "eyJhbGc..."  (encrypted proof you're logged in)
3. You send this token with every protected request
4. Server checks the token before letting you in
```

### 📄 How Passwords are Stored — `models/User.js`
```javascript
// BEFORE saving, hash the password
UserSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

> 🔒 **Important**: Passwords are NEVER stored as plain text. Always hashed.

### 📄 How Token is Created
```javascript
// In User model
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },           // payload (what's inside the token)
    process.env.JWT_SECRET,     // secret key
    { expiresIn: '30d' }        // expires in 30 days
  );
};
```

### 📄 `middleware/auth.js` — Protecting Routes
```javascript
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header: "Authorization: Bearer eyJ..."
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized' });
  }

  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);  // attach user to request
  next();
};
```

### 📄 Role-Based Access
```javascript
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized for this role' });
    }
    next();
  };
};

// Usage in routes:
router.post('/', protect, authorize('publisher', 'admin'), createBootcamp);
//                ↑ must be logged in    ↑ must be publisher or admin
```

### 📄 Password Reset Flow
```
1. User: POST /auth/forgotpassword  { email: "..." }
2. Server: creates random token, saves HASH to database, sends email with raw token
3. User: clicks link in email
4. User: PUT /auth/resetpassword/:token  { password: "new123" }
5. Server: hashes the token, compares to database, updates password
```

### ✅ What You Learned
- Passwords are always hashed with bcrypt — never plain text
- JWT tokens prove identity without storing sessions
- `protect` middleware checks the token on every protected route
- `authorize` middleware checks the user's role
- Password reset uses a one-time crypto token sent by email

---

## Chapter 9 — Advanced Features

### 🌍 Geocoding
Converting a text address into coordinates (latitude/longitude).

```javascript
// User sends: "233 Bay State Rd Boston MA"
// Geocoder returns:
{
  latitude: 42.35,
  longitude: -71.10,
  city: "Boston",
  zipcode: "02215",
  country: "US"
}
```

This is done automatically when you create a bootcamp — the address is geocoded and the coordinates are stored in the database.

### 📍 Radius Search
Find bootcamps within X miles of a zipcode:

```javascript
// GET /api/v1/bootcamps/radius/02215/50

// 1. Convert zipcode to coordinates
// 2. Calculate radius in radians: miles / 3963 (Earth's radius)
// 3. Use MongoDB $centerSphere to find nearby bootcamps
const bootcamps = await Bootcamp.find({
  location: {
    $geoWithin: {
      $centerSphere: [[longitude, latitude], radius]
    }
  }
});
```

### 📊 Filtering, Sorting, Pagination
The `advancedResults` middleware handles all of this:

```
Filter:    GET /api/v1/bootcamps?housing=true
Advanced:  GET /api/v1/bootcamps?averageCost[lte]=10000
Select:    GET /api/v1/bootcamps?select=name,description
Sort:      GET /api/v1/bootcamps?sort=-createdAt
Paginate:  GET /api/v1/bootcamps?page=2&limit=3
```

### ⭐ Auto-Calculate Average Rating
When a review is added/deleted, the average rating updates automatically:

```javascript
// In Review model — static method
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
  const result = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: '$bootcamp', averageRating: { $avg: '$rating' } } }
  ]);

  await Bootcamp.findByIdAndUpdate(bootcampId, {
    averageRating: result[0].averageRating
  });
};

// Runs automatically after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.bootcamp);
});
```

### ✅ What You Learned
- Geocoding converts text addresses to map coordinates
- Radius search uses MongoDB's geospatial features
- Advanced query middleware makes filtering/sorting reusable
- Mongoose hooks (`pre`, `post`) run code automatically before/after save

---

## Chapter 10 — Security

### 🛡️ 5 Security Layers Added

#### 1. Helmet — Security Headers
```javascript
app.use(helmet());
// Adds HTTP headers that protect against common attacks
```

#### 2. XSS Clean — Prevent Script Injection
```javascript
app.use(xss());
// If someone sends: { name: "<script>steal()</script>" }
// It becomes:       { name: "&lt;script&gt;steal()&lt;/script&gt;" }
```

#### 3. Rate Limiting — Prevent Spam/Brute Force
```javascript
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 100                    // max 100 requests per 10 min
});
app.use(limiter);
// Blocks users who send too many requests
```

#### 4. HPP — Prevent Parameter Pollution
```javascript
app.use(hpp());
// Prevents: GET /api?sort=name&sort=email (duplicate params)
```

#### 5. CORS — Control Who Can Access Your API
```javascript
app.use(cors());
// Allows other websites/apps to call your API
```

### ✅ What You Learned
- helmet adds security headers automatically
- xss-clean removes malicious scripts from input
- Rate limiting prevents abuse and brute force attacks
- hpp prevents HTTP parameter pollution
- cors allows cross-origin requests from frontend apps

---

## Chapter 11 — File Uploads

### 📸 Photo Upload
```javascript
// PUT /api/v1/bootcamps/:id/photo

// 1. Check a file was uploaded
if (!req.files) return error('Please upload a file');

// 2. Check it's an image
if (!file.mimetype.startsWith('image')) return error('Please upload an image');

// 3. Check file size (max 1MB)
if (file.size > 1000000) return error('File too large');

// 4. Create unique filename
file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
// Result: photo_69b4cddd.png

// 5. Save the file
file.mv(`./public/uploads/${file.name}`);
```

### 🎥 Video Upload
Same process but for videos (max 100MB):
```javascript
// PUT /api/v1/courses/:id/video
file.name = `video_${course._id}${path.parse(file.name).ext}`;
// Result: video_69b4b2d1.mp4
```

### ✅ What You Learned
- express-fileupload puts files in `req.files`
- Always validate file type and size
- Create unique filenames using the document ID
- Static files are served from the `public/` folder

---

## Chapter 12 — Deployment

### 🚀 Deployment Steps

#### Step 1 — MongoDB Atlas (Cloud Database)
```
Local MongoDB → MongoDB Atlas (cloud)
- Create free cluster
- Create database user
- Allow all IPs (0.0.0.0/0)
- Get connection string (MONGO_URI)
```

#### Step 2 — GitHub (Code Repository)
```bash
git init                          # start git tracking
git add .                         # add all files
git commit -m "Initial commit"    # save snapshot
git remote add origin <url>       # connect to GitHub
git push origin main              # upload code
```

#### Step 3 — Render (Web Hosting)
```
GitHub repo → Render
- Connect GitHub account
- Select repository
- Set environment variables (all the config.env values)
- Build command: (none needed)
- Start command: npm start
- Deploy!
```

#### Step 4 — config.env vs Render Environment
```
config.env          Render Environment
(local)             (production)
──────────          ─────────────────
NODE_ENV=dev   →    NODE_ENV=production
PORT=5001      →    (Render sets this automatically)
MONGO_URI=...  →    MONGO_URI=... (same Atlas URI)
JWT_SECRET=... →    JWT_SECRET=...
```

### ✅ What You Learned
- MongoDB Atlas = cloud database
- GitHub = stores and versions your code
- Render = runs your server on the internet
- config.env stays secret (in .gitignore)
- Render has its own environment variables panel

---

## 🎓 Summary — What You Built

```
                    ┌─────────────────────────────┐
                    │        CLIENT               │
                    │  (Browser / Postman / App)  │
                    └──────────────┬──────────────┘
                                   │ HTTP Request
                    ┌──────────────▼──────────────┐
                    │         RENDER              │
                    │  (Cloud Server - Node.js)   │
                    │                             │
                    │  server.js                  │
                    │    ├── middleware/           │
                    │    │   ├── auth.js           │
                    │    │   ├── error.js          │
                    │    │   └── advancedResults   │
                    │    ├── routes/               │
                    │    └── controllers/          │
                    └──────────────┬──────────────┘
                                   │ Database Query
                    ┌──────────────▼──────────────┐
                    │       MONGODB ATLAS         │
                    │    (Cloud Database)         │
                    │                             │
                    │  Collections:               │
                    │    ├── bootcamps            │
                    │    ├── courses              │
                    │    ├── users                │
                    │    └── reviews              │
                    └─────────────────────────────┘
```

### Skills You Learned
- ✅ Node.js & Express — building web servers
- ✅ MongoDB & Mongoose — database operations
- ✅ REST API design — routes, methods, status codes
- ✅ JWT Authentication — secure login system
- ✅ Middleware — reusable functions in request pipeline
- ✅ Geocoding — working with location data
- ✅ File uploads — handling photos and videos
- ✅ Security — protecting APIs from attacks
- ✅ Error handling — clean error responses
- ✅ Git & GitHub — version control
- ✅ Cloud deployment — Render + MongoDB Atlas

---

## 📖 Recommended Next Steps

### 1. Learn these concepts deeper
- **Async/Await** — how `async` functions work in JavaScript
- **Mongoose Populate** — how to join data from different collections
- **MongoDB Aggregation** — how `$group`, `$match`, `$avg` work

### 2. Build a Frontend
Connect a React app to this API:
```
React (frontend) → fetch('/api/v1/bootcamps') → This API → MongoDB
```

### 3. Add More Features
- Email verification on register
- Social login (Google/GitHub)
- Real-time updates with WebSockets
- API versioning (`/api/v2/`)

---

*Built by Mubarak — March 2026*
