package com.cc.repository;

import com.cc.model.Complaint;
import com.cc.model.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByCitizenId(Long citizenId);
    List<Complaint> findByDepartmentId(Long departmentId);
    List<Complaint> findByStatus(ComplaintStatus status);
}
