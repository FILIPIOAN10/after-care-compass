package ro.after.api.activity;

import jakarta.persistence.*;
import lombok.*;
import ro.after.api.case_.CaseEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "activity_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityEntry {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id", nullable = false)
    private CaseEntity caseEntity;

    @Column(nullable = false)
    private String actor;

    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityKind kind;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
