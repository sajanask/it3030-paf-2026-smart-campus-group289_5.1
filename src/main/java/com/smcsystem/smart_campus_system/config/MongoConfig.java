package com.smcsystem.smart_campus_system.config;

import com.smcsystem.smart_campus_system.enums.ResourceStatus;
import com.smcsystem.smart_campus_system.enums.ResourceType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.List;
import java.util.Locale;

@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(List.of(
                new StringToResourceTypeConverter(),
                new StringToResourceStatusConverter()
        ));
    }

    private static String normalizeEnumValue(String value) {
        return value.trim()
                .replace(' ', '_')
                .replace('-', '_')
                .toUpperCase(Locale.ROOT);
    }

    private static ResourceStatus normalizeResourceStatus(String value) {
        String normalized = normalizeEnumValue(value);
        return switch (normalized) {
            case "ACTIVE", "AVAILABLE" -> ResourceStatus.ACTIVE;
            case "OUT_OF_SERVICE", "UNAVAILABLE", "MAINTENANCE" -> ResourceStatus.OUT_OF_SERVICE;
            default -> ResourceStatus.valueOf(normalized);
        };
    }

    private static ResourceType normalizeResourceType(String value) {
        String normalized = normalizeEnumValue(value);
        return switch (normalized) {
            case "LECTURE_HALL", "HALL", "CLASSROOM", "AUDITORIUM" -> ResourceType.LECTURE_HALL;
            case "LAB", "LABORATORY" -> ResourceType.LAB;
            case "MEETING_ROOM", "MEETING" -> ResourceType.MEETING_ROOM;
            case "EQUIPMENT", "DEVICE" -> ResourceType.EQUIPMENT;
            default -> ResourceType.valueOf(normalized);
        };
    }

    @ReadingConverter
    private static class StringToResourceTypeConverter implements Converter<String, ResourceType> {
        @Override
        public ResourceType convert(String source) {
            return normalizeResourceType(source);
        }
    }

    @ReadingConverter
    private static class StringToResourceStatusConverter implements Converter<String, ResourceStatus> {
        @Override
        public ResourceStatus convert(String source) {
            return normalizeResourceStatus(source);
        }
    }
}
