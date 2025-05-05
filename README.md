# Astra Social Media

## Introduction

Astra Social Media is a modern social networking platform built with React Vite for the front-end and Spring Boot for the back-end. This project provides essential social media features such as posting content, interacting with posts, connecting with friends, messaging, and many other advanced functionalities.

### Key Features
- User registration, login, and account management
- Rich content posting with images, videos, and text
- Interactions: likes, comments, shares
- Friend system and following capabilities
- Direct messaging between users
- Real-time notifications
- User and content search
- User-friendly and responsive interface

## Technologies Used

### Front-end
- React 18 with Vite
- Redux Toolkit for state management
- Tailwind CSS for styling
- Axios for API requests
- Socket.IO for real-time communication
- React Router for navigation

### Back-end
- Spring Boot 3.x
- Spring Security with JWT authentication
- Spring Data JPA
- Elasticsearch for search functionality
- Cloudinary for media storage
- Gmail SMTP for email services
- Google Gemini API for AI features

## System Requirements

### Front-end
- Node.js (v16+)
- npm or yarn

### Back-end
- Java Development Kit (JDK) 17 or higher
- Maven
- MySQL (v8+)
- Elasticsearch instance

## Installation and Setup

### Back-end (Spring Boot)

1. Clone the repository
   ```bash
   git clone https://github.com/akira3175/Astra-Social-Media.git
   cd astra-social-media/backend
   ```

2. Configure the database and environment variables
   - Create a new MySQL database named `astra_db`
   - Create a `.env` file in the root directory with the following variables:
     ```
        # Elasticsearch Configuration
        ELASTIC_HOST=http://localhost
        ELASTIC_PORT=9200
        ELASTIC_API_KEY=dummy_elastic_api_key_123456

        # Email Configuration
        MAIL_USERNAME=example.email@gmail.com
        MAIL_PASSWORD=your_email_app_password

        # Google Gemini API
        GEMINI_API_KEY=AIzaSyD-DUMMY-KEY-FOR-GEMINI

        # Cloudinary Configuration
        CLOUDINARY_CLOUD_NAME=demo_cloud
        CLOUDINARY_API_KEY=123456789012345
        CLOUDINARY_API_SECRET=abcdEFGHijklMNOPQRSTuvwx
     ```
   - Update the connection information in `src/main/resources/application.properties`

3. Compile and run the application
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   Or using the wrapper (if available):
   ```bash
   ./mvnw spring-boot:run
   ```

4. The back-end application will run at: http://localhost:8080

### Front-end (React Vite)

1. Navigate to the front-end directory
   ```bash
   cd ../frontend
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the application in development mode
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. The front-end application will run at: http://localhost:5173

## Project Structure

### Back-end
```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/astra/social/
│   │   │   ├── config/          # Application configurations
│   │   │   ├── controller/      # REST endpoints
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── exception/       # Exception handling
│   │   │   ├── model/           # Entities
│   │   │   ├── repository/      # Data access
│   │   │   ├── security/        # Authentication and authorization
│   │   │   ├── service/         # Business logic
│   │   │   └── AstraSocialApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   └── test/                    # Unit tests
└── pom.xml
```

### Front-end
```
frontend/
├── public/
├── src/
│   ├── assets/       # Static assets
│   ├── components/   # Reusable UI components
│   ├── context/      # React Context API
│   ├── hooks/        # Custom hooks
│   ├── pages/        # Page components
│   ├── redux/        # State management
│   ├── services/     # API services
│   ├── utils/        # Helper functions
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```


## Deployment

### Back-end
1. Package the Spring Boot application
   ```bash
   mvn clean package
   ```

2. Run the generated JAR file
   ```bash
   java -jar target/astra-social-0.1.0.jar
   ```

### Front-end
1. Build for production
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Serve the build directory with nginx or any web server

## Development Environment

- Recommended IDEs: IntelliJ IDEA, VS Code
- Version control: Git

## Contributing

We welcome all contributions to the Astra Social Media project. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- Email: akira31758421@gmail.com