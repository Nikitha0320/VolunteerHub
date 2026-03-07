package com.vms.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ParticipationRequest {
    @NotNull
    private Long eventId;
    @NotNull
    private Long roleId;
}
