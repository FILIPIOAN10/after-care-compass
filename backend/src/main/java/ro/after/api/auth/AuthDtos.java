package ro.after.api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 120) String fullName,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 200) String password
    ) {}

    public record LoginRequest(
            @NotBlank String email,
            @NotBlank String password
    ) {}

    public record VerifyOtpRequest(
            @NotBlank String code
    ) {}

    public record AuthResponse(String token, UserSummary user) {}

    public record UserSummary(UUID id, String fullName, String email) {
        public static UserSummary of(User u) {
            return new UserSummary(u.getId(), u.getFullName(), u.getEmail());
        }
    }
}
