# Experiment 11 — Online Resume / CV using Node.js and MongoDB

## Aim
To develop an Online Resume/CV application using Node.js and MongoDB and demonstrate Create, Read, Update, and Delete (CRUD) operations on resume records.

## Project structure
- `public/index.html` — Online Resume/CV user interface
- `public/style.css` — Responsive styling
- `public/app.js` — Browser-side form and CRUD interactions
- `api/resume.js` — Node.js API using the MongoDB Node.js driver
- `vercel.json` — Vercel serverless function configuration

## Important: database setup
This project uses MongoDB Atlas so the database can be reached by a Vercel deployment. A local MongoDB URL such as `mongodb://127.0.0.1:27017` will not work for a public Vercel deployment.

1. Create a free MongoDB Atlas cluster at https://www.mongodb.com/atlas.
2. Create a database user and password.
3. In Atlas Network Access, configure access for your environment. For a quick classroom test, `0.0.0.0/0` allows access from any IP, so use a strong database password and follow your institution's security guidance. Restrict access where possible.
4. Copy the Atlas connection string. Replace the username and password placeholders with your database user's credentials. URL-encode special characters in the password.
5. In Vercel, open the project → Settings → Environment Variables. Add:
   - `MONGODB_URI` = your Atlas connection string
   - `MONGODB_DB` = `OnlineResumeDB`
6. Redeploy the project after adding environment variables.

Do not put the real connection string in frontend JavaScript, commit it to GitHub, or share it publicly.

## Run locally on macOS
Prerequisites: Node.js and a MongoDB Atlas connection string.

1. Open this folder in VS Code.
2. In Terminal, run:
   ```bash
   npm install
   npx vercel login
   ```
3. Create a local `.env` file from `.env.example` and add your real values. Never commit `.env`.
4. Run:
   ```bash
   npx vercel dev
   ```
5. Open the local URL shown by Vercel CLI, usually `http://localhost:3000`.

## Push to GitHub
Upload the contents of this folder to the root of your repository, so `api/`, `public/`, `package.json`, and `vercel.json` are at the top level. Do not upload `.env` or `node_modules`.

## Deploy on Vercel
1. Import the GitHub repository into Vercel.
2. Keep Framework Preset as **Other** and Root Directory as `./`.
3. The project uses `public/` for static files and `api/resume.js` as a serverless API route.
4. Add `MONGODB_URI` and `MONGODB_DB` in Environment Variables.
5. Deploy or redeploy. Test by creating a resume, refreshing the page, editing it, and deleting it.

## CRUD mapping
- Create — `POST /api/resume` → `insertOne()`
- Read — `GET /api/resume` → `find()`
- Update — `PUT /api/resume` → `updateOne()`
- Delete — `DELETE /api/resume?id=...` → `deleteOne()`

## Expected result
The application connects to MongoDB Atlas and allows the user to create, display, update, and delete resume records.

## Academic note
This project adapts the uploaded Experiment 11 instructions from student records to resume/CV records. Replace example information with your own accurate details before submission.
