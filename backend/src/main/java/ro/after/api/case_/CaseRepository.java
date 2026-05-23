package ro.after.api.case_;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.after.api.auth.User;

import java.util.Optional;
import java.util.UUID;

public interface CaseRepository extends JpaRepository<CaseEntity, UUID> {
    Optional<CaseEntity> findByOwner(User owner);
}
