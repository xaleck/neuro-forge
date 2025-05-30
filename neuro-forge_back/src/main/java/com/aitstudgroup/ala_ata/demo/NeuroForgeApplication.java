package com.aitstudgroup.ala_ata.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // Добавить эту аннотацию
public class NeuroForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(NeuroForgeApplication.class, args);
    }
}
