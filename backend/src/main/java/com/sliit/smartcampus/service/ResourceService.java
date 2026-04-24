package com.sliit.smartcampus.service;

import com.sliit.smartcampus.entity.Resource;
import com.sliit.smartcampus.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    @Autowired
    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public Resource addResource(Resource resource) {
        validateResource(resource);
        normalizeResource(resource);

        if (resource.getStatus() == null || resource.getStatus().isBlank()) {
            resource.setStatus("ACTIVE");
        }
        return resourceRepository.save(resource);
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Optional<Resource> getResourceById(String id) {
        return resourceRepository.findById(id);
    }

    public List<Resource> getResourcesByType(String type) {
        return resourceRepository.findByType(type == null ? null : type.trim().toUpperCase());
    }

    public Resource updateResourceStatus(String id, String newStatus) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with ID: " + id));

        if (newStatus == null || newStatus.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }

        resource.setStatus(newStatus.trim().toUpperCase());
        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new RuntimeException("Resource not found with ID: " + id);
        }

        resourceRepository.deleteById(id);
    }

    private void validateResource(Resource resource) {
        if (resource == null) {
            throw new IllegalArgumentException("Resource payload is required");
        }
        if (resource.getName() == null || resource.getName().isBlank()) {
            throw new IllegalArgumentException("Resource name is required");
        }
        if (resource.getType() == null || resource.getType().isBlank()) {
            throw new IllegalArgumentException("Resource type is required");
        }
        if (resource.getLocation() == null || resource.getLocation().isBlank()) {
            throw new IllegalArgumentException("Resource location is required");
        }
        if (resource.getCapacity() == null || resource.getCapacity() < 0) {
            throw new IllegalArgumentException("Resource capacity must be zero or greater");
        }
    }

    private void normalizeResource(Resource resource) {
        resource.setName(resource.getName().trim());
        resource.setType(resource.getType().trim().toUpperCase());
        resource.setLocation(resource.getLocation().trim());

        if (resource.getAvailabilityWindows() != null) {
            resource.setAvailabilityWindows(resource.getAvailabilityWindows().trim());
        }
        if (resource.getStatus() != null) {
            resource.setStatus(resource.getStatus().trim().toUpperCase());
        }
    }
}
