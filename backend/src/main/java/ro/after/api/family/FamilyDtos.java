package ro.after.api.family;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class FamilyDtos {

    public record InviteRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @NotNull MemberRole role
    ) {}

    public record MemberResponse(
            UUID id,
            String name,
            String email,
            MemberRole role,
            InvitationStatus status,
            Instant createdAt
    ) {
        public static MemberResponse of(FamilyMember m) {
            return new MemberResponse(m.getId(), m.getName(), m.getEmail(), m.getRole(),
                    m.getStatus(), m.getCreatedAt());
        }
    }
}
