package com.vms.backend.controller;

import com.vms.backend.dto.PasswordResetAdminResponse;
import com.vms.backend.entity.User;
import com.vms.backend.service.PasswordResetService;
import com.vms.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;

    @GetMapping("/users")
    public List<User> getUsers() {
        return userService.getAllUsers();
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    @GetMapping("/password-reset-requests")
    public List<PasswordResetAdminResponse> getPendingResetRequests() {
        return passwordResetService.getPendingRequests();
    }

    @PutMapping("/password-reset-requests/{id}/approve")
    public void approveResetRequest(@PathVariable Long id) {
        passwordResetService.approveRequest(id);
    }
}

