# CTI Aggregator - Cyber Threat Intelligence Dashboard

## Overview

The CTI Aggregator is a comprehensive cybersecurity threat intelligence dashboard that aggregates, displays, and analyzes threat data from multiple open-source intelligence (OSINT) sources. The application provides security analysts with a centralized platform to monitor indicators of compromise (IOCs), CVE vulnerabilities, phishing domains, and other cybersecurity threats in real-time.

**Core Purpose**: Centralized monitoring, analysis, and reporting of cybersecurity threats from sources like AlienVault OTX, VirusTotal, PhishTank, Abuse.ch feeds, and CISA KEV database.

**Key Features**:
- Real-time threat intelligence dashboard with KPI metrics
- IOC database with advanced filtering and search capabilities
- CVE vulnerability tracking with CVSS scoring
- Analytics and trend visualization
- Threat feed aggregation from multiple OSINT sources
- Background data fetching and caching system

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript, using functional components and hooks pattern

**Routing**: Wouter for lightweight client-side routing (SPA architecture)

**State Management**:
- TanStack Query (React Query) for server state management with automatic caching and background refetching
- Local component state with useState/useEffect for UI state
- No global state management library (Redux/Zustand) - relies on React Query's caching

**UI Component System**:
- shadcn/ui component library built on Radix UI primitives
- Custom styling with Tailwind CSS using "New York" style preset
- Dark theme as primary design with Material Design-inspired data visualization
- Custom CSS variables for theme customization (HSL color space)

**Data Visualization**:
- Recharts library for all charts (line charts, bar charts, pie/doughnut charts)
- Responsive container patterns for adaptive layouts

**Design Rationale**: Dark theme chosen specifically for 24/7 security operations to reduce eye strain during extended monitoring sessions. Information-dense layout optimized for professional security platforms.

### Backend Architecture

**Runtime**: Node.js with Express.js REST API server

**API Design Pattern**: RESTful endpoints with JSON responses

**Data Flow**:
1. Background fetcher service runs periodically (1-hour intervals by default)
2. Fetches threat intelligence from multiple OSINT APIs
3. Processes and caches data in-memory
4. Frontend requests data from Express API endpoints
5. Express serves cached data with filtering/pagination logic

**Data Fetching Strategy**:
- `ThreatIntelligenceFetcher` class handles all external API integrations
- Background thread continuously updates cached data
- In-memory caching reduces API rate limit issues
- Mock data fallback system for development without API keys

**API Endpoints Structure**:
- `/api/dashboard/*` - Dashboard statistics and recent threats
- `/api/threat-feeds` - IOC database with query parameters for filtering
- `/api/cve-reports` - CVE vulnerability data with search
- `/api/analytics/*` - Analytics metrics and trend data
- `/api/settings/*` - Configuration and source management

**Authentication**: Currently uses in-memory session storage with connect-pg-simple (prepared for PostgreSQL sessions but using memory store)

**Error Handling**: Try-catch blocks with error state management, user-friendly error messages displayed in UI

### Data Storage Solutions

**Current Implementation**: In-memory caching (JavaScript Map/Object storage)

**Database Schema Prepared**: 
- Drizzle ORM configured for PostgreSQL
- User schema defined with UUID primary keys
- Migration system configured but database optional for current functionality

**Storage Strategy**:
- Threat intelligence data cached in `cachedData` object with timestamp tracking
- User sessions stored in memory (MemStorage class)
- No persistent database required for threat data (always fetched fresh from OSINT sources)

**Rationale**: Threat intelligence is ephemeral and time-sensitive. Real-time fetching from authoritative sources ensures data freshness. In-memory caching provides fast read access while avoiding stale database records.

### External Dependencies

**OSINT Threat Intelligence Sources**:
- **AlienVault OTX** - Threat pulses and indicators (requires API key: `OTX_API_KEY`)
- **VirusTotal** - File/URL/domain reputation (requires API key: `VIRUSTOTAL_API_KEY`)
- **PhishTank** - Phishing domain database (optional API key: `PHISHTANK_API_KEY`)
- **Abuse.ch** - Multiple feeds (MalwareBazaar, URLhaus, ThreatFox) - public access
- **NVD (NIST)** - CVE vulnerability database - public API
- **CISA KEV** - Known Exploited Vulnerabilities catalog - public feed

**API Integration Approach**:
- Axios for HTTP requests with timeout handling
- Environment variables for API key management (.env file)
- Graceful degradation when API keys missing (logs errors, continues with available sources)
- Rate limiting awareness (background fetcher intervals configurable)

**Frontend Libraries**:
- `@tanstack/react-query` - Server state management
- `recharts` - Data visualization
- `axios` - HTTP client
- `wouter` - Routing
- `date-fns` - Date manipulation
- `@radix-ui/*` - Headless UI primitives
- `lucide-react` - Icon library
- `react-hook-form` + `zod` - Form handling and validation

**Backend Libraries**:
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `drizzle-orm` + `@neondatabase/serverless` - Database ORM (optional)
- `connect-pg-simple` - Session storage adapter

**Build & Development Tools**:
- Vite - Frontend build tool with HMR
- esbuild - Backend bundling for production
- TypeScript - Type safety across frontend and backend
- Tailwind CSS - Utility-first styling
- PostCSS - CSS processing

**Replit-Specific Integrations**:
- `@replit/vite-plugin-runtime-error-modal` - Development error overlay
- `@replit/vite-plugin-cartographer` - Code navigation
- `@replit/vite-plugin-dev-banner` - Development environment banner

**Environment Variables Required**:
```
DATABASE_URL (optional - for PostgreSQL if needed)
OTX_API_KEY (recommended - AlienVault OTX)
VIRUSTOTAL_API_KEY (recommended - VirusTotal)
PHISHTANK_API_KEY (optional - better rate limits)
```

**Monorepo Structure**:
- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Shared TypeScript types and schemas
- `/migrations` - Drizzle database migrations (if using PostgreSQL)