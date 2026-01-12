package com.preschool.backend.service;

import com.preschool.backend.entity.Course;
import com.preschool.backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private com.preschool.backend.repository.StudentRepository studentRepository;

    // 1. 获取课程 (支持教师名 或 家长用户名 过滤)
    public List<Course> getAllCourses(String teacherName, String parentUsername) {
        // 如果是老师登录
        if (teacherName != null && !teacherName.isEmpty()) {
            return courseRepository.findByTeacherName(teacherName);
        }

        // 如果是家长登录
        if (parentUsername != null && !parentUsername.isEmpty()) {
            // 1. 找到家长名下的所有孩子
            List<com.preschool.backend.entity.Student> myStudents = studentRepository
                    .findByParentUsername(parentUsername);
            if (myStudents.isEmpty()) {
                return java.util.Collections.emptyList();
            }
            // 2. 返回包含这些孩子的课程
            return courseRepository.findByStudentsIn(myStudents);
        }

        // 园长显示全部
        return courseRepository.findAll();
    }

    // 2. 添加
    public Course addCourse(Course course) {
        return courseRepository.save(course);
    }

    // 3. (新增) 删除课程
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "课程不存在");
        }
        courseRepository.deleteById(id);
    }

    // 4. (新增) 修改课程
    public Course updateCourse(Long id, Course newInfo) {
        // 先去数据库找找看有没有这门课
        Optional<Course> optionalCourse = courseRepository.findById(id);

        if (optionalCourse.isPresent()) {
            Course existingCourse = optionalCourse.get();
            // 更新信息
            existingCourse.setName(newInfo.getName());
            existingCourse.setTeacherName(newInfo.getTeacherName());
            existingCourse.setLocation(newInfo.getLocation());
            existingCourse.setClassTime(newInfo.getClassTime());
            existingCourse.setDescription(newInfo.getDescription());
            // 关键：更新学生名单 (Many-to-Many 关系)
            existingCourse.setStudents(newInfo.getStudents());

            return courseRepository.save(existingCourse);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "找不到ID为 " + id + " 的课程");
        }
    }
}
