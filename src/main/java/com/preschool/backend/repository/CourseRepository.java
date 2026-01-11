package com.preschool.backend.repository;

import com.preschool.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 课程仓库
 * 继承 JpaRepository 后，我们就自动拥有了增删改查的能力！
 * <Course, Long> 的意思是：我们要管理的是 Course 数据，它的主键 ID 是 Long 类型的。
 */
import com.preschool.backend.entity.Student;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    // 根据老师姓名查询课程
    List<Course> findByTeacherName(String teacherName);

    // 根据学生名单查询课程 (只要课程中包含该名单中的任何一个学生)
    List<Course> findByStudentsIn(List<Student> students);
}
