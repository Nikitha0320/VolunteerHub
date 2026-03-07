package com.vms.backend.repository;

import com.vms.backend.entity.VolunteerRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VolunteerRoleRepository extends JpaRepository<VolunteerRole, Long> {
    List<VolunteerRole> findByEventId(Long eventId);

    @Modifying
    @Query("delete from VolunteerRole vr where vr.event.id = :eventId")
    void deleteByEventId(Long eventId);
}
