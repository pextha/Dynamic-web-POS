package com.dynamicpos;

import com.dynamicpos.model.User;
import com.dynamicpos.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class DynamicPosApplication {

	public static void main(String[] args) {
		SpringApplication.run(DynamicPosApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.findByUsername("admin").isEmpty()) {
				User admin = new User();
				admin.setUsername("admin");
				admin.setPassword(passwordEncoder.encode("admin123"));
				admin.setRole(User.Role.ADMIN);
				userRepository.save(admin);
				System.out.println("Default admin user created: admin / admin123");
			}
		};
	}
}
