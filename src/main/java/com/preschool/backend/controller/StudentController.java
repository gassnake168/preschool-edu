package com.preschool.backend.controller;

import com.preschool.backend.entity.Student;
import com.preschool.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @GetMapping("/my")
    public List<Student> getStudentsByParent(@RequestParam String parentUsername) {
        return studentRepository.findByParentUsername(parentUsername);
    }

    @PostMapping
    public Map<String, Object> addStudent(@RequestBody Student student) {
        if (student.getName() == null || student.getName().trim().isEmpty()) {
            return Map.of("code", 400, "message", "学生姓名不能为空");
        }
        if (student.getParentUsername() == null || student.getParentUsername().trim().isEmpty()) {
            return Map.of("code", 400, "message", "家长账号不能为空");
        }
        Student saved = studentRepository.save(student);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "学生添加成功");
        result.put("data", saved);
        return result;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteStudent(@PathVariable Long id) {
        if (!studentRepository.existsById(id)) {
            return Map.of("code", 404, "message", "学生不存在");
        }
        studentRepository.deleteById(id);
        return Map.of("code", 200, "message", "学生删除成功");
    }
}
