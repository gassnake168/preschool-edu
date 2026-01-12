package com.preschool.backend.entity;

import javax.persistence.*;
import lombok.Data;
import javax.validation.constraints.NotBlank;

@Entity
@Table(name = "students")
@Data
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank(message = "学生姓名不能为空")
    private String name;

    private String gender; // M, F
    private Integer age;
    private String className;
    private String parentPhone;
    private String tags; // 存储为逗号或空格分隔的字符串

    @Column(nullable = false)
    @NotBlank(message = "家长账号不能为空")
    private String parentUsername; // 关联家长的用户名
}
