# 🚇 AI MetroFlow: Crowd Management & Scheduling Platform

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Platform](https://img.shields.io/badge/Platform-Web-blue)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20MongoDB-blueviolet)

> **Developed as a capstone project for the Infosys Springboard Internship.**

AI MetroFlow is an advanced, AI-powered web application designed to solve real-world urban transit problems. It helps Metro administrators monitor live passenger crowds, predict future congestion using Machine Learning, and dynamically adjust train schedules to prevent overcrowding.

---

## 🌟 What Does This Project Do?

1. **Live Dashboard:** Monitors active trains, passenger counts, and delayed schedules in real-time.
2. **AI Delay & Demand Prediction:** Uses Machine Learning (`scikit-learn` Random Forest models) to predict if a train will be delayed and forecasts how many passengers will arrive at a station at a given time.
3. **Congestion Heatmap:** A visual map showing exactly which stations are overcrowded (Red/Orange/Yellow/Green indicators).
4. **Automated Scheduling:** If the AI detects heavy crowds, administrators can use the system to automatically calculate new train dispatch frequencies (e.g., sending a train every 5 minutes instead of 15).
5. **Real-Time Alerts:** Uses WebSockets to instantly broadcast emergency notifications (like "Weather Delays") to all connected screens without refreshing the page.
6. **AI Assistant Chatbot:** A built-in virtual assistant that operators can interact with to quickly query station metrics, ask about system status, and get AI-driven insights on demand.

---

## 💻 Tech Stack Used

*   **Frontend User Interface:** React.js, Vite, Tailwind CSS (Glassmorphism design), Recharts (for graphs)
*   **Backend API Server:** Python, FastAPI, WebSockets
*   **Database:** MongoDB (using Motor for async connections)
*   **Artificial Intelligence:** Python Pandas, Scikit-Learn

---

## 🛠️ Step-by-Step Installation Guide

Follow these exact steps to run the project on your local Windows computer.

### Step 1: Install Prerequisites
Before you start, make sure you have installed:
1. **Node.js** (Download from nodejs.org)
2. **Python 3.10+** (Download from python.org)
3. **MongoDB** (Download MongoDB Community Server and make sure it is running in the background)

---

### Step 2: Setup the Python Backend
The backend powers the database, the AI models, and the APIs.

1. Open a terminal (Command Prompt or PowerShell).
2. Navigate into the backend folder:
   ```cmd
   cd D:\Projects\Tejavardhan\AI_MetroFlow\backend
   ```
3. Create a virtual environment to hold the Python packages:
   ```cmd
   python -m venv venv
   ```
4. Activate the virtual environment:
   ```cmd
   venv\Scripts\activate
   ```
5. Install all required Python libraries:
   ```cmd
   pip install -r requirements.txt
   ```
6. Start the backend server:
   ```cmd
   uvicorn backend.main:app --reload --port 8000
   ```
*(Leave this terminal window open and running!)*

---

### Step 3: Setup the React Frontend
The frontend is the visual dashboard you interact with in your browser.

1. Open a **second, brand new terminal window**.
2. Navigate into the frontend folder:
   ```cmd
   cd D:\Projects\Tejavardhan\AI_MetroFlow\frontend
   ```
3. Install the required Node packages:
   ```cmd
   npm install
   ```
4. Start the frontend server:
   ```cmd
   npm run dev
   ```
5. Open your web browser and go to: **`http://localhost:5173`**

---

## 🔑 How to Log In (Test Accounts)

The system automatically creates three user accounts when you start the backend for the first time. Use these to log in:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@metroflow.com` | `admin123` |
| **Data Analyst** | `analyst@metroflow.com` | `analyst123` |
| **Metro Operator** | `operator@metroflow.com` | `operator123` |

*(Note: Log in as the **Administrator** to have full access to all pages, including the Admin Panel and Settings).*

---

## 📁 Project Folder Structure

If you need to explore the code, here is where everything lives:

```text
AI_MetroFlow/
│
├── backend/                  <-- Everything related to Python, DB, and AI
│   ├── datasets/             <-- Raw CSV data used to train the AI
│   ├── ml/                   <-- Saved AI prediction models
│   ├── models/               <-- Database structures (Users, Trains, etc.)
│   ├── routers/              <-- The API endpoints (URLs)
│   ├── main.py               <-- The core backend server file
│   └── database.py           <-- MongoDB connection and setup
│
├── frontend/                 <-- Everything related to the User Interface
│   ├── src/
│   │   ├── components/       <-- Reusable buttons, cards, and navbars
│   │   ├── pages/            <-- The main screens (Dashboard, Map, Login)
│   │   ├── App.jsx           <-- Routing configuration
│   │   └── index.css         <-- Global styles
│
└── docs/                     <-- Technical API manuals
```
