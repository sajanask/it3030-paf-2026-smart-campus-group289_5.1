# Quick Reference Guide

## Smart Campus - Ticketing System

**Project Root:** `/Users/sajana/Desktop/it3030-paf-2026-smart-campus-group289_5.1/`

---

## 🚀 Quick Start (2 minutes)

### Already Running?
- Backend: http://localhost:8080 ✅
- Frontend: http://localhost:5173 ✅
- Just open your browser to http://localhost:5173

### Need to Restart?

**Terminal 1 - Backend:**
```bash
cd backend
java -jar target/tickets-1.0.0-SNAPSHOT.jar
# Or: ./mvnw spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev --legacy-peer-deps
```

**Browser:**
```
http://localhost:5173
```

---

## 📋 What You Can Do

| Feature | Steps |
|---------|-------|
| **View Tickets** | Open http://localhost:5173 → "All Tickets" |
| **Create Ticket** | Click "Report Issue" → Fill form → Upload images (optional) → Submit |
| **Search** | Type in search box (auto-searches title & description) |
| **Filter** | Click status chips (OPEN, IN_PROGRESS, etc.) |
| **Sort** | Select "Latest"/"Oldest"/"Priority" in dropdown |
| **View Details** | Click any ticket card → See full info & comments |
| **Delete** | Click trash icon on ticket card |

---

## 🔧 API Quick Reference

**Base URL:** `http://localhost:8080/api/tickets`

### GET Requests
```bash
# List all tickets
curl http://localhost:8080/api/tickets

# List with filters
curl "http://localhost:8080/api/tickets?status=OPEN&priority=HIGH"

# Get one ticket
curl http://localhost:8080/api/tickets/1

# Get statistics
curl http://localhost:8080/api/tickets/stats
```

### POST: Create Ticket
```bash
curl -X POST http://localhost:8080/api/tickets \
  -F 'title=Broken Printer' \
  -F 'description=Printer in room 201 not working' \
  -F 'category=HARDWARE' \
  -F 'priority=HIGH' \
  -F 'reportedBy=john.doe@example.com' \
  -F 'images=@/path/to/image.jpg'
```

### PUT: Update Status
```bash
curl -X PUT http://localhost:8080/api/tickets/1/status \
  -H 'Content-Type: application/json' \
  -d '{"status":"IN_PROGRESS"}'
```

### PUT: Assign Technician
```bash
curl -X PUT http://localhost:8080/api/tickets/1/assign \
  -H 'Content-Type: application/json' \
  -d '{"assignedTo":"jane.tech@example.com"}'
```

### DELETE: Delete Ticket
```bash
curl -X DELETE http://localhost:8080/api/tickets/1
```

---

## 🗄️ Database Access

**H2 Console:** http://localhost:8080/h2-console

Login:
- **JDBC URL:** `jdbc:h2:file:./data/ticketdb`
- **Username:** `sa`
- **Password:** (leave blank)

### Useful SQL Queries

```sql
-- View all tickets
SELECT * FROM TICKETS ORDER BY CREATED_AT DESC;

-- Count by status
SELECT STATUS, COUNT(*) AS Count FROM TICKETS GROUP BY STATUS;

-- View comments for ticket
SELECT * FROM TICKET_COMMENTS WHERE TICKET_ID = 1;

-- Delete all data (reset)
DELETE FROM TICKET_COMMENTS;
DELETE FROM TICKETS;
```

---

## 📁 Key File Locations

```
Backend:
  Main App:    backend/src/main/java/com/campus/tickets/TicketsApplication.java
  Config:      backend/src/main/resources/application.properties
  Database:    ./data/ticketdb
  Built JAR:   backend/target/tickets-1.0.0-SNAPSHOT.jar

Frontend:
  Main App:    frontend/src/App.jsx
  List View:   frontend/src/components/tickets/TicketList.jsx
  Form:        frontend/src/components/tickets/TicketForm.jsx
  Detail View: frontend/src/components/tickets/TicketDetail.jsx
  Styles:      frontend/src/index.css (global)
  API Client:  frontend/src/services/api.js
  Config:      frontend/vite.config.js

Docs:
  README:      ./README.md
  Architecture: ./ARCHITECTURE.md
  Testing:     ./TESTING.md
  Completion:  ./COMPLETION.md
```

---

## 🟢 Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK - Success | GET list, POST create |
| 201 | Created | POST new ticket |
| 204 | No Content | DELETE success |
| 400 | Bad Request | Invalid data |
| 404 | Not Found | Ticket doesn't exist |
| 413 | File Too Large | Image > 5MB |
| 500 | Server Error | Check logs |

---

## 🔴 Common Issues & Fixes

### "Cannot connect to localhost:8080"
```bash
# Check if backend is running
lsof -i :8080

# Start backend if not running
cd backend && java -jar target/tickets-1.0.0-SNAPSHOT.jar
```

### "CORS error" in browser console
- Backend is running ✓
- Check vite.config.js proxy settings ✓
- Clear browser cache and hard refresh (Cmd+Shift+R) ✓

