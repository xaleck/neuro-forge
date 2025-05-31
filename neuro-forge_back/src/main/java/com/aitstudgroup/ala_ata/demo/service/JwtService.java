package com.aitstudgroup.ala_ata.demo.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.aitstudgroup.ala_ata.demo.model.Player;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final long jwtExpirationMillis;

    public JwtService(JwtEncoder jwtEncoder, @Value("${jwt.expiration}") long jwtExpirationMillis) {
        this.jwtEncoder = jwtEncoder;
        this.jwtExpirationMillis = jwtExpirationMillis;
    }

    public String generateToken(Player player) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer("neuroforge")
            .issuedAt(now)
            .expiresAt(now.plus(jwtExpirationMillis, ChronoUnit.MILLIS))
            .subject(player.getId().toString())
            .claim("username", player.getUsername())
            .claim("roles", List.of("ROLE_USER"))
            .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
} 