package com.preschool.backend.controller;

import com.preschool.backend.dto.LoginRequest;
import com.preschool.backend.repository.UserRepository;
import com.preschool.backend.util.PasswordUtil;
import com.preschool.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * AuthController
 * 负责处理登录相关的请求
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    /**
     * 登录接口
     * 请求地址: POST http://localhost:8080/api/auth/login
     */
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        Map<String, Object> result = new HashMap<>();

        if (request == null || request.getUsername() == null || request.getUsername().trim().isEmpty()
                || request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            result.put("code", 400);
            result.put("message", "用户名和密码不能为空");
            return result;
        }

        try {
            // 从数据库查找用户
            Optional<com.preschool.backend.entity.User> userOpt = userRepository.findByUsername(request.getUsername());

            // 使用 BCrypt 验证密码
            if (userOpt.isPresent() && PasswordUtil.matches(request.getPassword(), userOpt.get().getPassword())) {
                com.preschool.backend.entity.User user = userOpt.get();
                // 登录成功 - 生成真实的 JWT Token
                String token = JwtUtil.generateToken(user.getUsername(), user.getRole());

                result.put("code", 200);
                result.put("message", "登录成功！欢迎回来。");
                result.put("token", token); // 返回真实的 JWT token
                result.put("role", user.getRole());
                result.put("realName", user.getRealName());
                result.put("phone", user.getPhone());
                result.put("gender", user.getGender());
                result.put("username", user.getUsername());
            } else {
                result.put("code", 401);
                result.put("message", "登录失败：用户名或密码错误！");
            }

        } catch (Exception e) {
            // 记录错误但不暴露详细信息给客户端
            result.put("code", 500);
            result.put("message", "服务器内部错误，请联系管理员。");
        }

        return result;
    }
}
