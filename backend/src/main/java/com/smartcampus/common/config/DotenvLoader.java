package com.smartcampus.common.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public final class DotenvLoader {

    private DotenvLoader() {
    }

    public static void loadIfPresent() {
        List<Path> candidates = List.of(
                Paths.get(".env"),
                Paths.get("backend/.env"),
                Paths.get("../backend/.env")
        );

        for (Path path : candidates) {
            if (Files.exists(path) && Files.isReadable(path)) {
                loadFrom(path);
                return;
            }
        }
    }

    private static void loadFrom(Path path) {
        try {
            List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
            for (String line : lines) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }

                int separator = trimmed.indexOf('=');
                if (separator <= 0) {
                    continue;
                }

                String key = trimmed.substring(0, separator).trim();
                String value = trimmed.substring(separator + 1).trim();

                if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                    value = value.substring(1, value.length() - 1);
                }

                if (System.getProperty(key) == null) {
                    System.setProperty(key, value);
                }

                // Map dotenv keys directly to Spring properties as well.
                if ("MONGODB_URI".equals(key) && System.getProperty("spring.data.mongodb.uri") == null) {
                    System.setProperty("spring.data.mongodb.uri", value);
                }
                if ("MONGODB_DATABASE".equals(key) && System.getProperty("spring.data.mongodb.database") == null) {
                    System.setProperty("spring.data.mongodb.database", value);
                }
            }
        } catch (IOException ignored) {
            // App falls back to existing environment variables and property defaults.
        }
    }
}
