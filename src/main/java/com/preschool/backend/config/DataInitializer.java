package com.preschool.backend.config;

import com.preschool.backend.entity.User;
import com.preschool.backend.entity.Student;
import com.preschool.backend.repository.UserRepository;
import com.preschool.backend.repository.StudentRepository;
import com.preschool.backend.util.PasswordUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("dev")
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, StudentRepository studentRepository) {
        return args -> {
            // 1. 初始化用户 (园长和家长)
            if (userRepository.findByUsername("admin").isEmpty()) {
                // Admin
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(PasswordUtil.encode("123456")); // 使用 BCrypt 加密
                admin.setRole("admin");
                admin.setRealName("系统管理员");
                admin.setPhone("13800138000");
                admin.setGender("男");
                userRepository.save(admin);
                System.out.println("【系统初始化】默认管理员账号已补全: admin / 123456 (密码已加密)");
            }

            if (userRepository.findByUsername("parent1").isEmpty()) {
                // Parent
                User parent = new User();
                parent.setUsername("parent1");
                parent.setPassword(PasswordUtil.encode("123456")); // 使用 BCrypt 加密
                parent.setRole("parent");
                parent.setRealName("家长一号");
                parent.setPhone("13900139000");
                userRepository.save(parent);
                System.out.println("【系统初始化】默认家长账号已补全: parent1 / 123456 (密码已加密)");
            }

            // 2. 初始化学生
            if (studentRepository.count() == 0) {
                Student child = new Student();
                child.setName("小团子");
                child.setParentUsername("parent1");
                child.setAge(5);
                child.setGender("M");
                studentRepository.save(child);
                System.out.println("--- 系统已初始化默认学生：小团子 (关联家长 parent1) ---");
            }
        };
    }
}
