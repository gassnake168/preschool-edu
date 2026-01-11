package com.preschool.backend.dto;

import lombok.Data;

/**
 * 这个类专门用来接收前端登录传过来的数据
 * 
 * @Data 是 Lombok 的注解，它会自动帮我们生成 getter, setter, toString 等方法
 */
@Data
public class LoginRequest {
    // 前端传来的用户名
    private String username;
    // 前端传来的密码
    private String password;
    // 注意：不再需要 role 字段，因为角色由后端从数据库中查询确定
}