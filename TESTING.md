# Integration Testing Guide

## Quick Start - Both Servers Running

✅ **Backend:** http://localhost:8080
✅ **Frontend:** http://localhost:5173
✅ **H2 Console:** http://localhost:8080/h2-console

## Manual Testing Checklist

### 1. List Tickets
- [ ] Open http://localhost:5173
- [ ] Should see "All Tickets" view
- [ ] Stats cards should display (might be 0 if no tickets created)
- [ ] Search bar and filter controls should be visible

### 2. Create Ticket
- [ ] Click "Report Issue" button
- [ ] Fill in form:
  - Title: "Test Ticket"
  - Description: "This is a test"
  - Category: Select any
  - Priority: Select any
  - Reported By: "test.user"
- [ ] Drag/drop an image or click upload zone
- [ ] Click "Submit"
- [ ] Should see success alert
- [ ] Should redirect to list view

### 3. View Ticket List
- [ ] Should now see the created ticket in the list
- [ ] Stats should update (1 total, 1 open, etc.)
- [ ] Should be able to search by title
- [ ] Should be able to filter by status

### 4. View Ticket Details
- [ ] Click on a ticket card
- [ ] Modal should open showing:
  - Ticket ID
  - Title and description
  - Category and priority badges
  - Status badge
  - Comments section
  - Images (if uploaded)
- [ ] Click outside modal to close

### 5. Delete Ticket
- [ ] Click delete button (trash icon) on a ticket card
- [ ] Ticket should be removed from list
- [ ] Stats should update

## Testing via Browser Console

### Get All Tickets
```javascript
fetch('http://localhost:8080/api/tickets')
  .then(r => r.json())
  .then(d => console.table(d))
```

### Get Statistics
```javascript
fetch('http://localhost:8080/api/tickets/stats')
  .then(r => r.json())
  .then(d => console.log('Stats:', d))
```

### Create Ticket
```javascript
const form = new FormData();
form.append('title', 'Browser Test');
form.append('description', 'Testing from browser console');
form.append('category', 'HARDWARE');
form.append('priority', 'MEDIUM');
form.append('reportedBy', 'console.test');

fetch('http://localhost:8080/api/tickets', {
  method: 'POST',
  body: form
})
.then(r => r.json())
.then(d => console.log('Created:', d))
```

## Testing Database

1. Open http://localhost:8080/h2-console
2. Login with:
   - JDBC URL: `jdbc:h2:file:./data/ticketdb`
   - Username: `sa`
   - Password: (leave blank)

3. Run SQL queries:
   ```sql
   -- View all tickets
   SELECT * FROM TICKETS;

   -- View all comments
   SELECT * FROM TICKET_COMMENTS;

   -- Count tickets by status
   SELECT STATUS, COUNT(*) FROM TICKETS GROUP BY STATUS;

   -- Get latest tickets
   SELECT * FROM TICKETS ORDER BY CREATED_AT DESC LIMIT 5;
   ```

## Postman Collection Import

Use these endpoints to test in Postman:

**GET - List Tickets**
```
GET http://localhost:8080/api/tickets?status=OPEN&priority=HIGH
```

**GET - Get Statistics**
```
GET http://localhost:8080/api/tickets/stats
```

**POST - Create Ticket**
```
POST http://localhost:8080/api/tickets
Content-Type: multipart/form-data

Form Data:
- title: "New Ticket"
- description: "Description here"
- category: "HARDWARE"
- priority: "HIGH"
- reportedBy: "john.doe"
- images: (select file)
```

**GET - Get Single Ticket**
```
GET http://localhost:8080/api/tickets/{id}
```

**PUT - Update Ticket**
```
PUT http://localhost:8080/api/tickets/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "PLUMBING",
  "priority": "CRITICAL"
}
```

**PUT - Assign Ticket**
```
PUT http://localhost:8080/api/tickets/{id}/assign
Content-Type: application/json

{
  "assignedTo": "jane.technician"
}
```

**PUT - Update Status**
```
PUT http://localhost:8080/api/tickets/{id}/status
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

**PUT - Reject Ticket**
```
PUT http://localhost:8080/api/tickets/{id}/reject
Content-Type: application/json

{
  "rejectionReason": "Cannot fix - hardware issue"
}
```

**POST - Add Comment**
```
POST http://localhost:8080/api/tickets/{id}/comments
Content-Type: application/json

{
  "text": "Started working on this",
  "author": "jane.technician",
  "authorRole": "TECHNICIAN"
}
```

**DELETE - Delete Comment**
```
DELETE http://localhost:8080/api/tickets/{id}/comments/{commentId}
```

## Performance Testing

### Test Large Dataset
```javascript
// Create 50 tickets
async function createManyTickets() {
  for(let i = 0; i < 50; i++) {
    const form = new FormData();
    form.append('title', `Ticket ${i}`);
    form.append('description', `Description ${i}`);
    form.append('category', ['HARDWARE','PLUMBING','ELECTRICAL'][i%3]);
    form.append('priority', ['LOW','MEDIUM','HIGH','CRITICAL'][i%4]);
    form.append('reportedBy', `user${i}`);
    
    try {
      await fetch('http://localhost:8080/api/tickets', {
        method: 'POST',
        body: form
      });
    } catch(e) {
      console.error(`Failed ticket ${i}:`, e);
    }
  }
  console.log('Created 50 tickets');
}

createManyTickets();
```

## Common Issues & Solutions

### Issue: 404 on API calls
**Solution:** Verify backend is running on port 8080
```bash
lsof -i :8080
```

### Issue: CORS errors
**Solution:** Ensure vite.config.js has correct proxy:
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:8080'
  }
}
```

### Issue: Images not uploading
**Solution:** Check file size < 5MB and ensure uploads directory exists:
```bash
mkdir -p uploads/tickets
```

### Issue: "Cannot GET /"
**Solution:** Verify frontend is running:
```bash
# In frontend directory
npm run dev
```

### Issue: H2 database locked
**Solution:** Close all connections and restart:
```bash
rm -rf data/
# Restart backend
```

## Load Testing

Use Apache Bench or similar tool:
```bash
# Install ab (comes with Apache)
ab -n 1000 -c 10 http://localhost:8080/api/tickets
```

Expected: Response times < 100ms for list operations

## Browser DevTools Tips

**Network Tab:**
- Monitor API requests
- Check response times
- Verify status codes (200, 201, 400, 404, 500)

**Console Tab:**
- Monitor for errors
- Test fetch requests
- Check database queries

**Storage Tab:**
- No local state currently stored
- Could add localStorage for filters/preferences

## Continuous Testing

### Watch Mode (Backend)
Spring Boot DevTools enabled - code changes trigger restart

### Hot Reload (Frontend)
Vite HMR enabled - save file to auto-reload in browser

## Cleanup & Reset

```bash
# Reset database
rm -rf data/              # Removes all tickets
mkdir -p uploads/tickets

# Restart servers
# Backend: Kill and re-run
# Frontend: Should auto-reload
```

## Success Criteria

✅ All endpoints return correct status codes
✅ Images upload successfully
✅ Search/filter works without lag
✅ Status transitions validate correctly
✅ Error messages are user-friendly
✅ Response times < 200ms for typical operations
✅ No console errors in browser
✅ Database persists data between restarts
