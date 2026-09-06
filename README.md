<p align="center">
  <img
    alt="Coordina header"
    src="https://shieldcn.dev/header/surface.svg?title=Coordina&amp;subtitle=A+full-stack+project+management+platform+with+workspaces%2C+Kanban+workflows%2C+analytics+and+an+isolated+demo+mode.&amp;logo=https%3A%2F%2Fcoordina.alessandro-argenziano.com%2Ficon1.png&amp;mode=dark&amp;font=geist"
  />
</p>

<p align="center">
  <img alt="Production" src="https://shieldcn.dev/badge/Production.svg?variant=outline&amp;font=geist" />
  <img alt="Next.js 16" src="https://shieldcn.dev/badge/Next.js_16.svg?variant=outline&amp;font=geist&amp;logo=nextdotjs" />
  <img alt="MongoDB" src="https://shieldcn.dev/badge/MongoDB.svg?variant=outline&amp;font=geist&amp;logo=mongodb" />
  <img alt="TypeScript" src="https://shieldcn.dev/badge/TypeScript.svg?variant=outline&amp;font=geist&amp;logo=typescript" />
  <a href="https://github.com/alessandro-arg/coordina"><img alt="license" src="https://shieldcn.dev/github/alessandro-arg/coordina/license.svg?variant=outline&amp;font=geist" /></a>
</p>

<p align="center">
  <a href="https://coordina.alessandro-argenziano.com"><strong>/LIVE DEMO</strong></a>
</p>

## Overview

Coordina is a full-stack project and task management application built around collaborative workspaces.

Users can create workspaces and projects, invite members, assign and organize tasks, switch between table, Kanban, and calendar workflows, and monitor activity through workspace and project analytics.

The application also includes an isolated demo workspace. Demo changes are stored locally in the browser instead of being written to the production database, allowing visitors to explore the main workflows without affecting shared data.

Coordina originally used Appwrite for backend services. The current implementation replaces that architecture with **MongoDB and Mongoose for application data, Auth.js for authentication, and Cloudinary for image uploads**.

## Highlights

- Multi-workspace project organization
- Workspace invitations through invite codes
- Administrator and member roles
- Project creation, editing, deletion, and image uploads
- Task creation and management
- Task assignment to workspace members
- Due dates and task descriptions
- Five workflow states:
  - Backlog
  - Todo
  - In Progress
  - In Review
  - Done
- Table task view
- Drag-and-drop Kanban board
- Calendar task view
- Task filtering by status, assignee, project, and due date
- Workspace analytics
- Project analytics
- Email and password authentication
- Google OAuth
- GitHub OAuth
- MongoDB-backed persistence
- Cloudinary-backed workspace and project images
- Light and dark themes
- Responsive dashboard interface
- Isolated browser-based demo mode

## Tech Stack

| Area              | Technologies                                    |
| ----------------- | ----------------------------------------------- |
| Framework         | Next.js 16, React 19                            |
| Language          | TypeScript                                      |
| Styling           | Tailwind CSS 4                                  |
| UI                | Radix UI, Lucide, reusable component primitives |
| API               | Hono, Hono RPC                                  |
| Database          | MongoDB, Mongoose                               |
| Authentication    | Auth.js / NextAuth v5, MongoDB Adapter, bcrypt  |
| Server Validation | Zod, Hono Zod Validator                         |
| Client Data       | TanStack Query                                  |
| Forms             | React Hook Form, Zod                            |
| File Storage      | Cloudinary                                      |
| Drag & Drop       | @hello-pangea/dnd                               |
| Calendar          | react-big-calendar                              |
| URL State         | nuqs                                            |
| Themes            | next-themes                                     |

## Architecture

Coordina follows a feature-oriented structure built around the main application domains.

```text
app/
├── (auth)/                    # Sign-in and sign-up routes
├── (dashboard)/               # Authenticated dashboard routes
├── (standalone)/              # Workspace joins and settings routes
├── api/
│   ├── [[...route]]/          # Hono API entry point
│   ├── auth/
│   └── current/
└── features/
    ├── auth/
    ├── members/
    ├── projects/
    ├── tasks/
    └── workspaces/

components/                    # Shared application and UI components

lib/
├── db/                        # MongoDB connection and Mongoose models
├── server/                    # Server-side helpers and OAuth actions
├── cloudinary.ts              # Cloudinary integration
├── demo-storage.ts            # Browser-backed demo persistence
├── rpc.ts                     # Typed Hono RPC client
├── session-middleware.ts      # API authentication middleware
└── utils.ts                   # Shared utilities

public/                        # Icons and static demo assets

auth.ts                        # Auth.js configuration
```

### Application Data Flow

The normal application flow is:

```text
React UI
    |
    v
TanStack Query
    |
    v
Typed Hono RPC client
    |
    v
Hono API routes
    |
    v
Session and workspace authorization
    |
    v
Mongoose
    |
    v
MongoDB
```

