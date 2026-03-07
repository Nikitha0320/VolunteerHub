package com.vms.backend.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private Integer age;
    private String phoneNumber;
    private String address;
}
