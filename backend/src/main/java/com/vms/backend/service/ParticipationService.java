package com.vms.backend.service;

import com.vms.backend.dto.ParticipationRequest;
import com.vms.backend.entity.*;
import com.vms.backend.repository.ParticipationRepository;
import com.vms.backend.repository.VolunteerRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParticipationService {

    private final ParticipationRepository participationRepository;
    private final EventService eventService;
    private final VolunteerRoleRepository volunteerRoleRepository;

    public Participation joinEvent(User volunteer, ParticipationRequest request) {
        Participation existing = participationRepository
                .findByVolunteerIdAndEventId(volunteer.getId(), request.getEventId())
                .orElse(null);
        if (existing != null && existing.getStatus() == ParticipationStatus.JOINED) {
            throw new RuntimeException("Already joined this event");
        }

        Event event = eventService.getById(request.getEventId());
        if (event.isCancelled()) {
            throw new RuntimeException("This event is cancelled and cannot be joined.");
        }

        VolunteerRole role = volunteerRoleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        if (!role.getEvent().getId().equals(event.getId())) {
            throw new RuntimeException("Role does not belong to event");
        }

        long filled = participationRepository.countByRoleIdAndStatus(role.getId(), ParticipationStatus.JOINED);
        if (filled >= role.getVolunteersRequired()) {
            throw new RuntimeException("Selected role is already full.");
        }

        Participation participation = existing == null ? Participation.builder().build() : existing;
        participation.setVolunteer(volunteer);
        participation.setEvent(event);
        participation.setRole(role);
        participation.setStatus(ParticipationStatus.JOINED);
        return participationRepository.save(participation);
    }

    public Participation cancelParticipation(User volunteer, Long eventId) {
        Participation participation = participationRepository
                .findByVolunteerIdAndEventId(volunteer.getId(), eventId)
                .orElseThrow(() -> new RuntimeException("Participation not found"));
        participation.setStatus(ParticipationStatus.CANCELLED);
        return participationRepository.save(participation);
    }

    public List<Participation> getJoinedEvents(User volunteer) {
        return participationRepository.findByVolunteerIdAndStatus(volunteer.getId(), ParticipationStatus.JOINED);
    }

    public List<Participation> getEventParticipants(Long eventId) {
        return participationRepository.findByEventId(eventId);
    }
}
