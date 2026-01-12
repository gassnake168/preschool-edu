package com.preschool.backend.controller;

import com.preschool.backend.entity.Student;
import com.preschool.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/students")
@CrossOrigin
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Value("${security.allow-anonymous:false}")
    private boolean allowAnonymous;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @GetMapping("/my")
    public List<Student> getStudentsByParent(Authentication authentication,
                                              @RequestParam(required = false) String parentUsername) {
        if (allowAnonymous) {
            if (parentUsername == null || parentUsername.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "家长账号不能为空");
            }
            return studentRepository.findByParentUsername(parentUsername);
        }
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "未登录或登录已过期");
        }
        String username = authentication.getName();
        if (parentUsername != null && !parentUsername.isBlank() && !parentUsername.equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "无权限访问");
        }
        return studentRepository.findByParentUsername(username);
    }

    @PostMapping
    public Map<String, Object> addStudent(@Valid @RequestBody Student student) {
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
