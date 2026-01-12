package com.preschool.backend.entity;

import javax.persistence.*;
import lombok.Data;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 基础资源表
 * 用来存储：固定的课程名、老师名单、教室列表
 */
@Data
@Entity
@Table(name = "school_resources")
public class SchoolResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 资源名称 (例如：全脑开发课、王老师、302教室)
    @NotBlank(message = "资源名称不能为空")
    private String name;

    // 资源类型 (例如：SUBJECT-科目, TEACHER-老师, LOCATION-地点)
    // 我们约定：1=科目, 2=老师, 3=地点
    @NotNull(message = "资源类型不能为空")
    @Min(value = 1, message = "资源类型必须是 1(科目)、2(老师) 或 3(地点)")
    @Max(value = 3, message = "资源类型必须是 1(科目)、2(老师) 或 3(地点)")
    private Integer type;
}
