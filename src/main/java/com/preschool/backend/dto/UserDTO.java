package com.preschool.backend.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String role;
    private String realName;
    private String phone;
    private String gender;

    // Factory method to convert Entity to DTO
    public static UserDTO fromEntity(com.preschool.backend.entity.User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setRole(user.getRole());
        dto.setRealName(user.getRealName());
        dto.setPhone(user.getPhone());
        dto.setGender(user.getGender());
        return dto;
    }
}
