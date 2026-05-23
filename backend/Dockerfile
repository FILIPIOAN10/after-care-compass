# syntax=docker/dockerfile:1
# Multi-stage: compilăm cu JDK 21, rulăm cu JRE 21 (imagine mai mică).
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Cache pentru dependențe: copiem doar wrapper-ul și pom.xml mai întâi.
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw \
 && ./mvnw -q -B -DskipTests dependency:go-offline

# Acum copiem sursele și construim jar-ul.
COPY src src
RUN ./mvnw -q -B -DskipTests package \
 && cp target/*.jar /app/app.jar

# === Runtime ===
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd -r -u 1001 -g root appuser \
 && mkdir -p /app/uploads && chown -R appuser /app
COPY --from=build /app/app.jar /app/app.jar

ENV PORT=8090 \
    UPLOADS_DIR=/app/uploads \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75"

EXPOSE 8090
USER appuser
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar --server.port=${PORT}"]
