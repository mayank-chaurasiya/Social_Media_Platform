# Connect - LinkedIn Clone

Connect is a full-stack social networking project inspired by LinkedIn. It lets users register, log in, build a profile, upload a profile picture, create posts with optional media, like and comment on posts, discover other users, send connection requests, accept requests, view public profiles, download a profile as a PDF resume, and permanently delete their account.

This README is written to explain the project from both a product and engineering point of view:

- what the project does
- why each technology was chosen
- how each feature is implemented
- what happens inside the app when a user performs an action

## Project Overview

The app is split into two applications:

- `frontend/`: a Next.js client that renders the UI and manages user interactions
- `backend/`: an Express + MongoDB API that stores users, profiles, posts, comments, and connection requests

At a high level, the flow looks like this:

1. A user signs up or logs in from the frontend.
2. The backend validates the request and returns a random auth token.
3. The token is saved in `localStorage`.
4. Protected pages use that token to fetch profile data and perform actions.
5. Redux keeps auth, profile, post, comment, and connection state available across pages.
6. MongoDB stores the persistent data.
7. Uploaded images and generated PDFs are served from `backend/uploads`.

## Main Features

### User authentication

- Register with `name`, `username`, `email`, and `password`
- Login with `email` and `password`
- Persist login using a token stored in `localStorage`
- Log out by clearing the stored token and resetting Redux state

### Profile management

- Auto-create an empty profile record at registration
- Edit display name
- Update profile picture
- Update bio
- Add, edit, and remove work history entries
- Add, edit, and remove education entries
- View your own posts inside the profile page
- Delete your entire profile and related data

### Social feed

- Create a text post
- Attach optional media while posting
- View all posts in reverse chronological order on the dashboard
- Delete your own posts
- Like posts once per logged-in user
- Open a comment panel for a post
- Add comments to any post

### Networking features

- Discover other users from the discover page
- Visit public profiles using a username-based route
- Send connection requests
- Accept incoming connection requests
- View accepted connections in the "My Networks" section

### Public profile extras

- Download a user's profile as a generated PDF resume
- View work history, education, bio, and recent activity

## Why This Stack Was Used

| Area | Tool | Why it is used in this project |
| --- | --- | --- |
| Frontend framework | Next.js | Gives file-based routing, server-side data loading for public profile pages, and a structured React app setup. |
| UI library | React | Makes the UI component-driven and easier to break into reusable parts like layouts and the navbar. |
| State management | Redux Toolkit | Centralizes auth, profile, post, comment, and connection state so multiple pages can react to the same data. |
| API client | Axios | Simplifies HTTP requests and lets the app share one configured backend client. |
| Backend framework | Express | Keeps the API simple and readable for CRUD-style features such as posts, profiles, and connections. |
| Database | MongoDB | Works well for flexible social app data where profiles, posts, comments, and connections have different shapes. |
| ODM | Mongoose | Adds schemas, relationships, validation defaults, and `populate()` support for joining user data into posts and profiles. |
| Password security | bcrypt | Hashes passwords before storing them in the database. |
| Token generation | crypto | Generates random session tokens for login and unique names for PDF files. |
| File upload handling | multer | Handles post media and profile picture uploads from multipart form data. |
| PDF generation | pdfkit | Generates downloadable PDF resumes directly from stored profile data. |
| Styling | CSS Modules | Keeps page and component styles scoped and organized. |

## Tech Stack

### Frontend

- Next.js `16.1.6`
- React `19.2.3`
- React DOM `19.2.3`
- Redux Toolkit
- React Redux
- Axios
- CSS Modules

### Backend

- Express `5.2.1`
- Mongoose `9.2.3`
- bcrypt
- cors
- dotenv
- multer
- pdfkit
- crypto

## Folder Structure

```text
Linkedin_clone/
|- README.md
|- backend/
|  |- api.http
|  |- controllers/
|  |- models/
|  |- routes/
|  |- uploads/
|  |- package.json
|  `- server.js
`- frontend/
   |- public/
   |- src/
   |  |- Components/
   |  |- config/
   |  |  `- redux/
   |  |- layout/
   |  |- pages/
   |  `- styles/
   |- package.json
   `- next.config.mjs
