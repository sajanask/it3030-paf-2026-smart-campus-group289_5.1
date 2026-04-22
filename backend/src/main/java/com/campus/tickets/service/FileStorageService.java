package com.campus.tickets.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads/tickets}")
    private String uploadDir;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Cannot create upload directory: " + uploadDir, e);
        }
    }

    /** Store up to 3 files, return URL list */
    public List<String> storeFiles(List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();
        if (files == null || files.isEmpty()) return urls;
        int limit = Math.min(files.size(), 3);
        for (int i = 0; i < limit; i++) {
            MultipartFile f = files.get(i);
            if (f != null && !f.isEmpty()) urls.add(storeFile(f));
        }
        return urls;
    }

    public String storeFile(MultipartFile file) {
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/"))
            throw new IllegalArgumentException("Only image files are allowed (jpg, png, gif, webp)");
        if (file.getSize() > 5 * 1024 * 1024)
            throw new IllegalArgumentException("Each image must be under 5 MB");

        String original = StringUtils.cleanPath(
            file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload");
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
        String name = UUID.randomUUID() + ext;

        try {
            Files.copy(file.getInputStream(), uploadPath.resolve(name), StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/tickets/" + name;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file: " + original, e);
        }
    }

    public void deleteFile(String url) {
        if (url == null || url.isBlank()) return;
        try {
            Files.deleteIfExists(uploadPath.resolve(Paths.get(url).getFileName().toString()));
        } catch (IOException ignored) {}
    }
}
