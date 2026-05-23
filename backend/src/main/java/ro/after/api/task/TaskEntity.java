package ro.after.api.task;

import jakarta.persistence.*;
import lombok.*;
import ro.after.api.case_.CaseEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id", nullable = false)
    private CaseEntity caseEntity;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String place;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPhase phase;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    private Integer orderIndex;

    @Column(length = 1000)
    private String note;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = createdAt;
        if (status == null) status = TaskStatus.WAITING;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
