# Smart Campus - Module C: Maintenance & Incident Ticketing System

A complete full-stack ticket management system built with **Spring Boot** (backend) and **React + Vite** (frontend).

## Project Structure

```
it3030-paf-2026-smart-campus-group289_5.1/
├── backend/                          # Spring Boot 3.2.4 REST API
│   ├── src/main/java/com/campus/tickets/
│   │   ├── model/                   # JPA entities
│   │   │   ├── Ticket.java          # Main ticket entity
│   │   │   └── TicketComment.java   # Comment entity
│   │   ├── dto/                     # Data transfer objects
│   │   │   ├── TicketDTO.java       # API response/request
│   │   │   └── TicketStatsDTO.java  # Statistics aggregate
│   │   ├── repository/              # Data access layer
│   │   │   ├── TicketRepository.java
│   │   │   └── TicketCommentRepository.java
│   │   ├── service/                 # Business logic
│   │   │   ├── TicketService.java
│   │   │   └── FileStorageService.java
│   │   ├── controller/              # REST endpoints
│   │   │   └── TicketController.java
│   │   ├── exception/               # Error handling
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   └── ResourceNotFoundException.java
│   │   ├── config/                  # Configuration
│   │   │   └── WebConfig.java
│   │   └── TicketsApplication.java  # Main entry point
│   ├── src/main/resources/
│   │   └── application.properties   # Database & server config
│   ├── src/test/java/               # Unit tests
│   │   └── TicketServiceTest.java
│   ├── pom.xml                      # Maven configuration
│   └── target/tickets-1.0.0-SNAPSHOT.jar  # Executable JAR
│
└── frontend/                         # React + Vite application
    ├── src/
    │   ├── components/tickets/      # React components
    │   │   ├── TicketList.jsx       # List view with filters
    │   │   ├── TicketForm.jsx       # Create form with upload
    │   │   ├── TicketDetail.jsx     # Detail modal
    │   │   ├── TicketList.css
    │   │   ├── TicketForm.css
    │   │   └── TicketDetail.css
    │   ├── services/
    │   │   └── api.js               # API client
    │   ├── App.jsx                  # Root component
    │   ├── App.css
    │   ├── index.css                # Global design system
    │   └── main.jsx                 # Entry point
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── node_modules/
```

## Technology Stack

**Backend:**
- Java 17
- Spring Boot 3.2.4
- Spring Data JPA with Hibernate
- H2 Database (development) / MySQL (production)
- Maven 3.9+

**Frontend:**
- React 18.3.1+
- Vite 5.4.1+
- Vanilla JavaScript (ES6+)
- CSS3 with CSS Variables
- Fetch API

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+ & npm
- Maven (or use included ./mvnw wrapper)

### Backend Setup

1. **Build the application:**
   ```bash
   cd backend
   ./mvnw clean package
   ```

2. **Start the server:**
   ```bash
   java -jar target/tickets-1.0.0-SNAPSHOT.jar
   ```

   The backend will start on **http://localhost:8080**

3. **H2 Console (development):**
   - Access at: http://localhost:8080/h2-console
   - JDBC URL: `jdbc:h2:file:./data/ticketdb`
   - Username: `sa`
   - No password

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

   The frontend will start on **http://localhost:5173**

3. **Build for production:**
   ```bash
   npm run build
   ```

## API Documentation

### Base URL
```
http://localhost:8080/api/tickets
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/api/tickets` | List tickets (with filters: status, category, priority, search) |
| **POST** | `/api/tickets` | Create new ticket (multipart/form-data with images) |
| **GET** | `/api/tickets/stats` | Get statistics (counts by status/priority) |
| **GET** | `/api/tickets/{id}` | Get single ticket details |
| **PUT** | `/api/tickets/{id}` | Update ticket |
| **DELETE** | `/api/tickets/{id}` | Delete ticket |
| **PUT** | `/api/tickets/{id}/assign` | Assign technician |
| **PUT** | `/api/tickets/{id}/status` | Update status |
| **PUT** | `/api/tickets/{id}/reject` | Reject ticket |
| **PUT** | `/api/tickets/{id}/close` | Close ticket |
| **POST** | `/api/tickets/{id}/comments` | Add comment |
| **PUT** | `/api/tickets/{id}/comments/{cid}` | Edit comment |
| **DELETE** | `/api/tickets/{id}/comments/{cid}` | Delete comment |

### Sample Requests

**Create a ticket:**
```javascript
const formData = new FormData();
formData.append('title', 'Broken AC unit');
formData.append('description', 'AC in room 201 not cooling');
formData.append('category', 'HARDWARE');
formData.append('priority', 'HIGH');
formData.append('reportedBy', 'john.doe');
formData.append('images', fileInput.files[0]);
formData.append('images', fileInput.files[1]);

fetch('http://localhost:8080/api/tickets', {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(data => console.log(data));
```

