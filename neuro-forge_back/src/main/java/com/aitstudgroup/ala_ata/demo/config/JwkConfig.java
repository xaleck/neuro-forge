package com.aitstudgroup.ala_ata.demo.config;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.JWSAlgorithm;

@Configuration
public class JwkConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Bean
    public JWKSource<SecurityContext> jwkSource() {
        try {
            // Make sure secret is at least 32 bytes for HS256
            byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            // If secret is too short, pad it
            if (secretBytes.length < 32) {
                byte[] paddedSecret = new byte[32];
                System.arraycopy(secretBytes, 0, paddedSecret, 0, secretBytes.length);
                secretBytes = paddedSecret;
            }
            
            SecretKey secretKey = new SecretKeySpec(secretBytes, "HmacSHA256");
            
            // Generate a consistent key ID based on the secret
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] digest = md.digest(jwtSecret.getBytes(StandardCharsets.UTF_8));
            String keyId = bytesToHex(digest).substring(0, 10);
            
            // Build the JWK with a key ID and algorithm
            JWK jwk = new OctetSequenceKey.Builder(secretKey)
                .keyID(keyId)  // Use the consistent key ID
                .algorithm(JWSAlgorithm.HS256)
                .build();
                
            return new ImmutableJWKSet<>(new JWKSet(jwk));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to create JWK source", e);
        }
    }
    
    private static String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    @Bean
    public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        // Same padding check for decoder
        if (secretBytes.length < 32) {
            byte[] paddedSecret = new byte[32];
            System.arraycopy(secretBytes, 0, paddedSecret, 0, secretBytes.length);
            secretBytes = paddedSecret;
        }
        SecretKey secretKey = new SecretKeySpec(secretBytes, "HmacSHA256");
        return NimbusReactiveJwtDecoder.withSecretKey(secretKey).build();
    }
} 