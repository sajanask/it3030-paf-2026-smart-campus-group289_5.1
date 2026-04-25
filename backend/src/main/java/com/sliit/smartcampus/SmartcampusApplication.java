package com.sliit.smartcampus;

import com.smartcampus.common.config.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
public class SmartcampusApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartcampusApplication.class, args);
	}

}
