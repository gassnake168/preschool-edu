package com.preschool.backend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * 密码加密工具类
 * 使用 BCrypt 算法进行密码加密和验证
 */
public class PasswordUtil {

    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    /**
     * 加密密码
     * 
     * @param rawPassword 明文密码
     * @return 加密后的密码（以 $2a$ 开头）
     */
    public static String encode(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    /**
     * 验证密码
     * 
     * @param rawPassword     用户输入的明文密码
     * @param encodedPassword 数据库中存储的加密密码
     * @return true 如果匹配，false 如果不匹配
     */
    public static boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }
}
