package com.cordonylarosa.kds;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String cajero = encoder.encode("cajero123");
        String cocina = encoder.encode("cocina123");

        System.out.println("cajero123 => " + cajero);
        System.out.println("cocina123 => " + cocina);
    }
}
