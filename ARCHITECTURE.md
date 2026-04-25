# Architecture & Design Document

## Project Overview

**Smart Campus - Module C: Maintenance & Incident Ticketing System**

A full-stack web application for managing facility maintenance and incident tickets. Users can report issues, track resolution progress, and technicians can manage assignments and updates.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                         │
│                    (Single Page App)                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                    HTTP REST API (JSON)
                               │
┌──────────────────────────────┴──────────────────────────────┐
│          Vite Development Server (Port 5173)                │
│  (Dev-only: proxies /api to backend, serves static assets)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                    API Proxy: /api/*
                               │
┌──────────────────────────────┴──────────────────────────────┐
│         Spring Boot REST API Server (Port 8080)             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  TicketController  (HTTP Endpoints)                  │   │
│  └────────────────┬───────────────────────────────────┬─┘   │
│                   │                                   │      │
│  ┌────────────────▼─────────────────┐  ┌────────────▼───┐   │
│  │  TicketService  (Business Logic) │  │ FileStorage    │   │
│  │  - CRUD operations               │  │ Service        │   │
│  │  - Workflow management           │  │ (Image Upload) │   │
│  │  - Validation & transitions      │  └────────────┬───┘   │
│  └────────────────┬─────────────────┘               │       │
│                   │                                 │       │
│  ┌────────────────▼─────────────────┐  ┌──────────▼──────┐ │
│  │  TicketRepository                │  │ File System     │ │
│  │  TicketCommentRepository         │  │ (/uploads/)     │ │
│  └────────────────┬─────────────────┘  └─────────────────┘ │
│                   │                                         │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │ H2 Database (Development)                            │   │
│  │ or MySQL (Production)                                │   │
│  │                                                      │   │
│  │  Tables: TICKETS, TICKET_COMMENTS                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture (React + Vite)

### Technology Stack
- **React 18.3.1:** Component-based UI
- **Vite 5.4.1:** Lightning-fast build tool and dev server
- **Fetch API:** Simple HTTP client (no external dependencies)
- **CSS3:** Custom styles with CSS variables for theming

### Component Hierarchy

```
App.jsx (Root)
├── Navigation Bar
│   └── Logo, View Switcher
├── Main Content (View-based Routing)
│   ├── TicketList.jsx (default view)
│   │   ├── StatCard (x4 stats)
│   │   ├── Controls (search, filters, sort)
│   │   └── TicketCard Grid
│   │       └── TicketCard (clickable)
│   └── TicketForm.jsx ("Report Issue" view)
│       ├── Form Fields (title, description, category, priority)
│       ├── Image Upload Zone (drag-drop)
│       ├── Image Preview List
│       └── Submit Button
└── TicketDetail.jsx (Modal Overlay)
    ├── Modal Header
    ├── Details Section
    ├── Comments Section
    └── Images Gallery
```

### State Management

**App.jsx holds view state:**
```javascript
const [view, setView] = useState('list');      // 'list' or 'form'
const [selectedTicketId, setSelectedTicketId] = useState(null);
```

**TicketList.jsx holds list state:**
```javascript
const [tickets, setTickets] = useState([]);
const [stats, setStats] = useState({});
const [filters, setFilters] = useState({ status: '' });
const [searchQuery, setSearchQuery] = useState('');
const [sortBy, setSortBy] = useState('latest');
const [loading, setLoading] = useState(false);
```

**TicketForm.jsx holds form state:**
```javascript
const [form, setForm] = useState({
  title: '', description: '', category: '', priority: '', reportedBy: ''
});
const [images, setImages] = useState([]);
const [loading, setLoading] = useState(false);
```

**TicketDetail.jsx holds detail state:**
```javascript
const [ticket, setTicket] = useState(null);
const [loading, setLoading] = useState(true);
```

### API Integration (api.js)

Centralized service with 13 endpoint methods:

```javascript
// Read operations
fetchTickets(filters)      // GET with query params
fetchTicket(id)            // GET single
fetchStats()               // GET stats

// Create/Update operations
createTicket(form)         // POST with FormData
updateTicket(id, data)     // PUT
assignTicket(id, data)     // PUT
updateStatus(id, data)     // PUT
rejectTicket(id, data)     // PUT
closeTicket(id)            // PUT
deleteTicket(id)           // DELETE

// Comment operations
addComment(id, data)       // POST
editComment(id, cid, data) // PUT
deleteComment(id, cid)     // DELETE
```

### Styling Strategy

**Global Design System (index.css):**
- 30+ CSS variables for colors, shadows, typography
- Utility classes for buttons, forms, badges, alerts
- Responsive breakpoints for mobile/tablet/desktop
- Animation framework (spin, loading states)

**Component Styles:**
- TicketList.css: Grid layouts, stats cards, filters
- TicketForm.css: Form controls, file upload UI, image preview
- TicketDetail.css: Modal styles, tabs, comment presentation
- App.css: Navigation bar styling

**Color Palette:**
```
Primary:    #6366f1 (Indigo)
Success:    #10b981 (Emerald)
Danger:     #ef4444 (Red)
Warning:    #f59e0b (Amber)
Info:       #3b82f6 (Blue)
Background: #ffffff (Light) / #f9fafb (Dark)
Text:       #1f2937 (Dark) / #6b7280 (Light)
```

## Backend Architecture (Spring Boot)

### Technology Stack
- **Spring Boot 3.2.4:** Web framework
- **Spring Data JPA:** ORM and data access
- **Hibernate:** JPA implementation
- **H2/MySQL:** Relational database
- **Maven:** Build and dependency management

### Layered Architecture

```
┌─────────────────────────────────────────┐
│     REST Controller Layer                │
│  - @RestController endpoint handlers     │
│  - Request validation                    │
│  - HTTP status code mapping              │
│  - CORS configuration                    │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Service Layer                        │
│  - Business logic                        │
│  - Transaction management                │
│  - Validation & error handling           │
│  - Workflow orchestration                │
│  - File operations                       │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Repository Layer                     │
│  - Data access object (DAO)              │
│  - JPA repository interfaces             │
│  - Custom query methods                  │
│  - Relationship loading                  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Database Layer                       │
│  - H2/MySQL database                     │
│  - Schema auto-generation                │
│  - Transaction management                │
│  - Connection pooling                    │
└──────────────────────────────────────────┘
```

### Package Structure

```
com.campus.tickets/
├── controller/           # HTTP endpoints
│   └── TicketController
├── service/             # Business logic
│   ├── TicketService
│   └── FileStorageService
├── repository/          # Data access
│   ├── TicketRepository
│   └── TicketCommentRepository
├── model/               # JPA entities
│   ├── Ticket
│   └── TicketComment
├── dto/                 # Data transfer objects
│   ├── TicketDTO
│   └── TicketStatsDTO
├── exception/           # Error handling
│   ├── GlobalExceptionHandler
│   └── ResourceNotFoundException
├── config/              # Configuration
│   └── WebConfig
└── TicketsApplication   # Main entry point
```

### Entity Relationships

```
Ticket (1) ──────────── (Many) TicketComment
           @OneToMany

Ticket
├── id: Long (PK)
├── title: String
├── description: String
├── category: Enum (HARDWARE, PLUMBING, ...)
├── priority: Enum (LOW, MEDIUM, HIGH, CRITICAL)
├── status: Enum (OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED)
├── reportedBy: String
├── assignedTo: String (nullable)
├── resolutionNotes: String (nullable)
├── rejectionReason: String (nullable)
├── imageUrls: List<String> (ElementCollection)
├── comments: List<TicketComment> (OneToMany, cascade delete)
├── createdAt: LocalDateTime
├── updatedAt: LocalDateTime
├── resolvedAt: LocalDateTime
└── assignedAt: LocalDateTime

TicketComment
├── id: Long (PK)
├── ticket: Ticket (ManyToOne)
├── text: String
├── author: String
├── authorRole: Enum (USER, TECHNICIAN, ADMIN)
├── createdAt: LocalDateTime
└── updatedAt: LocalDateTime
```

### Request/Response Flow

```
Client Request
    ↓
TicketController
    ├─ @CrossOrigin validation
    ├─ Request parsing (@RequestBody, @PathVariable)
    └─ TicketService method call
        ↓
    TicketService
        ├─ Input validation
        ├─ TicketRepository queries
        ├─ Business logic (status transitions, etc.)
        ├─ FileStorageService (if file upload)
        └─ Returns DTO
        ↓
TicketController
    ├─ ResponseEntity with status code
    └─ JSON serialization
        ↓
Client Response
    (with proper CORS headers)
```

### Exception Handling Strategy

```
Exception Hierarchy:
├── ResourceNotFoundException
│   └─ Caught by GlobalExceptionHandler → 404 NOT_FOUND
├── IllegalStateException
│   └─ Caught by GlobalExceptionHandler → 400 BAD_REQUEST
├── IllegalArgumentException
│   └─ Caught by GlobalExceptionHandler → 400 BAD_REQUEST
├── MethodArgumentNotValidException
│   └─ Caught by GlobalExceptionHandler → 400 BAD_REQUEST (with field errors)
├── MaxUploadSizeExceededException
│   └─ Caught by GlobalExceptionHandler → 413 PAYLOAD_TOO_LARGE
└── Generic Exception
    └─ Caught by GlobalExceptionHandler → 500 INTERNAL_SERVER_ERROR
```

### Transaction Management

```
@Transactional (class-level)
├─ Create new transaction for each method
├─ Automatic rollback on exception
├─ Auto-commit on successful completion

@Transactional(readOnly=true) (on read methods)
├─ Optimized for read-only queries
├─ Cannot modify database
├─ Slight performance improvement
```

### File Upload Handling

```
Upload Request
    ↓
TicketController receives MultipartFile[]
    ↓
FileStorageService.storeFiles()
    ├─ Validate count (max 3 images)
    ├─ For each file:
    │   ├─ Validate MIME type (image/*)
    │   ├─ Validate size (max 5MB)
    │   ├─ Generate UUID filename
    │   ├─ Store to uploads/tickets/{uuid}
    │   └─ Return file path
    ├─ Collect all paths
    └─ Return List<String> of URLs
        ↓
Ticket entity stores imageUrls
```

## Database Design

### SQL Schema

```sql
CREATE TABLE tickets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  priority VARCHAR(50),
  status VARCHAR(50),
  reported_by VARCHAR(255),
  assigned_to VARCHAR(255),
  resolution_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  resolved_at TIMESTAMP,
  assigned_at TIMESTAMP
);

CREATE TABLE ticket_images (
  ticket_id BIGINT,
  image_urls VARCHAR(255),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE TABLE ticket_comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ticket_id BIGINT NOT NULL,
  text TEXT,
  author VARCHAR(255),
  author_role VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_comments_ticket_id ON ticket_comments(ticket_id);
```

### Query Performance Considerations

1. **List Tickets with Filters:**
   - Uses indexed columns (status, category, priority)
   - Full-text search on title/description
   - OrderBy createdAt DESC (for latest first)

2. **Comments Loading:**
   - Lazy loaded by default
   - Eager loaded only when fetching single ticket
   - Cascade delete with ticket

3. **Statistics Aggregation:**
   - Separate COUNT queries per status/priority
   - Eligible for caching in future

## Configuration Management

### Environment-Specific Config

**Development (H2):**
```properties
spring.datasource.url=jdbc:h2:file:./data/ticketdb;AUTO_SERVER=TRUE
spring.h2.console.enabled=true
spring.jpa.hibernate.ddl-auto=update
```

**Production (MySQL):**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campus_tickets
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=validate
```

### CORS Configuration

**Allowed Origins:**
- http://localhost:5173 (dev frontend)
- http://localhost:5174 (backup port)
- http://localhost:3000 (legacy)

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers:** Content-Type, Authorization (future auth)

**Credentials:** true (for cookie-based sessions, if added)

## Security Considerations

### Current Implementation
- CORS configured for development
- Input validation on all endpoints
- File upload validation (type, size)
- No authentication/authorization yet

### For Production
1. Add Spring Security with JWT/OAuth2
2. Implement role-based access control (RBAC)
3. Validate user permissions before operations
4. Encrypt sensitive data
5. Use HTTPS/TLS
6. Implement rate limiting
7. Add API versioning
8. Sanitize file uploads
9. Implement audit logging
10. Use environment variables for secrets

## Testing Strategy

### Unit Tests
- TicketServiceTest: Service layer logic
- Mockito for dependencies
- Coverage: CRUD, workflow, validation

### Integration Tests
To be added:
- TicketControllerIntegrationTest
- Repository tests with embedded H2
- Full API endpoint testing

### Manual Testing
- Browser DevTools
- Postman collection
- H2 database inspection
- Performance monitoring

## Deployment Considerations

### Docker Containerization (Optional)
```dockerfile
FROM openjdk:17
COPY target/tickets-1.0.0-SNAPSHOT.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

### Environment Variables
```bash
SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/campus_tickets
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=secret
APP_UPLOAD_DIR=/var/uploads/tickets
```

### Load Balancing
- Multiple backend instances behind reverse proxy (Nginx/HAProxy)
- Shared file storage (S3/NFS) for uploads
- Sticky sessions for WebSocket support (future)

## Future Enhancements

### Short Term
1. Add authentication/authorization
2. Implement user roles (Admin, Technician, User)
3. Email notifications
4. Ticket assignments with email
5. Comment mentions

### Medium Term
1. Real-time updates with WebSocket
2. Advanced search/filtering
3. Ticket templates
4. SLA tracking and reporting
5. File preview (thumbnails)
6. Mobile app (React Native)

### Long Term
1. Machine learning for auto-categorization
2. Predictive analytics for resolution time
3. Integration with facility management system
4. Multi-tenant support
5. Advanced reporting & dashboards

## Performance Benchmarks

### Expected Performance

| Operation | Target | Typical |
|-----------|--------|---------|
| List tickets | < 200ms | 50-100ms |
| Create ticket | < 500ms | 150-300ms |
| Get ticket | < 100ms | 30-50ms |
| Search | < 300ms | 100-200ms |
| Upload image | < 1s | 300-500ms |

### Optimization Opportunities

1. Enable database query caching (statistics)
2. Implement pagination for large lists
3. Add database indexes (done)
4. Use CDN for file uploads
5. Implement lazy loading in frontend
6. Add compression to HTTP responses

## Documentation Structure

- **README.md:** Project overview and setup
- **TESTING.md:** Testing guide with examples
- **ARCHITECTURE.md:** This file
- **API.md:** API endpoint documentation (generate with Springdoc)
- **CONTRIBUTING.md:** Development guidelines
- **DEPLOYMENT.md:** Production deployment guide

## Conclusion

This architecture provides a solid foundation for the Smart Campus ticketing system with:

✅ Clear separation of concerns (layered architecture)
✅ RESTful API design
✅ Component-based UI with proper state management
✅ Transaction-safe database operations
✅ Comprehensive error handling
✅ Responsive design
✅ Scalable structure for future enhancements

The system is designed for maintainability, testability, and ease of deployment across different environments.
