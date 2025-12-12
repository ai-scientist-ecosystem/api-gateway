package com.aiscientist.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * API Gateway Application for AI Scientist Ecosystem
 * 
 * Provides unified entry point for all microservices:
 * - data-collector (port 8082)
 * - alert-engine (port 8083)
 * 
 * Features:
 * - Service discovery via Eureka
 * - Load balancing
 * - Circuit breaker pattern
 * - CORS configuration
 * - Rate limiting
 * - Request/response logging
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
