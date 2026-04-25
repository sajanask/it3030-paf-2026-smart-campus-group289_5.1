package com.smartcampus.module.resource.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartcampus.module.resource.model.Resource;
import com.smartcampus.module.resource.repository.ResourceRepository;
import com.smartcampus.module.resource.service.ResourceService;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    @Override
    public Resource createResource(Resource resource) {
        validateResource(resource);
        return resourceRepository.save(resource);
    }

    @Override
    public Resource updateResource(String id, Resource resource) {
        Resource existingResource = resourceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Resource not found"));

        validateResource(resource);

        existingResource.setName(resource.getName());
        existingResource.setType(resource.getType());
        existingResource.setCapacity(resource.getCapacity());
        existingResource.setLocation(resource.getLocation());
        existingResource.setStatus(resource.getStatus());
        existingResource.setFeatures(resource.getFeatures());
        existingResource.setDescription(resource.getDescription());

        return resourceRepository.save(existingResource);
    }

    @Override
    public void deleteResource(String id) {
        Resource existingResource = resourceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Resource not found"));

        resourceRepository.delete(existingResource);
    }

    private void validateResource(Resource resource) {
        if (resource.getName() == null || resource.getName().trim().isEmpty()) {
            throw new RuntimeException("Resource name is required");
        }
        if (resource.getType() == null || resource.getType().trim().isEmpty()) {
            throw new RuntimeException("Resource type is required");
        }
        if (resource.getLocation() == null || resource.getLocation().trim().isEmpty()) {
            throw new RuntimeException("Resource location is required");
        }
        if (resource.getCapacity() == null || resource.getCapacity() <= 0) {
            throw new RuntimeException("Resource capacity must be greater than 0");
        }
        if (resource.getStatus() == null || resource.getStatus().trim().isEmpty()) {
            throw new RuntimeException("Resource status is required");
        }
    }
}
