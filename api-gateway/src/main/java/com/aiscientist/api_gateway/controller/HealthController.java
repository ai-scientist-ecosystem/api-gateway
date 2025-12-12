package com.aiscientist.api_gateway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Health Controller
 * 
 * Provides health check endpoints and service registry information
 */
@RestController
@RequestMapping("/api/gateway")
public class HealthController {

    @Autowired
    private DiscoveryClient discoveryClient;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", Instant.now());
        response.put("service", "api-gateway");
        response.put("version", "1.0.0");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/services")
    public ResponseEntity<Map<String, Object>> listServices() {
        Map<String, Object> response = new HashMap<>();
        List<String> services = discoveryClient.getServices();
        
        Map<String, List<ServiceInstance>> serviceDetails = new HashMap<>();
        for (String service : services) {
            List<ServiceInstance> instances = discoveryClient.getInstances(service);
            serviceDetails.put(service, instances);
        }
        
        response.put("timestamp", Instant.now());
        response.put("totalServices", services.size());
        response.put("services", services);
        response.put("serviceDetails", serviceDetails);
        
        return ResponseEntity.ok(response);
    }
}
