package com.vms.backend.service;

import com.vms.backend.dto.PasswordResetAdminResponse;
import com.vms.backend.entity.PasswordResetRequest;
import com.vms.backend.entity.ResetRequestStatus;
import com.vms.backend.entity.User;
import com.vms.backend.repository.PasswordResetRequestRepository;
import com.vms.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetRequestRepository passwordResetRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public void createResetRequest(User user, String newPassword) {
        if (passwordResetRequestRepository.existsByUserIdAndStatus(user.getId(), ResetRequestStatus.PENDING)) {
            throw new RuntimeException("You already have a pending reset request.");
        }

        PasswordResetRequest request = PasswordResetRequest.builder()
                .user(user)
                .requestedPasswordHash(passwordEncoder.encode(newPassword))
                .status(ResetRequestStatus.PENDING)
                .build();

        passwordResetRequestRepository.save(request);
    }

    public List<PasswordResetAdminResponse> getPendingRequests() {
        return passwordResetRequestRepository.findByStatusOrderByRequestedAtDesc(ResetRequestStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void approveRequest(Long requestId) {
        PasswordResetRequest request = passwordResetRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Reset request not found"));

        if (request.getStatus() != ResetRequestStatus.PENDING) {
            throw new RuntimeException("Reset request already processed");
        }

        User user = request.getUser();
        user.setPassword(request.getRequestedPasswordHash());
        userRepository.save(user);

        request.setStatus(ResetRequestStatus.APPROVED);
        request.setProcessedAt(LocalDateTime.now());
        passwordResetRequestRepository.save(request);
    }

    private PasswordResetAdminResponse toResponse(PasswordResetRequest request) {
        return PasswordResetAdminResponse.builder()
                .id(request.getId())
                .userId(request.getUser().getId())
                .userName(request.getUser().getName())
                .userEmail(request.getUser().getEmail())
                .status(request.getStatus())
                .requestedAt(request.getRequestedAt())
                .processedAt(request.getProcessedAt())
                .build();
    }
}
