package com.vms.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordResetCreateRequest {
    @NotBlank
    private String newPassword;
}
