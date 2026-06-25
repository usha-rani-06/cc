package com.cc.dto;

import com.cc.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @Email
    @NotBlank
    private String email;

    private String phone;

    private Role role = Role.CITIZEN;

    // Only relevant if role == DEPARTMENT_STAFF
    private Long departmentId;
}
