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

    // 1. Add a new resource to the catalogue
    public Resource addResource(Resource resource) {
        // By default, a new resource should probably be ACTIVE
        if (resource.getStatus() == null) {
            resource.setStatus("ACTIVE");
        }
        return resourceRepository.save(resource);
    }

    // 2. Get absolutely everything (for the main admin dashboard)
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // 3. Get a specific resource by its ID
    public Optional<Resource> getResourceById(Long id) {
        return resourceRepository.findById(id);
    }

    // 4. Filter resources by Type (using the magic query we wrote earlier!)
    public List<Resource> getResourcesByType(String type) {
        return resourceRepository.findByType(type);
    }

    // 5. Update a resource's status (e.g., Member 3's ticketing system might call this 
    // to set a projector to OUT_OF_SERVICE if it breaks)
    public Resource updateResourceStatus(Long id, String newStatus) {
        Optional<Resource> existingResource = resourceRepository.findById(id);
        
        if (existingResource.isPresent()) {
            Resource resource = existingResource.get();
            resource.setStatus(newStatus);
            return resourceRepository.save(resource);
        } else {
            throw new RuntimeException("Resource not found with ID: " + id);
        }
    }
}