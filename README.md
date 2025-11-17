# Teacher Dashboard

This is the **TEACHER-ONLY** version of the Q&A app.

## What Teachers Can Do:
- Create new questions with custom codes
- Auto-generate random codes
- View all created questions
- See how many students have responded
- Click "View Responses" to see individual student answers
- Delete questions when no longer needed
- Copy codes to share with students

## Deployment Instructions

### Quick Deploy to Vercel:
1. Go to **https://vercel.com** and log in
2. Click **"Add New..."** → **"Project"**
3. Upload this `teacher-app` folder to a new GitHub repository called `teacher-qa`
4. Import the repository in Vercel
5. Select **Vite** as the framework preset
6. Click **"Deploy"**
7. Your teacher app will be live at: `teacher-qa.vercel.app` (or similar)

### Important Security Note:
⚠️ **Keep this URL private!** Only share the teacher URL with yourself and other teachers. Students should ONLY have the student app URL.

---

## How to Use:
1. Create questions using "New Question" button
2. Copy the code and share it with students (via student app URL + code)
3. Students will submit answers through their separate app
4. View responses by clicking "View Responses" on any question

---

## Important Notes:
- This app is separate from the student dashboard
- Students cannot access this URL (you control who knows it)
- Responses are currently stored in memory (will reset on page refresh)
- For permanent storage, you'll need to add a database connection
- The two apps (student and teacher) will need to be connected via a shared database in the future
