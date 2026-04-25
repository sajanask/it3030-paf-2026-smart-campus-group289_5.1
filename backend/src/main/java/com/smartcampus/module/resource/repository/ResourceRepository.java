package com.smartcampus.module.resource.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.module.resource.model.Resource;

public interface ResourceRepository extends MongoRepository<Resource, String> {
}
