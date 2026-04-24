package com.sliit.smartcampus.repository;

import com.sliit.smartcampus.entity.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    // 1. Filter by Type (e.g., Show me all "LABS")
    List<Resource> findByType(String type);

    // 2. Filter by Status (e.g., Show me all "ACTIVE" resources)
    List<Resource> findByStatus(String status);

    // 3. Filter by Capacity (e.g., Show me rooms that hold at least 50 people)
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    // 4. Search by Location (e.g., Show me everything in "Building A")
    List<Resource> findByLocationContainingIgnoreCase(String location);
    
    // 5. Combined Filter: Type AND Capacity
    List<Resource> findByTypeAndCapacityGreaterThanEqual(String type, Integer capacity);
}