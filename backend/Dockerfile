# Build Spring Boot 3.3.6 with JDK 17
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./
COPY src src
RUN chmod +x mvnw && ./mvnw -q clean package -DskipTests

# Run the packaged JAR
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/game-warmup-ebook-1.0.0.jar app.jar

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
