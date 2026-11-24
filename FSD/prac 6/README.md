# Practical 6: React fundamentals

This app uses JSX to render student cards. Each card is a component that receives its name and course through props, and React uses the student ID as the list key. A counter and a controlled form demonstrate state and event handlers.

## Run the frontend

1. Install Node.js 24 with npm and open a terminal in this folder.
2. Install dependencies and start Vite:

   ```powershell
   npm ci --include=dev
   npm run dev
   ```

3. Open the **Local** URL printed by Vite. Click **Increase**, then enter a name and submit the form to see the greeting. There is no separate backend.
4. To check the production build, stop Vite with Ctrl+C and run `npm run build`.
