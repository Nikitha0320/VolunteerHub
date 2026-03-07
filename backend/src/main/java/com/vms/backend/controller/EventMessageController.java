package com.vms.backend.controller;

import com.vms.backend.dto.EventMessageRequest;
import com.vms.backend.entity.EventMessage;
import com.vms.backend.entity.User;
import com.vms.backend.service.EventMessageService;
import com.vms.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events/{eventId}/messages")
@RequiredArgsConstructor
public class EventMessageController {

    private final EventMessageService eventMessageService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public EventMessage postMessage(@PathVariable Long eventId,
                                    @Valid @RequestBody EventMessageRequest request,
                                    Authentication authentication) {
        User organizer = userService.getByEmail(authentication.getName());
        return eventMessageService.createMessage(eventId, request, organizer);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('VOLUNTEER','ORGANIZER','ADMIN')")
    public List<EventMessage> getMessages(@PathVariable Long eventId,
                                          Authentication authentication) {
        User requester = userService.getByEmail(authentication.getName());
        return eventMessageService.getEventMessages(eventId, requester);
    }
}
