package com.aiscientist.api_gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

/**
 * Gateway Configuration
 * 
 * Configures additional gateway features like rate limiting
 */
@Configuration
public class GatewayConfig {

    /**
     * Rate limiting key resolver based on IP address
     * Can be changed to user ID for authenticated requests
     */
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> Mono.just(
            exchange.getRequest()
                .getRemoteAddress()
                .getAddress()
                .getHostAddress()
        );
    }
}
