package com.preschool.backend.entity;

import javax.persistence.*;
import lombok.Data;

import java.util.List;

/**
 * 课程实体类
 * 
 * @Entity: 告诉 Spring Boot 这是一个要在数据库建表的类
 * @Table: 指定表名叫 'courses'
 */
@Data
@Entity
@Table(name = "courses")
public class Course {

    @Id // 标记这是主键 (ID)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID 自增长 (1, 2, 3...)
    private Long id;

    // 课程名称 (比如：乐高积木课)
    private String name;

    // 课程描述 (比如：培养孩子的动手能力)
    private String description;

    // 授课老师 (比如：李老师)
    private String teacherName;

    // 上课时间 (比如：周一上午 10:00)
    private String classTime;

    // 上课地点 (比如：302 教室)
    private String location;

    // 参加该课程的学生名单
    @ManyToMany
    @JoinTable(name = "course_students", joinColumns = @JoinColumn(name = "course_id"), inverseJoinColumns = @JoinColumn(name = "student_id"))
    private List<Student> students;
}
