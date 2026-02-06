# Dynamic Web POS System

A fully configurable, dynamic POS system designed for any shop type (Grocery, Clothing, Pharmacy, Restaurant).

## Folder Structure
- `frontend/`: Static HTML/CSS/JS files. Serve with any web server.
- `backend/`: Spring Boot REST API application.

## Configuration
The system is controlled globally via `frontend/js/config.js`.

### How to Configure
1. Open `frontend/js/config.js`.
2. Edit the values to match your shop.
   - Change `SHOP_NAME`, `SHOP_TYPE`, `PRIMARY_COLOR`, etc.
   - `SHOP_TYPE` controls business logic (e.g., "Grocery", "Restaurant").

### Template for Deployment
Use `frontend/js/config.template.js` for CI/CD pipelines where variables like `{{SHOP_NAME}}` are replaced during build time.

## Running the Application

### Backend
1. Navigate to `backend/`.
2. Run `mvn spring-boot:run` (Ensure Maven and Java 17+ are installed).
3. The API will start at `http://localhost:8080`.
4. **Default Admin User**: 
   - Send a POST request to `http://localhost:8080/api/auth/init` to create the admin user.
   - Username: `admin`
   - Password: `admin123`

### Frontend
1. Navigate to `frontend/`.
2. You can open `index.html` directly in a browser (or use VS Code Live Server for better experience).
3. Log in using `admin` / `admin123`.

## Features
- **Dynamic Theme**: Colors and fonts update instantly based on config.
- **Shop Types**:
  - **Grocery**: Weight-based logic (configurable).
  - **Clothing**: Size/Color attributes.
  - **Restaurant**: Table number tracking.
- **Authentication**: JWT based secure login.
- **Data Persistence**: H2 Database (In-memory) by default. Change `application.properties` to switch to MySQL/PostgreSQL.
