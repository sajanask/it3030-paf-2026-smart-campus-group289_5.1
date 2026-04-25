package com.backend.backend;

import com.smartcampus.common.config.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication(scanBasePackages = {"com.backend", "com.smartcampus"})
@EnableMongoRepositories(basePackages = {"com.backend", "com.smartcampus"})
public class BackendApplication {

	public static void main(String[] args) {
		DotenvLoader.loadIfPresent();
		SpringApplication.run(BackendApplication.class, args);
	}

}
