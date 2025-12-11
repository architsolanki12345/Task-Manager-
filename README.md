# Task Manager Trello MVP

A responsive task management web application similar to Trello, built with React, Tailwind CSS, and react-beautiful-dnd.

## Features

- 3-column board: To-Do, In-Progress, Completed
- Add, edit, delete tasks via modal
- Drag and drop tasks between boards
- Filter by priority and status
- Sort by creation date or due date
- Persist data in localStorage
- Load initial data from tasks.json

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Build for production: `npm run build`
5. Preview build: `npm run preview`

## Folder Structure

- `src/`: Source code
  - `App.jsx`: Main component
  - `main.jsx`: Entry point
  - `index.css`: Styles
  - `utils/`: Utility functions
- `public/`: Static assets
  - `tasks.json`: Initial tasks data
- `package.json`: Dependencies and scripts

## Deployment

Deploy to Vercel, Netlify, or GitHub Pages.

For GitHub Pages:
1. Build the project: `npm run build`
2. Deploy the `dist` folder

For Vercel/Netlify, connect the repository and deploy.

Live demo: [http://localhost:5173/]
GitHub: [link]
