package com.preschool.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 配置
 * 我们只使用 BCrypt 加密功能，不启用完整的 Security 验证
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // 禁用 CSRF（因为我们用 JWT）
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll() // 允许所有请求（暂时不启用验证）
                );
        return http.build();
    }
}
