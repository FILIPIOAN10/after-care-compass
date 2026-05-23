package ro.after.api.case_;

import jakarta.persistence.*;
import lombok.*;
import ro.after.api.auth.User;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String familyName;

    private String deceasedName;
    private String deceasedCnp;
    private LocalDate deathDate;
    private String deathPlace;
    private String maritalStatus;

    @Enumerated(EnumType.STRING)
    private PlaceOfDeath placeOfDeath;

    private boolean wasRetired;
    private boolean ownedProperty;
    private boolean ownedVehicle;
    private boolean wasCompanyAdmin;
    private boolean hasSurvivingFamily;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
