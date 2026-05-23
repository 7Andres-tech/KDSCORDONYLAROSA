package com.cordonylarosa.kds;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String admin = encoder.encode("admin123");

   
        System.out.println("admin123 => " + admin);
    }
}
