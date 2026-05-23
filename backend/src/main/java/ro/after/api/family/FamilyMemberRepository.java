package ro.after.api.family;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.after.api.case_.CaseEntity;

import java.util.List;
import java.util.UUID;

public interface FamilyMemberRepository extends JpaRepository<FamilyMember, UUID> {
    List<FamilyMember> findByCaseEntityOrderByCreatedAtAsc(CaseEntity caseEntity);
}
