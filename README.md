# CTI Aggregator - Cyber Threat Intelligence Platform

A full-stack web application for aggregating and analyzing cyber threat intelligence data from multiple sources, powered by AI analysis.

## Prerequisites

Before running this application locally on Windows, ensure you have the following installed:

### 1. Node.js (v20 or higher)

1. Download Node.js from the official website: https://nodejs.org/
2. Choose the LTS (Long Term Support) version (v20.x or higher)
3. Run the installer and follow the installation wizard
4. Verify installation by opening Command Prompt or PowerShell and running:
   ```bash
   node --version
   npm --version
   ```

### 2. MongoDB

You have two options for MongoDB:

#### Option A: Install MongoDB Locally (Recommended for Development)

1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Choose "Windows" as your platform and download the MSI installer
3. Run the installer:
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service" (recommended)
   - Optionally install MongoDB Compass (GUI tool)
4. Verify installation by opening Command Prompt and running:
   ```bash
   mongod --version
   ```
5. MongoDB should start automatically as a Windows service. If not, you can start it manually:
   ```bash
   net start MongoDB
   ```

#### Option B: Use MongoDB Atlas (Cloud Database)

1. Go to https://www.mongodb.com/cloud/atlas and create a free account
2. Create a new cluster (free tier is available)
3. Create a database user with read/write permissions
4. Get your connection string from the Atlas dashboard
5. Use this connection string in your `.env` file (see Environment Variables section)

### 3. Git (for cloning the repository)

1. Download Git from: https://git-scm.com/download/win
2. Run the installer with default settings
3. Verify installation:
   ```bash
   git --version
   ```

## Installation Steps

### Step 1: Clone the Repository

Open Command Prompt or PowerShell and run:

```bash
git clone <your-repository-url>
cd <repository-folder-name>
```

Or download the ZIP file from GitHub and extract it to your desired location.

### Step 2: Install Dependencies

Navigate to the project folder and install all required packages:

```bash
npm install
```

This may take a few minutes to complete.

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory of the project. You can do this by:

1. Open the project folder in File Explorer
2. Right-click and create a new text file
3. Rename it to `.env` (remove the `.txt` extension)
4. Open it with a text editor (Notepad, VS Code, etc.)

Add the following environment variables to your `.env` file:

```env
# Required Variables
JWT_SECRET=your-super-secret-jwt-key-here
OPENAI_API_KEY=your-openai-api-key-here

# MongoDB Configuration (optional - defaults shown)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=cti_aggregator

# Server Port (optional - defaults to 5000)
PORT=5000

# Threat Intelligence API Keys (optional - for full functionality)
OTX_API_KEY=your-otx-api-key
VIRUSTOTAL_API_KEY=your-virustotal-api-key
ABUSECH_AUTH_KEY=your-abusech-auth-key
```

#### How to Get API Keys:

**JWT_SECRET:**
- Generate a random secure string. You can use any random string generator or create your own
- Example: `my-super-secret-key-12345` (use something more complex in production)

**OPENAI_API_KEY (Required):**
1. Go to https://platform.openai.com/
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key and copy it

**OTX_API_KEY (Optional - AlienVault OTX):**
1. Go to https://otx.alienvault.com/
2. Create a free account
3. Go to Settings > API Integration
4. Copy your API key

**VIRUSTOTAL_API_KEY (Optional):**
1. Go to https://www.virustotal.com/
2. Create a free account
3. Go to your profile settings
4. Copy your API key

**ABUSECH_AUTH_KEY (Optional):**
1. Go to https://abuse.ch/
2. Register for their services
3. Obtain your authentication key

### Step 4: Start MongoDB (if using local installation)

If MongoDB is not running as a service, start it manually:

```bash
# Open a new Command Prompt window and run:
mongod
```

Keep this window open while running the application.

### Step 5: Run the Application

#### Development Mode (with hot-reload):

```bash
npm run dev
```

#### Production Mode:

First, build the application:
```bash
npm run build
```

Then start the server:
```bash
npm run start
```

### Step 6: Access the Application

Open your web browser and navigate to:

```
http://localhost:5000
```

You should see the login page of the CTI Aggregator application.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the development server with hot-reload |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the production server |
| `npm run check` | Runs TypeScript type checking |

## Project Structure

```
project-root/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
│   └── index.html
├── server/              # Backend Express server
│   ├── db/              # Database configuration
│   ├── middleware/      # Express middleware
│   ├── routes.ts        # API routes
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
├── .env                 # Environment variables (create this)
├── package.json         # Project dependencies
└── README.md            # This file
```

## Troubleshooting

### "MongoDB connection failed"
- Ensure MongoDB is running (`net start MongoDB` or run `mongod`)
- Check if the `MONGODB_URI` in your `.env` file is correct
- If using MongoDB Atlas, ensure your IP is whitelisted

### "OPENAI_API_KEY is required"
- Make sure you have created the `.env` file in the root directory
- Verify the API key is correct and has no extra spaces

### "JWT_SECRET is required"
- Add `JWT_SECRET=your-secret-key` to your `.env` file

### "Port 5000 is already in use"
- Change the `PORT` in your `.env` file to another value (e.g., 3000)
- Or close the application using port 5000

### "cross-env is not recognized"
- Run `npm install` again to ensure all dependencies are installed

### Application not loading in browser
- Ensure the server is running (check the terminal for "serving on port 5000")
- Try clearing your browser cache
- Check for errors in the terminal where you ran `npm run dev`

## Tech Stack

- **Frontend:** React, TailwindCSS, Shadcn UI, React Query
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI Integration:** OpenAI API
- **Authentication:** JWT (JSON Web Tokens)
- **Build Tools:** Vite, TypeScript, esbuild

## Support

If you encounter any issues not covered in the troubleshooting section, please:
1. Check the console/terminal for error messages
2. Ensure all environment variables are correctly set
3. Verify all prerequisites are properly installed

## License

MIT License
