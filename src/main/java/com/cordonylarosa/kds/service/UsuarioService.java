package com.cordonylarosa.kds.service;

import com.cordonylarosa.kds.dto.UsuarioRequest;
import com.cordonylarosa.kds.dto.UsuarioResponse;
import com.cordonylarosa.kds.entity.Usuario;
import com.cordonylarosa.kds.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UsuarioResponse crear(UsuarioRequest request) {
        Usuario usuario = new Usuario();
        usuario.setUsername(request.username());
        usuario.setPassword(passwordEncoder.encode(request.password()));
        usuario.setRol(request.rol());
        usuario.setActivo(request.activo() != null ? request.activo() : true);

        return toResponse(usuarioRepository.save(usuario));
    }

    public UsuarioResponse actualizar(Long id, UsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setUsername(request.username());
        usuario.setRol(request.rol());
        usuario.setActivo(request.activo());

        if (request.password() != null && !request.password().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.password()));
        }

        return toResponse(usuarioRepository.save(usuario));
    }

    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getRol(),
                usuario.getActivo()
        );
    }
}