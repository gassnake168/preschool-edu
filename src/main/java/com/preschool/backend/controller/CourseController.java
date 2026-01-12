package com.preschool.backend.controller;

import com.preschool.backend.entity.Course;
import com.preschool.backend.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<?> getAllCourses(
            Authentication authentication,
            @RequestParam(required = false) String teacherName,
            @RequestParam(required = false) String parentUsername) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("未登录或登录已过期");
        }
        String username = authentication.getName();
        if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_TEACHER"))) {
            return ResponseEntity.ok(courseService.getAllCourses(username, null));
        }
        if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_PARENT"))) {
            return ResponseEntity.ok(courseService.getAllCourses(null, username));
        }
        if (authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.ok(courseService.getAllCourses(teacherName, parentUsername));
        }
        return ResponseEntity.status(403).body("无权限访问");
    }

    @PostMapping
    public ResponseEntity<?> addCourse(@Valid @RequestBody Course course) {
        return ResponseEntity.ok(courseService.addCourse(course));
    }

    // --- (新增) 删除接口 ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok("删除成功");
    }

    // --- (新增) 修改接口 ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @Valid @RequestBody Course course) {
        Course updated = courseService.updateCourse(id, course);
        return ResponseEntity.ok(updated);
    }
}
