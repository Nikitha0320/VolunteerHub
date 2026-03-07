package com.vms.backend.repository;

import com.vms.backend.entity.Participation;
import com.vms.backend.entity.ParticipationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ParticipationRepository extends JpaRepository<Participation, Long> {
    List<Participation> findByVolunteerId(Long volunteerId);
    List<Participation> findByVolunteerIdAndStatus(Long volunteerId, ParticipationStatus status);
    List<Participation> findByEventId(Long eventId);
    Optional<Participation> findByVolunteerIdAndEventId(Long volunteerId, Long eventId);
    long countByRoleIdAndStatus(Long roleId, ParticipationStatus status);

    @Modifying
    @Query("delete from Participation p where p.volunteer.id = :volunteerId")
    void deleteByVolunteerId(Long volunteerId);

    @Modifying
    @Query("delete from Participation p where p.event.id = :eventId")
    void deleteByEventId(Long eventId);
}