**List tickets with filters:**
```javascript
fetch('http://localhost:8080/api/tickets?status=OPEN&priority=HIGH')
  .then(r => r.json())
  .then(data => console.log(data));
```

## Features

### Ticket Management
- ✅ Create tickets with title, description, category, priority
- ✅ Upload up to 3 images per ticket (max 5MB each)
- ✅ Filter tickets by status, category, priority
- ✅ Search tickets by title/description
- ✅ View ticket details with comments
- ✅ Assign technicians
- ✅ Update ticket status with validation
- ✅ Reject or close tickets
- ✅ Add, edit, delete comments

### UI Components
- ✅ Responsive list view with sorting & filtering
- ✅ Modal detail view with image gallery
- ✅ Form with drag-drop file upload
- ✅ Real-time search with debounce
- ✅ Statistics dashboard with status/priority counts
- ✅ Loading states and error handling
- ✅ Dark mode support (CSS variables)

### Backend
- ✅ RESTful API with proper HTTP status codes
- ✅ Request validation with meaningful error messages
- ✅ Transaction management with @Transactional
- ✅ CORS configuration for development
- ✅ File upload handling with validation
- ✅ Comprehensive exception handling
- ✅ JPA with automatic schema generation

## Database Schema

### Tables

**TICKETS**
- `id` (Long, PK)
- `title` (String, required)
- `description` (Text)
- `category` (Enum: HARDWARE, PLUMBING, ELECTRICAL, CLEANING, SECURITY, INTERNET, FURNITURE, OTHER)
- `priority` (Enum: LOW, MEDIUM, HIGH, CRITICAL)
- `status` (Enum: OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED)
- `reported_by` (String)
- `assigned_to` (String)
- `resolution_notes` (Text)
- `rejection_reason` (Text)
- `created_at`, `updated_at`, `resolved_at`, `assigned_at` (Timestamps)

**TICKET_COMMENTS**
- `id` (Long, PK)
- `ticket_id` (Long, FK)
- `text` (Text)
- `author` (String)
- `author_role` (Enum: USER, TECHNICIAN, ADMIN)
- `created_at`, `updated_at` (Timestamps)

## Status Transitions

```
OPEN → IN_PROGRESS (when assigned)
IN_PROGRESS → RESOLVED (when fixed)
IN_PROGRESS → REJECTED (with reason)
RESOLVED → CLOSED (after verification)
OPEN → REJECTED (if cannot fix)
```

## File Upload

- **Max file size:** 5 MB per image
- **Max request size:** 20 MB total
- **Max images per ticket:** 3
- **Supported:** images/* (image/jpeg, image/png, image/webp, etc.)
- **Storage location:** `uploads/tickets/`

## Configuration

### Backend (application.properties)
```properties
server.port=8080
spring.datasource.url=jdbc:h2:file:./data/ticketdb;AUTO_SERVER=TRUE
spring.jpa.hibernate.ddl-auto=update
spring.servlet.multipart.max-file-size=5MB
app.upload.dir=uploads/tickets
```

### Frontend (vite.config.js)
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:8080',
    '/uploads': 'http://localhost:8080'
  }
}
```

## Development Workflow

1. **Backend changes:**
   - Edit Java files
   - Restart with `java -jar` or use Spring Boot DevTools
   - Check logs for errors

2. **Frontend changes:**
   - Edit React/CSS files
   - Vite automatically reloads (HMR enabled)
   - Check browser console for errors

3. **Testing:**
   - Backend unit tests: `./mvnw test`
   - Manual API testing: use Postman or curl
   - Frontend unit tests: `npm test` (configure if needed)

## Production Deployment

### Switch to MySQL

Edit `application.properties` and uncomment the MySQL section:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campus_tickets?createDatabaseIfNotExist=true
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=your_password
```

### Build Frontend
```bash
npm run build  # Creates dist/ directory
```

### Deploy
- Serve `frontend/dist` with Nginx/Apache
- Run JAR on application server
- Configure environment variables for database/file paths

## Troubleshooting

### Backend won't start
- Check port 8080 is not in use: `lsof -i :8080`
- Ensure Java 17+: `java -version`
- Check logs for database connection errors

### Frontend shows "Cannot GET /"
- Ensure Vite dev server is running on port 5173
- Check browser console for API errors
- Verify proxy configuration in vite.config.js

### Images not uploading
- Check max file size (5MB per file)
- Verify `uploads/tickets/` directory exists
- Check file permissions
- Inspect network tab for error response

### CORS errors
- Verify `@CrossOrigin` on controller
- Check `WebConfig.java` CORS settings
- Ensure frontend runs on localhost:5173

## Support & Documentation

- **Spring Boot** docs: https://spring.io/projects/spring-boot
- **React** docs: https://react.dev
- **Vite** docs: https://vitejs.dev
- **H2 Database** docs: https://www.h2database.com

## License

This project is part of the IT3030 Smart Campus initiative.
