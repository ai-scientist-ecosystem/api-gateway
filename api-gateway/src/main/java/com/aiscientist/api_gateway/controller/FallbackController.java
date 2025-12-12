package com.aiscientist.api_gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Fallback Controller
 * 
 * Handles circuit breaker fallbacks when services are unavailable
 */
@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/data-collector")
    public ResponseEntity<Map<String, Object>> dataCollectorFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SERVICE_UNAVAILABLE");
        response.put("message", "Data Collector service is temporarily unavailable. Please try again later.");
        response.put("timestamp", Instant.now());
        response.put("service", "data-collector");
        
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @GetMapping("/alerts")
    public ResponseEntity<Map<String, Object>> alertEngineFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SERVICE_UNAVAILABLE");
        response.put("message", "Alert Engine service is temporarily unavailable. Please try again later.");
        response.put("timestamp", Instant.now());
        response.put("service", "alert-engine");
        
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}
