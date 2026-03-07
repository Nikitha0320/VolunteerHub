package com.vms.backend.service;

import com.vms.backend.dto.UpdateProfileRequest;
import com.vms.backend.entity.ResetRequestStatus;
import com.vms.backend.entity.User;
import com.vms.backend.repository.EventMessageRepository;
import com.vms.backend.repository.EventRepository;
import com.vms.backend.repository.ParticipationRepository;
import com.vms.backend.repository.PasswordResetRequestRepository;
import com.vms.backend.repository.UserRepository;
import com.vms.backend.repository.VolunteerRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EventMessageRepository eventMessageRepository;
    private final ParticipationRepository participationRepository;
    private final VolunteerRoleRepository volunteerRoleRepository;
    private final PasswordResetRequestRepository passwordResetRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetService passwordResetService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateProfile(String email, UpdateProfileRequest request) {
        User user = getByEmail(email);
        user.setAge(request.getAge());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        return userRepository.save(user);
    }

    @Transactional
    public String changePasswordOrRequestReset(String email, String oldPassword, String newPassword) {
        User user = getByEmail(email);
        if (passwordEncoder.matches(oldPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return "Password changed successfully.";
        }

        if (passwordResetRequestRepository.existsByUserIdAndStatus(user.getId(), ResetRequestStatus.PENDING)) {
            return "Old password is incorrect. You already have a pending reset request with admin.";
        }

        passwordResetService.createResetRequest(user, newPassword);
        return "Old password is incorrect. Password reset request sent to admin.";
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        passwordResetRequestRepository.deleteByUserId(userId);
        participationRepository.deleteByVolunteerId(userId);
        eventMessageRepository.deleteByOrganizerId(userId);

        var events = eventRepository.findByOrganizerId(userId);
        for (var event : events) {
            eventMessageRepository.deleteByEventId(event.getId());
            participationRepository.deleteByEventId(event.getId());
            volunteerRoleRepository.deleteByEventId(event.getId());
            eventRepository.deleteById(event.getId());
        }

        userRepository.deleteById(userId);
    }
}
