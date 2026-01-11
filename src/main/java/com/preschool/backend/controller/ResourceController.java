package com.preschool.backend.controller;

import com.preschool.backend.entity.SchoolResource;
import com.preschool.backend.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin
public class ResourceController {

    private static final Logger logger = Logger.getLogger(ResourceController.class.getName());

    @Autowired
    private ResourceRepository resourceRepository;

    /**
     * 获取某一类的所有选项
     * 例子: GET /api/resources?type=2 (获取所有老师)
     */
    @GetMapping
    public List<SchoolResource> getResources(@RequestParam Integer type) {
        return resourceRepository.findAllByType(type);
    }

    /**
     * 添加一个新选项 (只有园长能操作，前端会控制，后端这里先简单写)
     * 例子: POST /api/resources
     */
    @PostMapping
    public ResponseEntity<?> addResource(@RequestBody SchoolResource resource) {
        try {
            // 验证资源名称
            if (resource.getName() == null || resource.getName().trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("code", 400);
                error.put("message", "资源名称不能为空");
                return ResponseEntity.badRequest().body(error);
            }

            // 验证资源类型
            if (resource.getType() == null || resource.getType() < 1 || resource.getType() > 3) {
                Map<String, Object> error = new HashMap<>();
                error.put("code", 400);
                error.put("message", "资源类型必须是 1(科目)、2(老师) 或 3(地点)");
                return ResponseEntity.badRequest().body(error);
            }

            // 检查重复
            List<SchoolResource> existing = resourceRepository.findAllByType(resource.getType());
            boolean isDuplicate = existing.stream()
                    .anyMatch(r -> r.getName().trim().equalsIgnoreCase(resource.getName().trim()));

            if (isDuplicate) {
                Map<String, Object> error = new HashMap<>();
                error.put("code", 400);
                error.put("message", "该资源名称已存在");
                return ResponseEntity.badRequest().body(error);
            }

            SchoolResource saved = resourceRepository.save(resource);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.log(Level.SEVERE, "添加资源失败: " + e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("code", 500);
            error.put("message", "添加失败，请稍后重试");
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 删除一个选项
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResource(@PathVariable Long id) {
        try {
            if (!resourceRepository.existsById(id)) {
                Map<String, Object> error = new HashMap<>();
                error.put("code", 404);
                error.put("message", "资源不存在");
                return ResponseEntity.status(404).body(error);
            }
            resourceRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("code", 200, "message", "删除成功"));
        } catch (Exception e) {
            logger.log(Level.SEVERE, "删除资源失败: " + e.getMessage(), e);
            Map<String, Object> error = new HashMap<>();
            error.put("code", 500);
            error.put("message", "删除失败，请稍后重试");
            return ResponseEntity.status(500).body(error);
        }
    }
}