Authentication is handled through Auth.js with MongoDB-backed user data and JWT sessions.

Workspace and project image uploads are processed by the server and stored through Cloudinary.

Demo users follow a separate client-side path:

```text
Demo UI
    |
    v
Feature query and mutation hooks
    |
    v
Browser localStorage
```

This keeps demo mutations isolated from production MongoDB data.

## Core Domains

### Workspaces

Workspaces are the top-level collaboration boundary in Coordina.

A workspace can contain:

- members
- projects
- tasks
- workspace analytics

The user who creates a workspace becomes an administrator.

Workspace administrators can manage settings, regenerate invitation codes, manage member roles, and delete the workspace.

Deleting a workspace also removes its associated members, projects, and tasks.

### Projects

Projects belong to a workspace and group related tasks.

Projects support:

- creation
- editing
- deletion
- image uploads
- project-specific analytics

Project images are stored through Cloudinary.

### Tasks

Tasks belong to both a workspace and a project.

Each task contains:

- name
- workflow status
- workspace
- project
- assignee
- due date
- description
- Kanban position

The available workflow states are:

```text
BACKLOG
TODO
IN_PROGRESS
IN_REVIEW
DONE
```

Tasks can be viewed in three different interfaces:

- Table
- Kanban
- Calendar

The Kanban board supports drag-and-drop task movement.

Task status and position changes are persisted through bulk updates so the board remains synchronized with the backend.

### Members

Workspace membership supports two roles:

```text
ADMIN
MEMBER
```

Administrators can update member roles and remove members.

Application rules prevent removing the final workspace member, while administrator permissions control member role changes and removals.

## Task Filtering

The task interface supports filtering by:

- status
- assignee
- project
- due date

Filters are reflected in application state and can be reset from the task interface.

## Analytics

Coordina provides analytics at both workspace and project level.

Tracked metrics include:

- total tasks
- assigned tasks
- completed tasks
- incomplete tasks
- overdue tasks

The application also compares the current month with the previous month to show changes in these metrics.

## Authentication

Coordina uses Auth.js with the MongoDB adapter.

Supported authentication methods are:

- email and password
- Google OAuth
- GitHub OAuth

Email and password accounts are persisted in MongoDB.

Passwords are hashed with bcrypt before being stored.

Authenticated API requests pass through shared session middleware before workspace, member, project, or task data can be accessed.

Workspace membership is checked server-side before protected resources are returned or modified.

## Demo Mode

The public application includes a dedicated demo workspace accessible directly from the sign-in page.

No account creation is required to explore it.

The demo contains example:

- members
- projects
- tasks
- workflow states
- analytics data

Unlike regular users, demo operations do not write application changes to MongoDB.

Demo mutations are stored in browser `localStorage`.

This allows visitors to:

- create tasks
- edit tasks
- move tasks across the Kanban board
- create projects
- edit projects
- modify workspace data

without affecting other users or production data.

## Backend API

The application exposes its internal API through a single Hono entry point under:

```text
/api
```

The primary route groups are:

```text
/api/current
/api/account
/api/workspaces
/api/members
/api/projects
/api/tasks
```

The API supports:

- authenticated queries
- resource creation
- updates
- deletion
- workspace authorization
- member authorization
- task filtering
- analytics
- Kanban bulk updates

Input validation is handled with Zod and `@hono/zod-validator`.

## MongoDB Migration

Coordina was originally implemented using Appwrite.

The application was later migrated away from that architecture.

The current system uses:

```text
MongoDB
    +
Mongoose
```

for application persistence.

Auth.js uses the MongoDB adapter for authentication-related data.

Workspace, project, member, task, and user data are stored through MongoDB-backed models.

Image storage was moved to Cloudinary.

This separates the main responsibilities into:

```text
MongoDB       -> application and authentication data
Auth.js       -> authentication and sessions
Cloudinary    -> workspace and project images
```

## Local Development

### Requirements

You need:

- Node.js
- npm
- a MongoDB database
- a Cloudinary account
- Google OAuth credentials if using Google sign-in
- GitHub OAuth credentials if using GitHub sign-in

Clone the repository:

```bash
git clone https://github.com/alessandro-arg/coordina.git
cd coordina
```

Install dependencies:

```bash
npm install
```

Create:

```text
.env.local
```

Add the required environment variables:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

MONGODB_URI=

AUTH_SECRET=

AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the Next.js development server |
| `npm run build` | Create a production build            |
| `npm run start` | Start the production server          |
| `npm run lint`  | Run ESLint                           |

Before shipping changes:

```bash
npm run lint
npm run build
```

## Deployment

The public application is available at:

[coordina.alessandro-argenziano.com](https://coordina.alessandro-argenziano.com)

The production environment requires the MongoDB, Auth.js, OAuth, and Cloudinary environment variables used by the application.

## License

Coordina is open source and available under the [MIT License](LICENSE).

You are free to use, modify, and distribute the project in accordance with the terms of the license.
