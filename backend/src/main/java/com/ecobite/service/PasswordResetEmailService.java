package com.ecobite.service;

import com.ecobite.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class PasswordResetEmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String frontendBaseUrl;

    public PasswordResetEmailService(JavaMailSender mailSender,
                                     @Value("${ecobite.mail.from:no-reply@ecobite.local}") String fromAddress,
                                     @Value("${ecobite.frontend.base-url:http://localhost:5173}") String frontendBaseUrl) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public void sendPasswordResetEmail(User user, String rawToken, long expirationMinutes) {
        String resetUrl = UriComponentsBuilder.fromUriString(frontendBaseUrl)
                .path("/reset-password")
                .queryParam("token", rawToken)
                .build()
                .encode()
                .toUriString();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("EcoBite password reset");
        message.setText("""
                Hello %s,

                We received a request to reset your EcoBite password. Use the link below to choose a new password:

                %s

                This link expires in %d minutes and can only be used once. If you did not request a password reset, you can safely ignore this email.
                """.formatted(user.getName(), resetUrl, expirationMinutes));
        mailSender.send(message);
    }
}
