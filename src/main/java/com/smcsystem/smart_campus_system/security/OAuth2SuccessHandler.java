package com.smcsystem.smart_campus_system.security;

import com.smcsystem.smart_campus_system.enums.AuthProvider;
import com.smcsystem.smart_campus_system.enums.ApprovalStatus;
import com.smcsystem.smart_campus_system.enums.RegistrationType;
import com.smcsystem.smart_campus_system.enums.Role;
import com.smcsystem.smart_campus_system.enums.UserType;
import com.smcsystem.smart_campus_system.model.User;
import com.smcsystem.smart_campus_system.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");

        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            if (user.getApprovalStatus() == ApprovalStatus.PENDING) {
                clearGoogleRegistrationCookie(response);
                response.sendRedirect(frontendUrl + "/login?oauth=pending");
                return;
            }

            if (user.getApprovalStatus() == ApprovalStatus.REJECTED) {
                clearGoogleRegistrationCookie(response);
                response.sendRedirect(frontendUrl + "/login?oauth=rejected");
                return;
            }

            user.setName(name);
            user.setPictureUrl(picture);
            user.setLastLoginAt(LocalDateTime.now());

            User savedUser = userRepository.save(user);

            String token = jwtService.generateToken(
                    savedUser.getEmail(),
                    savedUser.getId(),
                    savedUser.getRole().name()
            );

            boolean profileCompleted = savedUser.getRole() != Role.USER || savedUser.getUserType() != null;

            clearGoogleRegistrationCookie(response);
            response.sendRedirect(frontendUrl
                    + "/oauth-success?token=" + urlEncode(token)
                    + "&profileCompleted=" + profileCompleted);
            return;
        }

        Optional<RegistrationType> registrationType = readGoogleRegistrationType(request);
        if (registrationType.isEmpty() || registrationType.get() == RegistrationType.NORMAL_USER) {
            response.sendRedirect(frontendUrl + "/register?oauth=registration-required");
            return;
        }

        User newUser = User.builder()
                .name(name)
                .email(email.trim().toLowerCase())
                .password(null)
                .role(resolveRole(registrationType.get()))
                .userType(resolveUserType(registrationType.get()))
                .authProvider(AuthProvider.GOOGLE)
                .pictureUrl(picture)
                .isActive(true)
                .emailVerified(true)
                .approvalStatus(ApprovalStatus.PENDING)
                .lastLoginAt(LocalDateTime.now())
                .build();

        userRepository.save(newUser);
        clearGoogleRegistrationCookie(response);
        response.sendRedirect(frontendUrl + "/login?oauth=registered-pending");
    }

    private Optional<RegistrationType> readGoogleRegistrationType(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }

        return Arrays.stream(request.getCookies())
                .filter(cookie -> "google_registration_type".equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .flatMap(value -> {
                    try {
                        return Optional.of(RegistrationType.valueOf(value));
                    } catch (IllegalArgumentException ex) {
                        return Optional.empty();
                    }
                });
    }

    private Role resolveRole(RegistrationType registrationType) {
        return registrationType == RegistrationType.TECHNICIAN ? Role.TECHNICIAN : Role.USER;
    }

    private UserType resolveUserType(RegistrationType registrationType) {
        return switch (registrationType) {
            case STUDENT -> UserType.STUDENT;
            case LECTURER -> UserType.LECTURER;
            case NORMAL_USER, TECHNICIAN -> null;
        };
    }

    private void clearGoogleRegistrationCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("google_registration_type", "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
