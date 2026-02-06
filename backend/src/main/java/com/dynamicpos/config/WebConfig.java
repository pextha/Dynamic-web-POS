package com.dynamicpos.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Find existing static resources
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");

        // Serve uploaded files from the root of the project or a specific folder
        // Using "file:uploads/" assumes the uploads folder is in the working directory
        // of the application
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
