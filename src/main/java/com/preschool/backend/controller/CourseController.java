package com.preschool.backend.controller;

import com.preschool.backend.entity.Course;
import com.preschool.backend.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
            @RequestParam(required = false) String teacherName,
            @RequestParam(required = false) String parentUsername) {
        return ResponseEntity.ok(courseService.getAllCourses(teacherName, parentUsername));
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
