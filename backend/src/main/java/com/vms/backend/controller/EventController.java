package com.vms.backend.controller;

import com.vms.backend.dto.EventRequest;
import com.vms.backend.dto.CancelEventRequest;
import com.vms.backend.entity.Event;
import com.vms.backend.entity.User;
import com.vms.backend.service.EventService;
import com.vms.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final UserService userService;

    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public Event getEventById(@PathVariable Long id) {
        return eventService.getById(id);
    }

    @GetMapping("/organizer/my")
    @PreAuthorize("hasRole('ORGANIZER')")
    public List<Event> getMyEvents(Authentication authentication) {
        User organizer = userService.getByEmail(authentication.getName());
        return eventService.getByOrganizer(organizer.getId());
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public Event createEvent(@Valid @RequestBody EventRequest request, Authentication authentication) {
        User organizer = userService.getByEmail(authentication.getName());
        return eventService.createEvent(request, organizer);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public Event updateEvent(@PathVariable Long id,
                             @Valid @RequestBody EventRequest request,
                             Authentication authentication) {
        User organizer = userService.getByEmail(authentication.getName());
        return eventService.updateEvent(id, request, organizer);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public Event cancelEvent(@PathVariable Long id,
                             @RequestBody(required = false) CancelEventRequest request,
                             Authentication authentication) {
        User actor = userService.getByEmail(authentication.getName());
        String reason = request == null ? null : request.getReason();
        return eventService.cancelEvent(id, reason, actor);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public void deleteEvent(@PathVariable Long id, Authentication authentication) {
        User organizer = userService.getByEmail(authentication.getName());
        eventService.deleteEvent(id, organizer);
    }
}
