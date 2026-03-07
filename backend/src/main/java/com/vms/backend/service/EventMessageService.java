package com.vms.backend.service;

import com.vms.backend.dto.EventMessageRequest;
import com.vms.backend.entity.Event;
import com.vms.backend.entity.EventMessage;
import com.vms.backend.entity.Role;
import com.vms.backend.entity.User;
import com.vms.backend.repository.EventMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventMessageService {

    private final EventMessageRepository eventMessageRepository;
    private final EventService eventService;

    public EventMessage createMessage(Long eventId, EventMessageRequest request, User organizer) {
        Event event = eventService.getById(eventId);
        if (!event.getOrganizer().getId().equals(organizer.getId())) {
            throw new RuntimeException("Not your event");
        }

        EventMessage message = EventMessage.builder()
                .event(event)
                .organizer(organizer)
                .message(request.getMessage())
                .build();
        return eventMessageRepository.save(message);
    }

    public List<EventMessage> getEventMessages(Long eventId) {
        return eventMessageRepository.findByEventIdOrderByCreatedAtDesc(eventId);
    }

    public List<EventMessage> getEventMessages(Long eventId, User requester) {
        Event event = eventService.getById(eventId);
        if (requester.getRole() == Role.ORGANIZER && !event.getOrganizer().getId().equals(requester.getId())) {
            throw new RuntimeException("Not allowed to access this event");
        }
        return eventMessageRepository.findByEventIdOrderByCreatedAtDesc(eventId);
    }
}
