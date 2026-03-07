package com.vms.backend.service;

import com.vms.backend.dto.VolunteerRoleRequest;
import com.vms.backend.entity.Event;
import com.vms.backend.entity.ParticipationStatus;
import com.vms.backend.entity.User;
import com.vms.backend.entity.VolunteerRole;
import com.vms.backend.repository.ParticipationRepository;
import com.vms.backend.repository.VolunteerRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VolunteerRoleService {

    private final VolunteerRoleRepository volunteerRoleRepository;
    private final EventService eventService;
    private final ParticipationRepository participationRepository;

    public VolunteerRole addRole(Long eventId, VolunteerRoleRequest request, User organizer) {
        Event event = eventService.getById(eventId);
        if (!event.getOrganizer().getId().equals(organizer.getId())) {
            throw new RuntimeException("Not your event");
        }

        VolunteerRole role = VolunteerRole.builder()
                .event(event)
                .roleName(request.getRoleName())
                .roleDescription(request.getRoleDescription())
                .volunteersRequired(request.getVolunteersRequired())
                .build();
        return volunteerRoleRepository.save(role);
    }

    public List<VolunteerRole> getByEvent(Long eventId) {
        List<VolunteerRole> roles = volunteerRoleRepository.findByEventId(eventId);
        roles.forEach(role -> {
            long filled = participationRepository.countByRoleIdAndStatus(role.getId(), ParticipationStatus.JOINED);
            role.setFilledCount((int) filled);
        });
        return roles;
    }
}
