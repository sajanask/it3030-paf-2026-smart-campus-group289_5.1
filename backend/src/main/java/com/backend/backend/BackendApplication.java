package com.backend.backend;

import com.smartcampus.common.config.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.AutoConfigurationPackage;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.backend", "com.smartcampus"})
@AutoConfigurationPackage(basePackages = {"com.backend", "com.smartcampus"})
public class BackendApplication {

	public static void main(String[] args) {
		DotenvLoader.loadIfPresent();
		SpringApplication.run(BackendApplication.class, args);
	}

}
