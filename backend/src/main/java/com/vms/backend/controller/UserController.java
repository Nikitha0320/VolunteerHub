package com.vms.backend.controller;

import com.vms.backend.dto.PasswordResetCreateRequest;
import com.vms.backend.dto.ChangePasswordRequest;
import com.vms.backend.dto.UpdateProfileRequest;
import com.vms.backend.entity.User;
import com.vms.backend.service.PasswordResetService;
import com.vms.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('VOLUNTEER','ORGANIZER','ADMIN')")
    public Map<String, Object> getMe(Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
            "role", user.getRole(),
            "age", user.getAge(),
            "phoneNumber", user.getPhoneNumber(),
            "address", user.getAddress()
        );
    }

    @PostMapping("/password-reset-request")
    @PreAuthorize("hasAnyRole('VOLUNTEER','ORGANIZER','ADMIN')")
    public Map<String, String> requestPasswordReset(@Valid @RequestBody PasswordResetCreateRequest request,
                                                    Authentication authentication) {
        User user = userService.getByEmail(authentication.getName());
        passwordResetService.createResetRequest(user, request.getNewPassword());
        return Map.of("message", "Password reset request sent to admin.");
    }

    @PutMapping("/me/profile")
    @PreAuthorize("hasAnyRole('VOLUNTEER','ORGANIZER')")
    public Map<String, String> updateMyProfile(@RequestBody UpdateProfileRequest request,
                                                Authentication authentication) {
        userService.updateProfile(authentication.getName(), request);
        return Map.of("message", "Profile updated successfully.");
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                              Authentication authentication) {
        String message = userService.changePasswordOrRequestReset(
                authentication.getName(),
                request.getOldPassword(),
                request.getNewPassword()
        );
        return Map.of("message", message);
    }
}