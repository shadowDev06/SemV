# Practical 5: Set up the React development environment

This practical configures React with Vite. The starter app renders a React component and uses a counter to verify that the setup compiles JSX and handles updates in the browser.

## Run the frontend

1. Install Node.js 24 with npm. Open a terminal in this practical folder.
2. Enter the React project, install its dependencies, and start Vite:

   ```powershell
   Set-Location -LiteralPath 'my-react-app'
   npm ci --include=dev
   npm run dev
   ```

3. Open the **Local** URL printed by Vite and click the counter. There is no separate backend.
4. To check the production build, stop Vite with Ctrl+C and run `npm run build`.