```

## Important Pages And What They Do

| Route | Purpose |
| --- | --- |
| `/` | Landing page for the product |
| `/login` | Sign up and sign in page |
| `/dashboard` | Main feed for creating posts, reading posts, liking, and commenting |
| `/discover` | Shows other users that can be explored |
| `/my_connections` | Shows pending requests and accepted connections |
| `/profile` | Logged-in user's editable profile |
| `/view_profile/[username]` | Public profile page for a selected user |

## Backend Data Models

### `User`

Stores identity and login-related data.

- `name`
- `username`
- `email`
- `password` (hashed with bcrypt)
- `profilePicture`
- `createdAt`
- `token`

### `Profile`

Stores extended profile information separate from auth credentials.

- `userId`
- `bio`
- `currentPost`
- `pastWork[]`
- `education[]`

### `Post`

Represents a feed post.

- `userId`
- `body`
- `likes`
- `likedBy[]`
- `createdAt`
- `updatedAt`
- `media`
- `active`
- `fileType`

### `Comment`

Represents a comment linked to both a user and a post.

- `userId`
- `postId`
- `body`

### `ConnectionRequest`

Represents one networking request between two users.

- `userId`
- `connectionId`
- `status_accepted`

`status_accepted` behaves like this:

- `null`: request is pending
- `true`: request is accepted
- `false`: request is rejected or declined

## Frontend Architecture

### Shared config

`frontend/src/config/index.jsx` exports:

- `BASE_URL`: currently set to `http://localhost:9090`
- `clientServer`: a shared Axios instance using that base URL

This is why most frontend code can make API calls with short paths like `/login`, `/posts`, or `/update_profile_data`.

### Redux store

The frontend uses two reducers:

- `auth`: handles login state, profile data, user lists, connection requests, and outgoing connections
- `posts`: handles posts, comments, and the selected post whose comment panel is open

### Layout strategy

- `UserLayout` wraps pages with the global navbar
- `DashboardLayout` protects dashboard-style pages, checks for the token, loads profile data, loads all users, and renders sidebar + feed + extra profile suggestions

This means page components stay focused on feature logic while shared navigation and auth checks stay in the layout layer.

## Backend Architecture

### Server setup

The backend entry point is `backend/server.js`.

It:

1. loads environment variables using `dotenv`
2. creates an Express app
3. enables CORS
4. parses JSON request bodies
5. serves static files from `uploads`
6. mounts post routes
7. mounts user routes
8. connects to MongoDB using `MONGODB_URI`
9. starts the API on port `9090`

### Routes

The API is divided into:

- `backend/routes/user.routes.js`
- `backend/routes/posts.routes.js`

Controllers contain the business logic, and Mongoose models persist the data.

## What Happens When A User Uses Each Feature

### 1. Register

Why this flow exists:
New users need both an account and a profile shell before they can use the platform.

How it is implemented:

- frontend dispatches `registerUser`
- thunk sends `POST /register`
- backend checks required fields
- backend verifies that the email is not already used
- backend hashes the password with `bcrypt.hash`
- backend creates a `User`
- backend creates a blank `Profile` linked to that user
- backend generates a random token using `crypto.randomBytes`
- frontend saves the token in `localStorage`

What happens after use:
The user is considered logged in immediately and is redirected to `/dashboard`.

### 2. Login

Why this flow exists:
Returning users need a lightweight way to authenticate.

How it is implemented:

- frontend dispatches `loginUser`
- thunk sends `POST /login`
- backend finds the user by email
- backend compares passwords using `bcrypt.compare`
- backend creates a new random token
- backend updates the token stored in MongoDB
- frontend stores the returned token in `localStorage`

What happens after use:
The dashboard can now fetch the logged-in user's profile and allow protected actions like posting or sending connection requests.

### 3. Auth persistence

Why it is used:
Users should not have to log in again on every page refresh.

How it is implemented:

- token is stored in `localStorage`
- `DashboardLayout` checks whether the token exists
- if it does not exist, the user is redirected to `/login`
- if it exists, Redux is told that a token is present and profile data is fetched

What happens after use:
The navbar changes from guest mode to authenticated mode, and profile-aware pages can render the user's details.

### 4. Create a post

Why this feature exists:
Posting is the core social interaction of the platform.

How it is implemented:

- the dashboard collects post text and an optional file
- frontend builds a `FormData` object
- token, post body, and file are sent to `POST /post`
- multer handles the uploaded file
- backend finds the current user using the token
- backend creates a `Post` document with text, media filename, and file type

What happens after use:
The dashboard clears the input and reloads all posts so the new post appears in the feed.

### 5. View the dashboard feed

Why this feature exists:
Users need a central place to consume activity from the platform.

How it is implemented:

- dashboard dispatches `getAllPosts`
- backend returns all posts with `userId` populated
- frontend reverses the array so latest items appear first
- each card renders author info, body, optional media, likes, comments, and actions

What happens after use:
Users can immediately interact with posts by liking, commenting, deleting their own posts, or sharing.

### 6. Like a post

