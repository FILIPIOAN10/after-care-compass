package ro.after.api.document;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.after.api.case_.CaseEntity;

import java.util.List;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<DocumentEntity, UUID> {
    List<DocumentEntity> findByCaseEntityOrderByCreatedAtDesc(CaseEntity caseEntity);
}
