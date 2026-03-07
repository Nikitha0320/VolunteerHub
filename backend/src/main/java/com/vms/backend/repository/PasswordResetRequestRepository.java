package com.vms.backend.repository;

import com.vms.backend.entity.PasswordResetRequest;
import com.vms.backend.entity.ResetRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {
    boolean existsByUserIdAndStatus(Long userId, ResetRequestStatus status);
    List<PasswordResetRequest> findByStatusOrderByRequestedAtDesc(ResetRequestStatus status);

    @Modifying
    @Query("delete from PasswordResetRequest pr where pr.user.id = :userId")
    void deleteByUserId(Long userId);
}
