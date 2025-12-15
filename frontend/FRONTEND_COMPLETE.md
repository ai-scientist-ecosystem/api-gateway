# AI Scientist Ecosystem - Frontend Dashboard

Real-time Next.js dashboard for monitoring space weather, earthquakes, floods, tsunamis, and disaster alerts.

## 🎯 Features

### Implemented Pages
- ✅ **Dashboard** (`/`) - Overview with stats, latest alerts, system status
- ✅ **Alerts** (`/alerts`) - Comprehensive alert list with filtering and search
- ✅ **Earthquakes** (`/earthquakes`) - Real-time earthquake monitoring from USGS
- ✅ **Space Weather** (`/space-weather`) - Kp index monitoring from NOAA

### Components
- ✅ **AlertCard** - Display individual alert with severity badges
- ✅ **StatsCard** - Statistical metrics cards
- ✅ **RealTimeServiceStatus** - Live health check for all microservices
- ✅ **ServiceStatus** - Static service status display

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Backend services running (see [infra/README.md](../infra/README.md))
- API Gateway running on port 8085

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🔌 API Integration

Frontend connects to backend via API Gateway:
- **Base URL**: `http://localhost:8085`
- **Endpoints**:
  - `GET /api/alerts` - All alerts
  - `GET /api/alerts/critical` - Critical alerts only
  - `GET /api/alerts/severity/{severity}` - Filter by severity
  - `GET /api/earthquakes/recent?hours=24` - Recent earthquakes
  - `GET /actuator/health` - Service health checks

## 📊 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR (with auto-refresh)
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with nav
│   ├── page.tsx            # Dashboard homepage
│   ├── globals.css         # Global styles
│   ├── alerts/
│   │   └── page.tsx        # Alerts page
│   ├── earthquakes/
│   │   └── page.tsx        # Earthquakes page
│   └── space-weather/
│       └── page.tsx        # Space weather page
├── components/
│   ├── AlertCard.tsx       # Alert display component
│   ├── StatsCard.tsx       # Stats display component
│   ├── ServiceStatus.tsx   # Static service status
│   └── RealTimeServiceStatus.tsx  # Live health checks
├── lib/
│   ├── types.ts           # TypeScript interfaces
│   └── api.ts             # API utility functions
└── package.json
```

## 🎨 Design System

### Color Palette
- Background: `gray-950`
- Cards: `gray-900/50` with `border-gray-800`
- Text: `gray-100` (primary), `gray-400` (secondary)

### Severity Colors
- **EXTREME**: Red (`red-500`)
- **SEVERE**: Orange (`orange-500`)
- **STRONG**: Yellow (`yellow-500`)
- **MODERATE**: Blue (`blue-500`)
- **MINOR**: Green (`green-500`)

### Kp Index Scale
- **0-3**: QUIET (Green)
- **4**: MINOR (Blue)
- **5-6**: MODERATE (Yellow)
- **7-8**: SEVERE (Orange)
- **9**: EXTREME (Red)

## 🔄 Real-time Updates

- **Dashboard**: Auto-refresh every 30 seconds
- **Alerts Page**: Auto-refresh every 10 seconds
- **Earthquakes**: Auto-refresh every 60 seconds
- **Space Weather**: Auto-refresh every 60 seconds
- **Service Status**: Health checks every 30 seconds

## 🚨 Troubleshooting

### "Failed to load alerts"
- Ensure API Gateway is running: `http://localhost:8085/actuator/health`
- Check data-collector service: `http://localhost:8082/actuator/health`
- Check alert-engine service: `http://localhost:8083/actuator/health`

### Services show "DOWN"
- Start infrastructure: `cd infra && docker-compose up -d`
- Wait 30-60 seconds for services to be healthy
- Check Eureka: `http://localhost:8761` (admin/admin)

### "No data available"
- Wait for schedulers to trigger (2-15 minutes depending on data source)
- Trigger manual collection:
  ```powershell
  curl -X POST http://localhost:8082/api/v1/collector/collect/kp-index
  curl -X POST http://localhost:8082/api/v1/collector/collect/cme
  ```

## 📝 Next Steps

### Planned Features
- [ ] WebSocket integration for real-time push updates
- [ ] Charts/Graphs for historical data visualization
- [ ] Map view for earthquake locations
- [ ] Aurora forecast visualization
- [ ] User authentication and preferences
- [ ] Alert subscriptions and notifications
- [ ] Mobile responsive improvements
- [ ] Dark/Light theme toggle
- [ ] Export data to CSV/JSON

---

**Part of the AI Scientist Ecosystem** - Protecting humanity through early warning systems 🛡️
