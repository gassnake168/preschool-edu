package com.preschool.backend.repository;

import com.preschool.backend.entity.SchoolResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<SchoolResource, Long> {
    // 自动生成一个方法：根据类型查找所有资源
    // 比如：findAllByType(2) 就能把所有老师查出来
    List<SchoolResource> findAllByType(Integer type);

    boolean existsByTypeAndNameIgnoreCase(Integer type, String name);
}
