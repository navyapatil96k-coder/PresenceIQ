package com.presenceiq.auth;

import com.presenceiq.user.User;
import com.presenceiq.user.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest req) {

        if (userRepository.existsByEmail(req.email)) {
            return "Email already exists";
        }

        User user = new User();
        user.setName(req.name);
        user.setEmail(req.email);
        user.setPasswordHash(encoder.encode(req.password));

        userRepository.save(user);
        return "User registered successfully";
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {

        User user = userRepository.findByEmail(req.email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!encoder.matches(req.password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponse(token, user.getId(), user.getName());
    }

    // ---------------- DTO CLASSES ----------------

    static class RegisterRequest {
        public String name;
        public String email;
        public String password;
    }

    static class LoginRequest {
        public String email;
        public String password;
    }

    static class LoginResponse {
        public String token;
        public Long userId;
        public String name;

        public LoginResponse(String token, Long userId, String name) {
            this.token = token;
            this.userId = userId;
            this.name = name;
        }
    }
}
