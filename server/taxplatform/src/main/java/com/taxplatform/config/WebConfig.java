package com.taxplatform.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${cors.allowed-methods}")
    private String allowedMethods;

    @Value("${cors.allowed-headers}")
    private String allowedHeaders;

    @Value("${cors.allow-credentials}")
    private boolean allowCredentials;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(allowedOrigins.split(","))
                        .allowedMethods(allowedMethods.split(","))
                        .allowedHeaders(allowedHeaders.split(","))
                        .allowCredentials(allowCredentials);
            }

            @Override
            public void addResourceHandlers(ResourceHandlerRegistry registry) {
                // 정적 리소스 경로 제한 - 필요한 경우에만 활성화
                registry.addResourceHandler("/css/**", "/js/**", "/images/**", "/assets/**")
                        .addResourceLocations("classpath:/static/css/",
                                            "classpath:/static/js/",
                                            "classpath:/static/images/",
                                            "classpath:/static/assets/");
            }
        };
    }
}
