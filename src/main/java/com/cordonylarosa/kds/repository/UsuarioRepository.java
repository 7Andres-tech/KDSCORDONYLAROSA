package com.cordonylarosa.kds.repository;

import com.cordonylarosa.kds.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsernameAndActivoTrue(String username);
}