Why it is used:
Likes are a basic social signal and engagement metric.

How it is implemented:

- frontend sends `POST /increment_post_like`
- backend checks the token
- backend uses `findOneAndUpdate` with a `likedBy: { $ne: user._id }` condition
- if the user has not liked the post yet, likes are incremented and the user id is pushed into `likedBy`
- if the user already liked the post, the backend returns `alreadyLiked: true`

What happens after use:
The like count updates and the frontend disables the like action for that user.

### 7. Comment on a post

Why it is used:
Comments create discussion around content.

How it is implemented:

- clicking the comment icon dispatches `getAllComments`
- Redux stores the selected `postId`
- a comment panel opens on top of the dashboard
- posting a comment sends `POST /comment`
- backend creates a `Comment` document
- frontend refetches comments for the same post

What happens after use:
The new comment appears immediately in the comment panel.

### 8. Discover users

Why it is used:
The platform needs a way to expose other profiles and encourage networking.

How it is implemented:

- frontend dispatches `getAllUsers`
- backend returns all populated profiles
- current logged-in user is filtered out on the client
- each card links to `/view_profile/[username]`

What happens after use:
Users can open other profiles and decide whether to connect.

### 9. Send and accept connection requests

Why it is used:
This is the networking feature that makes the app behave more like LinkedIn.

How it is implemented:

- viewing another profile lets the logged-in user send a request
- frontend dispatches `sendConnectionRequest`
- backend creates a `ConnectionRequest` with `status_accepted: null`
- the connections page loads both incoming and outgoing relationship data
- accepting a request sends `POST /user/accept_connection_request`
- backend updates `status_accepted` to `true`

What happens after use:

- pending requests show as `PENDING`
- accepted relationships show in "My Networks"
- the viewed public profile changes from a connect button to a status button

### 10. Edit profile data

Why it is used:
A professional-style platform needs editable personal branding and resume information.

How it is implemented:

- the profile page stores a `draftProfile` in local component state
- changes do not immediately hit the API
- on save, the page compares the draft to the original Redux profile
- `name` updates go to `POST /user_update`
- `bio`, `pastWork`, and `education` updates go to `POST /update_profile_data`
- both frontend and backend sanitize collection entries to remove blank rows

What happens after use:
The profile, visible user cards, and feed data are refetched so the latest profile details appear across the app.

### 11. Update profile picture

Why it is used:
A social platform needs a visual identity for each user.

How it is implemented:

- profile page uses a hidden file input
- selected file is wrapped in `FormData`
- frontend sends `POST /update_profile_picture`
- multer stores the image in `backend/uploads`
- backend updates `user.profilePicture`

What happens after use:
The new image appears in the profile page, navbar-linked identity areas, user suggestion cards, and the feed.

### 12. View a public profile

Why it is used:
Profiles should be shareable and directly accessible by username.

How it is implemented:

- route is defined as `frontend/src/pages/view_profile/[username].jsx`
- the page uses `getServerSideProps`
- on request, frontend calls `/user/get_profile_on_username`
- returned profile is rendered with bio, work history, education, and recent posts

What happens after use:
The user sees a read-only version of someone else's profile and can connect or download the resume PDF.

### 13. Download profile as PDF

Why it is used:
This project adds a resume-style export to make profiles more useful outside the app.

How it is implemented:

- the public profile page calls `GET /user/download_resume?id=<userId>`
- backend loads the profile and populated user data
- `pdfkit` generates a PDF file in `backend/uploads`
- the backend returns the generated filename
- the frontend opens the static file URL in a new tab

What happens after use:
The user gets a browser-opened PDF version of the selected profile details.

### 14. Delete profile

Why it is used:
Users should be able to completely remove their presence from the platform.

How it is implemented:

- frontend asks for confirmation
- it sends `DELETE /delete_profile`
- backend finds the logged-in user by token
- backend collects the user's post ids
- backend deletes:
  - comments written by the user
  - comments attached to the user's posts
  - connection requests involving the user
  - the user's posts
  - the user's profile
  - the user account itself

What happens after use:
The token is removed, Redux state is reset, and the user is redirected to `/login`.

## API Overview

### User routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/register` | Create a new user and blank profile |
| `POST` | `/login` | Authenticate a user |
| `POST` | `/update_profile_picture` | Upload a new profile picture |
| `POST` | `/user_update` | Update base user fields such as name |
| `GET` | `/get_user_and_profile` | Fetch logged-in user's profile using token |
| `POST` | `/update_profile_data` | Update bio, work history, and education |
| `GET` | `/user/get_all_users` | Fetch all profiles |
| `GET` | `/user/get_profile_on_username` | Fetch a profile by username |
| `GET` | `/user/download_resume` | Generate and return a PDF filename |
| `POST` | `/user/send_connection_request` | Send a connection request |
| `GET` | `/user/get_connection_requests` | Fetch outgoing requests |
| `GET` | `/user/user_connection_request` | Fetch incoming requests |
| `POST` | `/user/accept_connection_request` | Accept or decline a request |
| `DELETE` | `/delete_profile` | Delete the logged-in user and related data |

