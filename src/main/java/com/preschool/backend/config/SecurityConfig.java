package com.preschool.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import com.preschool.backend.util.JwtUtil;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import javax.servlet.http.HttpServletResponse;

/**
 * Spring Security 配置
 * 我们只使用 BCrypt 加密功能，不启用完整的 Security 验证
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtUtil jwtUtil) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // 禁用 CSRF（因为我们用 JWT）
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeRequests(auth -> auth
                        .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .antMatchers("/api/auth/**").permitAll()
                        .antMatchers(HttpMethod.PUT, "/api/users/profile").authenticated()
                        .antMatchers(HttpMethod.GET, "/api/users/teachers").hasAnyRole("ADMIN", "TEACHER")
                        .antMatchers("/api/users/**").hasRole("ADMIN")
                        .antMatchers(HttpMethod.GET, "/api/students/my").hasRole("PARENT")
                        .antMatchers(HttpMethod.GET, "/api/students/**").hasAnyRole("ADMIN", "TEACHER")
                        .antMatchers(HttpMethod.POST, "/api/students/**").hasAnyRole("ADMIN", "TEACHER")
                        .antMatchers(HttpMethod.DELETE, "/api/students/**").hasAnyRole("ADMIN", "TEACHER")
                        .antMatchers(HttpMethod.GET, "/api/courses/**").hasAnyRole("ADMIN", "TEACHER", "PARENT")
                        .antMatchers(HttpMethod.POST, "/api/courses/**").hasAnyRole("ADMIN", "TEACHER")
                        .antMatchers(HttpMethod.PUT, "/api/courses/**").hasAnyRole("ADMIN", "TEACHER")
                        .antMatchers(HttpMethod.DELETE, "/api/courses/**").hasAnyRole("ADMIN", "TEACHER")
                        .antMatchers(HttpMethod.GET, "/api/resources/**").authenticated()
                        .antMatchers(HttpMethod.POST, "/api/resources/**").hasRole("ADMIN")
                        .antMatchers(HttpMethod.DELETE, "/api/resources/**").hasRole("ADMIN")
                        .antMatchers("/api/ai/**").hasAnyRole("ADMIN", "TEACHER")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"code\":401,\"message\":\"未登录或登录已过期\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write("{\"code\":403,\"message\":\"无权限访问\"}");
                        })
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
