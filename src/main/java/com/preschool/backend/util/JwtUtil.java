package com.preschool.backend.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT 工具类
 * 用于生成和验证 JSON Web Token
 * 现在从配置文件读取密钥，提高安全性
 */
@Component
public class JwtUtil {

    private static String secretKey;
    private static long expirationTime;

    /**
     * 通过 Spring 注入配置值
     */
    @Value("${jwt.secret.key}")
    public void setSecretKey(String key) {
        JwtUtil.secretKey = key;
    }

    @Value("${jwt.expiration.ms}")
    public void setExpirationTime(long expiration) {
        JwtUtil.expirationTime = expiration;
    }

    /**
     * 生成 JWT Token
     * 
     * @param username 用户名
     * @param role     角色
     * @return JWT token字符串
     */
    public static String generateToken(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);

        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(key)
                .compact();
    }

    /**
     * 验证 Token 是否有效
     * 
     * @param token JWT token
     * @return true 如果有效，false 如果无效或过期
     */
    public static boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 从 Token 中提取用户名
     * 
     * @param token JWT token
     * @return 用户名
     */
    public static String getUsernameFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    /**
     * 从 Token 中提取角色
     * 
     * @param token JWT token
     * @return 角色
     */
    public static String getRoleFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return (String) claims.get("role");
    }
}
