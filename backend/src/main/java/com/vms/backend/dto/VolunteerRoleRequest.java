package com.vms.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VolunteerRoleRequest {
    @NotBlank
    private String roleName;
    private String roleDescription;
    @NotNull
    private Integer volunteersRequired;
}
