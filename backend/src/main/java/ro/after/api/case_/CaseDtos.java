package ro.after.api.case_;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public class CaseDtos {

    public record OnboardingRequest(
            @NotNull PlaceOfDeath placeOfDeath,
            String deceasedName,
            String deceasedCnp,
            LocalDate deathDate,
            String deathPlace,
            String maritalStatus,
            boolean wasRetired,
            boolean ownedProperty,
            boolean ownedVehicle,
            boolean wasCompanyAdmin,
            boolean hasSurvivingFamily
    ) {}

    public record CaseResponse(
            UUID id,
            String familyName,
            String ownerName,
            String deceasedName,
            String deceasedCnp,
            LocalDate deathDate,
            String deathPlace,
            String maritalStatus,
            PlaceOfDeath placeOfDeath,
            boolean wasRetired,
            boolean ownedProperty,
            boolean ownedVehicle,
            boolean wasCompanyAdmin,
            boolean hasSurvivingFamily,
            long totalTasks,
            long completedTasks
    ) {
        public static CaseResponse of(CaseEntity c, String ownerName, long total, long done) {
            return new CaseResponse(
                    c.getId(), c.getFamilyName(), ownerName,
                    c.getDeceasedName(), c.getDeceasedCnp(), c.getDeathDate(),
                    c.getDeathPlace(), c.getMaritalStatus(), c.getPlaceOfDeath(),
                    c.isWasRetired(), c.isOwnedProperty(), c.isOwnedVehicle(),
                    c.isWasCompanyAdmin(), c.isHasSurvivingFamily(),
                    total, done
            );
        }
    }
}
