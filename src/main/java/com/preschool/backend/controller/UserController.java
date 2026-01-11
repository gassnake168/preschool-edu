package com.preschool.backend.controller;

import com.preschool.backend.entity.User;
import com.preschool.backend.repository.UserRepository;
import com.preschool.backend.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<com.preschool.backend.dto.UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(com.preschool.backend.dto.UserDTO::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }

    @PostMapping
    public Map<String, Object> createUser(@RequestBody User user) {
        // 验证用户名
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return Map.of("code", 400, "message", "用户名不能为空");
        }
        if (user.getUsername().length() > 20) {
            return Map.of("code", 400, "message", "用户名长度不能超过20位");
        }

        // 验证密码
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return Map.of("code", 400, "message", "密码不能为空");
        }
        if (user.getPassword().length() > 30) {
            return Map.of("code", 400, "message", "密码长度不能超过30位");
        }

        // 验证角色
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            return Map.of("code", 400, "message", "角色不能为空");
        }

        // 检查用户名是否已存在
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return Map.of("code", 400, "message", "用户名已存在");
        }

        // 加密密码 (修复安全漏洞)
        user.setPassword(PasswordUtil.encode(user.getPassword()));

        userRepository.save(user);
        return Map.of("code", 200, "message", "账号创建成功");
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return Map.of("code", 404, "message", "用户不存在");
        }
        userRepository.deleteById(id);
        return Map.of("code", 200, "message", "账号已删除");
    }

    @PutMapping("/profile")
    public Map<String, Object> updateProfile(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String realName = params.get("realName");
        String phone = params.get("phone");
        String gender = params.get("gender");

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRealName(realName);
            user.setPhone(phone);
            user.setGender(gender);
            userRepository.save(user);
            return Map.of("code", 200, "message", "个人信息已更新");
        }
        return Map.of("code", 404, "message", "用户不存在");
    }

    @GetMapping("/teachers")
    public List<Map<String, Object>> getTeachers() {
        return userRepository.findByRole("teacher").stream()
                .filter(u -> u.getRealName() != null && !u.getRealName().isEmpty())
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("name", u.getRealName());
                    return map;
                })
                .toList();
    }
}
