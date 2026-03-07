package com.vms.backend.service;

import com.vms.backend.dto.AuthRequest;
import com.vms.backend.dto.AuthResponse;
import com.vms.backend.dto.RegisterRequest;
import com.vms.backend.entity.User;
import com.vms.backend.exception.EmailAlreadyExistsException;
import com.vms.backend.repository.UserRepository;
import com.vms.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
                        throw new EmailAlreadyExistsException("Email already exists. Please use a different email.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .age(request.getRole() == com.vms.backend.entity.Role.ADMIN ? null : request.getAge())
                .phoneNumber(request.getRole() == com.vms.backend.entity.Role.ADMIN ? null : request.getPhoneNumber())
                .address(request.getRole() == com.vms.backend.entity.Role.ADMIN ? null : request.getAddress())
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), java.util.Collections.emptyList()));

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), java.util.Collections.emptyList()));

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
