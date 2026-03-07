package com.vms.backend.repository;

import com.vms.backend.entity.EventMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EventMessageRepository extends JpaRepository<EventMessage, Long> {
    List<EventMessage> findByEventIdOrderByCreatedAtDesc(Long eventId);

    @Modifying
    @Query("delete from EventMessage em where em.event.id = :eventId")
    void deleteByEventId(Long eventId);

    @Modifying
    @Query("delete from EventMessage em where em.organizer.id = :organizerId")
    void deleteByOrganizerId(Long organizerId);
}