### Post routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | Health check |
| `POST` | `/post` | Create a post with optional media |
| `GET` | `/posts` | Fetch all posts |
| `DELETE` | `/delete_post` | Delete a user's own post |
| `POST` | `/comment` | Add a comment to a post |
| `GET` | `/get_comments` | Fetch comments for a post |
| `POST` | `/delete_comment` | Delete a user's own comment |
| `POST` | `/increment_post_like` | Like a post once |

## Manual Testing Support

The repo includes `backend/api.http`, which is helpful for manually testing API endpoints from an HTTP client that supports `.http` files.

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Linkedin_clone
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Create the backend environment file

Create `backend/.env` with:

```env
MONGODB_URI=your_mongodb_connection_string
```

### 4. Make sure uploads are available

The backend serves uploaded and generated files from `backend/uploads`.

This folder should exist before running the app. It already exists in this project and includes `default.jpg`, which is used as the default user avatar.

### 5. Start the backend server

```bash
cd backend
npm run dev
```

The backend runs on:

```text
http://localhost:9090
```

### 6. Install frontend dependencies

```bash
cd frontend
npm install
```

### 7. Verify frontend API base URL

The frontend currently reads from:

```js
export const BASE_URL = "http://localhost:9090";
```

This is defined in `frontend/src/config/index.jsx`.

If you deploy the backend somewhere else, update that value.

### 8. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend will run on the default Next.js development port, usually:

```text
http://localhost:3000
```

## Available Scripts

### Backend

```bash
npm run dev
```

Starts the Express server with `nodemon`.

### Frontend

```bash
npm run dev
npm run build
npm run start
npm run lint
```

- `npm run dev`: start the Next.js development server
- `npm run build`: build the production bundle
- `npm run start`: run the production build
- `npm run lint`: run ESLint

## Important Implementation Notes

### Authentication is token-based, not JWT-based

This project does not use JWT or session cookies.

Instead:

- a random token is generated on login/register
- the token is saved in MongoDB
- the token is stored in frontend `localStorage`
- protected frontend pages send the token with requests

This keeps the auth flow easy to understand for a learning project.

### Server-side rendering is used for public profiles

The page `view_profile/[username].jsx` uses `getServerSideProps`, so profile data is fetched before the page is rendered for that request.

This is useful for:

- direct URL access
- shareable profile links
- always loading fresh profile data

### Uploaded files are served statically

`express.static("uploads")` makes images and generated PDFs accessible by URL.

That is why the frontend can render images like:

```text
http://localhost:9090/<filename>
```

### Mongoose populate is heavily used

Instead of storing repeated user data inside posts and comments, the app stores references and uses `populate()` when reading data.

This is why:

- posts can show the author's name and profile picture
- comments can show commenter information
- profiles can embed linked user identity details

## Current Limitations And Possible Improvements

These are not failures of the project. They are simply the next logical upgrades based on the current codebase.

- `BASE_URL` is hardcoded in the frontend instead of being environment-driven
- auth does not use JWT expiry, refresh tokens, or backend middleware guards
- the UI supports accepting connection requests, but there is no visible reject button yet
- the backend supports comment deletion, but the current dashboard UI does not expose a delete comment action
- `currentPost` exists in the profile schema and PDF export, but the current profile editor UI does not provide a field for it
- post sharing currently opens a Twitter intent with a hardcoded URL
- there are no automated tests in the repository right now

## What This Project Demonstrates

This project is a strong example of learning and applying:

- full-stack React and Node.js development
- REST API design
- MongoDB relationships with Mongoose references
- Redux Toolkit async flow with `createAsyncThunk`
- file uploads with multer
- PDF generation from live database data
- dynamic routing in Next.js
- CRUD operations across multiple related collections

## Conclusion

Connect is more than a simple UI clone. It combines authentication, profile management, feed interactions, networking features, media uploads, and document generation into one full-stack application.

If you are presenting this project in a portfolio, the strongest talking points are:

- full-stack architecture separation between Next.js and Express
- end-to-end social features
- token-based auth flow
- MongoDB schema design for linked social data
- resume PDF export from profile data
- clean separation of pages, layouts, Redux logic, controllers, routes, and models
