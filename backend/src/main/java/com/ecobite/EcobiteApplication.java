package com.ecobite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EcobiteApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcobiteApplication.class, args);
    }
}
