# Bootcam API

A full-featured REST API for bootcamp directory management. Built with Node.js, Express, and MongoDB.

- **Live URL**: https://bootcam-api-4hmt.onrender.com
- **GitHub**: https://github.com/muubaarik/Bootcam-Api

---

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Bootcamps](#bootcamps)
- [Courses](#courses)
- [Reviews](#reviews)
- [Users (Admin)](#users-admin)
- [Error Codes](#error-codes)

---

## Getting Started

### Run Locally

```bash
# Install dependencies
npm install

# Start development server (auto-restarts)
npm run dev

# Start production server
npm start
```

Server runs on: `http://localhost:5001`

### Environment Variables

Create `config/config.env`:

```env
NODE_ENV=development
PORT=5001
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_mailtrap_email
SMTP_PASSWORD=your_mailtrap_password
FROM_NAME=Bootcam API
FROM_EMAIL=noreply@bootcam.com
FILE_UPLOAD_PATH=./public/uploads
MAX_FILE_UPLOAD=1000000
VIDEO_UPLOAD_PATH=./public/uploads/videos
MAX_VIDEO_UPLOAD=100000000
```

---

## Authentication

All protected routes require a Bearer token in the header:

```
Authorization: Bearer <your_token>
```

### Register
```
POST /api/v1/auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@test.com",
  "password": "123456",
  "role": "publisher"
}
```
> Roles: `user` | `publisher` | `admin`

---

### Login
```
POST /api/v1/auth/login
```
**Body:**
```json
{
  "email": "john@test.com",
  "password": "123456"
}
```
**Response:** Returns `token` — use it in all protected requests.

---

### Get Logged In User
```
GET /api/v1/auth/me
```
🔒 Requires token

---

### Forgot Password
```
POST /api/v1/auth/forgotpassword
```
**Body:**
```json
{
  "email": "john@test.com"
}
```
Sends a reset email via Mailtrap.

---

### Reset Password
```
PUT /api/v1/auth/resetpassword/:resettoken
```
**Body:**
```json
{
  "password": "newpassword123"
}
```

---

## Bootcamps

### Get All Bootcamps
```
GET /api/v1/bootcamps
```
Public. Supports filtering, sorting, pagination.

**Query Examples:**
```
GET /api/v1/bootcamps?housing=true
GET /api/v1/bootcamps?careers[in]=Web Development
GET /api/v1/bootcamps?select=name,description
GET /api/v1/bootcamps?sort=-createdAt
GET /api/v1/bootcamps?page=2&limit=2
GET /api/v1/bootcamps?averageCost[lte]=10000
```

---

### Get Single Bootcamp
```
GET /api/v1/bootcamps/:id
```
Public.

---

### Get Bootcamps Within Radius
```
GET /api/v1/bootcamps/radius/:zipcode/:distance
```
Public. Distance in **miles**.

**Example:**
```
GET /api/v1/bootcamps/radius/02215/50
```
Returns all bootcamps within 50 miles of Boston (02215).

---

### Create Bootcamp
```
POST /api/v1/bootcamps
```
🔒 `publisher` or `admin` only. One bootcamp per publisher.

**Body:**
```json
{
  "name": "My Coding Bootcamp",
  "description": "Learn to code fast",
  "website": "https://mybootcamp.com",
  "phone": "(617) 555-1234",
  "email": "info@mybootcamp.com",
  "address": "233 Bay State Rd Boston MA 02215",
  "careers": ["Web Development", "Mobile Development"],
  "housing": true,
  "jobAssistance": true,
  "jobGuarantee": false,
  "acceptGi": true
}
```
> `careers` options: `Web Development` | `Mobile Development` | `UI/UX` | `Data Science` | `Business` | `Other`

---

### Update Bootcamp
```
PUT /api/v1/bootcamps/:id
```
🔒 Owner or `admin` only.

**Body:** (any fields to update)
```json
{
  "name": "Updated Name",
  "housing": false
}
```

---

### Delete Bootcamp
```
DELETE /api/v1/bootcamps/:id
```
🔒 Owner or `admin` only.

---

### Upload Bootcamp Photo
```
PUT /api/v1/bootcamps/:id/photo
```
🔒 Owner or `admin` only.

**Body:** `form-data`
- Key: `file` | Type: **File** | Value: `.jpg` or `.png` (max 1MB)

---

## Courses

### Get All Courses
```
GET /api/v1/courses
```
Public. Returns all courses across all bootcamps.

---

### Get Courses For a Bootcamp
```
GET /api/v1/bootcamps/:bootcampId/courses
```
Public.

---

### Get Single Course
```
GET /api/v1/courses/:id
```
Public.

---

### Add Course to Bootcamp
```
POST /api/v1/bootcamps/:bootcampId/courses
```
🔒 `publisher` or `admin` only (must own the bootcamp).

**Body:**
```json
{
  "title": "Full Stack Web Dev",
  "description": "Learn HTML, CSS, JS, Node.js",
  "weeks": "12",
  "tuition": 8000,
  "minimumSkill": "beginner",
  "scholarshipsAvailable": true
}
```
> `minimumSkill` options: `beginner` | `intermediate` | `advanced`

---

### Update Course
```
PUT /api/v1/courses/:id
```
🔒 Owner or `admin` only.

---

### Delete Course
```
DELETE /api/v1/courses/:id
```
🔒 Owner or `admin` only.

---

### Upload Course Video
```
PUT /api/v1/courses/:id/video
```
🔒 Owner or `admin` only.

**Body:** `form-data`
- Key: `file` | Type: **File** | Value: `.mp4` (max 100MB)

---

## Reviews

### Get All Reviews
```
GET /api/v1/reviews
```
Public.

---

### Get Reviews For a Bootcamp
```
GET /api/v1/bootcamps/:bootcampId/reviews
```
Public.

---

### Get Single Review
```
GET /api/v1/reviews/:id
```
Public.

---

### Add Review
```
POST /api/v1/bootcamps/:bootcampId/reviews
```
🔒 `user` or `admin` only. One review per bootcamp per user.

**Body:**
```json
{
  "title": "Amazing bootcamp!",
  "text": "Learned so much in 3 months",
  "rating": 9
}
```
> `rating`: number between `1` and `10`

---

### Update Review
```
PUT /api/v1/reviews/:id
```
🔒 Owner or `admin` only.

---

### Delete Review
```
DELETE /api/v1/reviews/:id
```
🔒 Owner or `admin` only.

---

## Users (Admin)

> All routes below require `admin` role.

### Get All Users
```
GET /api/v1/users
```

### Get Single User
```
GET /api/v1/users/:id
```

### Create User
```
POST /api/v1/users
```
**Body:**
```json
{
  "name": "New User",
  "email": "newuser@test.com",
  "password": "123456",
  "role": "publisher"
}
```

### Update User
```
PUT /api/v1/users/:id
```

### Delete User
```
DELETE /api/v1/users/:id
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad request (missing/invalid fields) |
| `401` | Unauthorized (no token or invalid token) |
| `403` | Forbidden (wrong role or not owner) |
| `404` | Resource not found |
| `429` | Too many requests (rate limit: 100 per 10 min) |
| `500` | Server error |

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Server & routing |
| MongoDB + Mongoose | Database |
| JWT + bcryptjs | Authentication |
| node-geocoder | Address → coordinates |
| express-fileupload | Photo & video uploads |
| nodemailer | Password reset emails |
| helmet + cors + hpp | Security |
| express-rate-limit | Rate limiting |
| xss-clean | XSS protection |
