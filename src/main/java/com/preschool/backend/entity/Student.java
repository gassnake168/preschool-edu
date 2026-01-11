package com.preschool.backend.entity;

import javax.persistence.*;
import lombok.Data;

@Entity
@Table(name = "students")
@Data
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String gender; // M, F
    private Integer age;
    private String className;
    private String parentPhone;
    private String tags; // 存储为逗号或空格分隔的字符串

    @Column(nullable = false)
    private String parentUsername; // 关联家长的用户名
}
