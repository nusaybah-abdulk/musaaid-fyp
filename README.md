# Musāʿid: A Revision Platform for the Madinah Arabic Series

## Project Overview
Musāʿid is a web-based revision platform designed to support learners using the Madinah Arabic Series. It focuses on helping users revise grammar and vocabulary through structured lessons, quizzes, and feedback.

Key features include:
- Lesson summaries 
- Quizzes with immediate feedback (different mode such as adaptive & wrong-answer only)
- Progress tracking and topic mastery
- AI-assisted Arabic sentence checker



## Submitted Material
This repo contains:
- React frontend source code
- Firebase configuration files
- Helper functions for quiz logic and dashboard analytics
- Firebase Cloud Function for the sentence checker
- Lesson and question content
- Unit tests for core logic
- CSS styling files
- This README file with setup instructions


## Main Technologies
- React
- JS
- Vite
- Firebase Authentication
- Firestore
- Firebase Functions
- OpenAI API
- Vitest

## Project Structure
functions/              # Firebase Cloud Function backend
index.js              # Sentence checker function
package.json          # Backend dependencies

src/
app/                  # React Router configuration
routes.jsx
components/           # Reusable UI components
content/              # Lesson content and questions
layouts/              # Shared layout
lib/                  # Firebase setup + helper functions
pages/                # Main pages
styles/               # CSS files
tests/                # Unit tests
main.jsx              # React entry point

index.html              # HTML entry point
firebase.json           # Firebase config
package.json            # Frontend dependencies
vite.config.js          # Vite config
README.md               # Project explanation

## How to Run the Porject
1. Install dependencies: npm install
2. Start development server: npm run dev
3. Then open the local URL shown in the terminal

## How to Run tests
1. npm test (only after installing dependencies)


## Sentence Checker Setup

The sentence checker feature requires an OpenAI API key which is not included for security reasons.

A `.env.example` file is included to show the required format.

To enable the sentence checker:

1. Create a `.env` file in the functions folder
2. Copy the structure from `.env.example`.
3. Restart the development server. (npm run dec)

**Note:** If no API key is provided, the sentence checker feature will not function.
