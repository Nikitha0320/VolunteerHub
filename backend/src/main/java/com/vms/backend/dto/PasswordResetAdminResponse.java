package com.vms.backend.dto;

import com.vms.backend.entity.ResetRequestStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PasswordResetAdminResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private ResetRequestStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
}
