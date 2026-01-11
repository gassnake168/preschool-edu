package com.preschool.backend.entity;

import javax.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String username;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false)
    private String role; // admin, teacher, parent

    private String realName; // 称呼 (比如：张老师)
    private String phone; // 电话
    private String gender; // 性别
}
