package com.vms.backend.controller;

import com.vms.backend.dto.VolunteerRoleRequest;
import com.vms.backend.entity.User;
import com.vms.backend.entity.VolunteerRole;
import com.vms.backend.service.UserService;
import com.vms.backend.service.VolunteerRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events/{eventId}/roles")
@RequiredArgsConstructor
public class VolunteerRoleController {

    private final VolunteerRoleService volunteerRoleService;
    private final UserService userService;

    @GetMapping
    public List<VolunteerRole> getRolesByEvent(@PathVariable Long eventId) {
        return volunteerRoleService.getByEvent(eventId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public VolunteerRole addRole(@PathVariable Long eventId,
                                 @Valid @RequestBody VolunteerRoleRequest request,
                                 Authentication authentication) {
        User organizer = userService.getByEmail(authentication.getName());
        return volunteerRoleService.addRole(eventId, request, organizer);
    }
}
