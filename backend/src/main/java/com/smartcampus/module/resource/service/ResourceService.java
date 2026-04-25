package com.smartcampus.module.resource.service;

import java.util.List;

import com.smartcampus.module.resource.model.Resource;

public interface ResourceService {
    List<Resource> getAllResources();

    Resource createResource(Resource resource);

    Resource updateResource(String id, Resource resource);

    void deleteResource(String id);
}