### "Vite refresh not working"
- Ensure npm install completed: `npm install --legacy-peer-deps`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install --legacy-peer-deps`

### "Image upload fails"
- File must be < 5MB
- File must be an image (jpeg, png, webp, etc.)
- Max 3 images per ticket

### "Database locked"
```bash
# Delete database and restart backend
rm -rf data/
# Restart backend - database will be recreated
```

### "Port 8080 already in use"
```bash
# Find what's using port 8080
lsof -i :8080

# Kill the process (if it's old java process)
kill -9 <PID>
```

### "Port 5173 already in use"
```bash
# Find what's using port 5173
lsof -i :5173

# Kill or use different port
# npm run dev -- --port 5174
```

---

## 📊 Categories & Status

### Ticket Categories
- HARDWARE
- PLUMBING
- ELECTRICAL
- CLEANING
- SECURITY
- INTERNET
- FURNITURE
- OTHER

### Ticket Priority
- LOW
- MEDIUM
- HIGH
- CRITICAL

### Ticket Status
- OPEN (new)
- IN_PROGRESS (being worked on)
- RESOLVED (fixed)
- CLOSED (verified by reporter)
- REJECTED (cannot fix)

---

## 🎨 Color Scheme

| Element | Color |
|---------|-------|
| Primary | Indigo (#6366f1) |
| Success | Emerald (#10b981) |
| Danger | Red (#ef4444) |
| Warning | Amber (#f59e0b) |
| Info | Blue (#3b82f6) |

---

## 📱 Responsive Design

**Mobile:** Works on phones (< 480px)
**Tablet:** Optimized for tablets (480-768px)
**Desktop:** Full experience (> 768px)

---

## ⌨️ Useful Commands

### Backend Commands
```bash
cd backend

# Compile only (no run)
./mvnw compile

# Run tests
./mvnw test

# Build JAR
./mvnw clean package

# Run with Spring Boot Maven plugin
./mvnw spring-boot:run

# Run JAR directly
java -jar target/tickets-1.0.0-SNAPSHOT.jar
```

### Frontend Commands
```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Verification
```bash
# Run verification script
sh verify.sh
```

---

## 🔐 Security Notes

**Current:** Development mode (no auth)
**For Production:** 
- Add Spring Security
- Implement user authentication
- Add role-based access control
- Use HTTPS/TLS
- Validate all inputs
- Implement rate limiting

---

## 📞 Support Resources

1. **README.md** - Full project overview
2. **ARCHITECTURE.md** - System design details
3. **TESTING.md** - Comprehensive testing guide
4. **COMPLETION.md** - What was delivered
5. **Code Comments** - Implementation details

---

## 🎯 Most Common Tasks

### Task 1: Create a Ticket
1. Click "Report Issue"
2. Fill title & description
3. Select category & priority
4. Enter reporter name
5. Optionally upload images (max 3, max 5MB each)
6. Click "Submit"

### Task 2: Find a Ticket
1. Use search box (searches title & description)
2. Use status filter chips
3. Use sort dropdown
4. Click ticket to view details

### Task 3: Test API
```bash
# In browser developer console:
fetch('http://localhost:8080/api/tickets')
  .then(r => r.json())
  .then(d => console.table(d))
```

### Task 4: View Database
1. Open http://localhost:8080/h2-console
2. Login (sa / no password)
3. Run SQL queries
4. View TICKETS and TICKET_COMMENTS tables

---

## 📈 Performance Tips

- **Search:** Built-in debounce (300ms delay)
- **Images:** Lazy loaded when scrolling to ticket
- **API:** Use filters to reduce data transfer
- **Database:** Indexed on status, category, priority, created_at

---

## 🛠️ Development Workflow

1. **Backend changes:** Edit Java files → Auto-reload with DevTools
2. **Frontend changes:** Edit React/CSS → Instant HMR refresh in browser
3. **Database changes:** Update entity → Schema auto-updates (ddl-auto=update)
4. **Config changes:** Update application.properties → Restart needed

---

## 📝 Example Workflows

### Workflow: Report a Maintenance Issue
1. Open http://localhost:5173
2. See "All Tickets" with current count
3. Click "Report Issue"
4. Fill: "Broken AC in Building A", select HARDWARE/HIGH
5. Drag image of broken AC
6. Submit
7. See your ticket in the list!

### Workflow: Assign & Track
1. List shows: "AC Repair" ticket (OPEN)
2. Click to view details
3. (API would assign to technician)
4. (API would update status to IN_PROGRESS)
5. (Comments show progress)
6. Eventually RESOLVED, then CLOSED

### Workflow: Search & Filter
1. Type "AC" in search → Shows matching tickets
2. Click "OPEN" chip → Shows only open tickets
3. Click "CRITICAL" sort → Orders by priority
4. Combination use: Filter → Sort → Search

---

**Happy Testing!** 🎉

For more details, see:
- README.md for setup & features
- ARCHITECTURE.md for system design
- TESTING.md for test examples
