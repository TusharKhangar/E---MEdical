# Builds the React app and the Spring Boot API into one image that serves both on port 8080.
#
#   docker build -t e-medical .
#   docker run -p 8080:8080 -e DB_URL=... -e DB_USERNAME=... -e DB_PASSWORD=... -e JWT_SECRET=... e-medical
#
# See docker-compose.yml for a ready-made setup with MySQL.

# ---- 1. Frontend -------------------------------------------------------------
FROM node:20-alpine AS frontend
WORKDIR /app
COPY Frontend/medical-frontend/package.json Frontend/medical-frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY Frontend/medical-frontend/ ./
# The API is served from the same origin, so no VITE_API_URL is needed
RUN npm run build

# ---- 2. Backend --------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /app
COPY bioMedical/pom.xml ./
RUN mvn -B -q dependency:go-offline
COPY bioMedical/src ./src
# Package the built frontend as static resources inside the jar
COPY --from=frontend /app/dist ./src/main/resources/static
RUN mvn -B -q package -DskipTests

# ---- 3. Runtime --------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=backend /app/target/bioMedical.jar app.jar
USER app
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"UP"' || exit 1
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
