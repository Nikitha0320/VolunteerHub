package com.vms.backend.service;

import com.vms.backend.dto.EventRequest;
import com.vms.backend.entity.Event;
import com.vms.backend.entity.EventMessage;
import com.vms.backend.entity.Role;
import com.vms.backend.entity.User;
import com.vms.backend.repository.EventMessageRepository;
import com.vms.backend.repository.EventRepository;
import com.vms.backend.repository.ParticipationRepository;
import com.vms.backend.repository.VolunteerRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventMessageRepository eventMessageRepository;
    private final ParticipationRepository participationRepository;
    private final VolunteerRoleRepository volunteerRoleRepository;

    public Event createEvent(EventRequest request, User organizer) {
        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .eventDate(request.getEventDate())
                .eventTime(request.getEventTime())
                .maxVolunteers(request.getMaxVolunteers())
                .organizer(organizer)
                .cancelled(false)
                .build();
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, EventRequest request, User organizer) {
        Event event = getById(id);
        if (!event.getOrganizer().getId().equals(organizer.getId()) && organizer.getRole() != Role.ADMIN) {
            throw new RuntimeException("Not your event");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        event.setEventTime(request.getEventTime());
        event.setMaxVolunteers(request.getMaxVolunteers());
        Event updatedEvent = eventRepository.save(event);

        EventMessage reminder = EventMessage.builder()
            .event(updatedEvent)
            .organizer(organizer)
            .message("Reminder: Event details were updated. New schedule/location: "
                + updatedEvent.getEventDate() + " " + updatedEvent.getEventTime()
                + " at " + updatedEvent.getLocation() + ".")
            .build();
        eventMessageRepository.save(reminder);

        return updatedEvent;
    }

    public Event cancelEvent(Long id, String reason, User actor) {
        Event event = getById(id);
        if (!event.getOrganizer().getId().equals(actor.getId()) && actor.getRole() != Role.ADMIN) {
            throw new RuntimeException("Not allowed to cancel this event");
        }

        event.setCancelled(true);
        event.setCancellationReason(reason);
        Event cancelledEvent = eventRepository.save(event);

        EventMessage cancelNotice = EventMessage.builder()
                .event(cancelledEvent)
                .organizer(event.getOrganizer())
                .message("Important: Event has been cancelled. Reason: " + (reason == null || reason.isBlank() ? "No reason provided" : reason))
                .build();
        eventMessageRepository.save(cancelNotice);

        return cancelledEvent;
    }

    @Transactional
    public void deleteEvent(Long id, User organizer) {
        Event event = getById(id);
        if (!event.getOrganizer().getId().equals(organizer.getId()) && organizer.getRole() != Role.ADMIN) {
            throw new RuntimeException("Not your event");
        }

        Long eventId = event.getId();

        eventMessageRepository.deleteAllInBatch(eventMessageRepository.findByEventIdOrderByCreatedAtDesc(eventId));
        participationRepository.deleteAllInBatch(participationRepository.findByEventId(eventId));
        volunteerRoleRepository.deleteAllInBatch(volunteerRoleRepository.findByEventId(eventId));

        eventRepository.deleteById(eventId);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getById(Long id) {
        return eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public List<Event> getByOrganizer(Long organizerId) {
        return eventRepository.findByOrganizerId(organizerId);
    }
}
