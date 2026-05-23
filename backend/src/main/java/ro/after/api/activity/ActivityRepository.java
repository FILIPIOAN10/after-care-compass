package ro.after.api.activity;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ro.after.api.case_.CaseEntity;

import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<ActivityEntry, UUID> {
    List<ActivityEntry> findByCaseEntityOrderByCreatedAtDesc(CaseEntity caseEntity, Pageable pageable);
}
