package com.vms.backend.controller;

import com.vms.backend.dto.ParticipationRequest;
import com.vms.backend.entity.Participation;
import com.vms.backend.entity.User;
import com.vms.backend.service.ParticipationService;
import com.vms.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participation")
@RequiredArgsConstructor
public class ParticipationController {

    private final ParticipationService participationService;
    private final UserService userService;

    @PostMapping("/join")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public Participation joinEvent(@Valid @RequestBody ParticipationRequest request,
                                   Authentication authentication) {
        User volunteer = userService.getByEmail(authentication.getName());
        return participationService.joinEvent(volunteer, request);
    }

    @PutMapping("/cancel/{eventId}")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public Participation cancel(@PathVariable Long eventId, Authentication authentication) {
        User volunteer = userService.getByEmail(authentication.getName());
        return participationService.cancelParticipation(volunteer, eventId);
    }

    @GetMapping("/my-events")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public List<Participation> myJoinedEvents(Authentication authentication) {
        User volunteer = userService.getByEmail(authentication.getName());
        return participationService.getJoinedEvents(volunteer);
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public List<Participation> eventParticipants(@PathVariable Long eventId) {
        return participationService.getEventParticipants(eventId);
    }
}
