# SCOPTIMA
### AI-Powered Supply Chain Decision Intelligence Platform

**SCOPTIMA** is a full-stack, AI-assisted supply chain analytics and decision intelligence platform designed to improve demand forecasting, inventory optimization, stockout risk assessment, and operational decision-making.

It combines machine learning, predictive analytics, interactive dashboards, and secure role-based authentication into a single application.

## Key Features

### 1. Interactive Dashboard
- Supply chain performance overview
- Real-time data-driven KPI summaries
- Demand and inventory trends
- Operational insights and visualizations

### 2. Demand Forecasting
- Machine learning-based demand predictions
- Actual vs. predicted demand visualization
- Forecast accuracy and error analysis
- Historical forecasting trends

### 3. Inventory Optimization
- Inventory health monitoring
- Critical, low, healthy, and excess stock classification
- Reorder-point insights
- Potential holding-cost savings

### 4. Stockout Risk Intelligence
- Machine learning-based stockout risk classification
- Stockout probability analysis
- Risk distribution and prediction evaluation
- High-risk inventory identification

### 5. Cost Savings Analysis
- Inventory holding-cost evaluation
- Excess inventory analysis
- Potential savings estimation
- Optimization opportunities

### 6. Model Performance
- Machine learning model evaluation
- Accuracy, MAE, RMSE, precision, recall, and F1-score metrics
- Baseline and available live performance comparisons
- Model monitoring dashboards

### 7. Comparison Mode
- Warehouse A vs. Warehouse B
- Product A vs. Product B
- Current vs. previous period
- Actual demand vs. forecast demand

### 8. Reports and Data Quality
- Business intelligence reports
- CSV export and printable reports
- Dataset completeness and validity checks
- Missing values, duplicate records, and data quality monitoring

### 9. Secure Authentication
- Email and password authentication
- Google OAuth
- GitHub OAuth
- Email OTP login
- JWT authentication using HTTPOnly cookies
- Role-based access control

## User Roles

| Feature | Analyst | Executive / Viewer |
|---|---|---|
| Dashboard | Full Access | Read Only |
| Demand Forecasting | Full Access | Read Only |
| Inventory Optimization | Full Access | Read Only |
| Stockout Risk | Full Access | Read Only |
| Cost Savings | Full Access | Read Only |
| Comparison | Full Access | Read Only |
| Reports | Access | Access |
| Model Performance | Access | Access |
| Data Quality | Access | Access |
| Run ML Analysis | Allowed | Restricted |
| CSV Upload | Allowed | Restricted |

Analyst registration requires an authorization code validated by the backend.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | CSS, Lucide Icons |
| Backend | Python, FastAPI |
| Database (Development) | SQLite, SQLAlchemy |
| Machine Learning | Scikit-learn, XGBoost, CatBoost |
| Data Processing | Pandas, NumPy |
| Authentication | JWT, Google OAuth, GitHub OAuth, Email OTP |
| Version Control | Git, GitHub |
| Deployment | Vercel (Planned) |

## Project Structure

```text
SCOPTIMA/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   ├── data/
│   ├── models/
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Running Locally

### Backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Configure environment variables in `backend/.env`, then start the API:

```bash
python -m uvicorn app.main:app --reload
```

Backend API documentation:

`http://localhost:8000/docs`

### Frontend

Open a second terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

`http://localhost:5173`

## Security

- Passwords are securely hashed.
- Authentication sessions use HTTPOnly cookies.
- Role-based authorization protects restricted API endpoints.
- Secrets and environment variables are excluded from version control.
- Analyst access requires additional authorization during registration.

## Future Enhancements

- Smart Alerts and Notification Center
- AI-powered Supply Chain Copilot
- What-if Simulation
- Advanced demand forecasting
- Automated anomaly detection
- Cloud database and production deployment
- Enhanced model monitoring

## Project Objective

The objective of SCOPTIMA is to transform complex supply chain data into meaningful, actionable insights using modern web technologies, machine learning, and business intelligence.

The platform demonstrates how AI-assisted analytics can support smarter inventory planning, improved demand forecasting, reduced operational risk, and cost-efficient supply chain decisions.

---

**Project:** SCOPTIMA  
**Category:** Full-Stack Web Development, Machine Learning, Supply Chain Analytics  
**Status:** Development / Deployment Preparation
