package com.cc.controller;

import com.cc.dto.AssignRequest;
import com.cc.dto.ComplaintRequest;
import com.cc.dto.UpdateRequest;
import com.cc.model.*;
import com.cc.repository.ComplaintRepository;
import com.cc.repository.ComplaintUpdateRepository;
import com.cc.repository.DepartmentRepository;
import com.cc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintRepository complaintRepository;
    private final ComplaintUpdateRepository complaintUpdateRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    private User currentUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName()).orElseThrow();
    }

    // Citizens see only their own complaints; admins see all; dept staff see complaints assigned to their dept
    @GetMapping
    public List<Complaint> getAll(Authentication auth) {
        User user = currentUser(auth);
        switch (user.getRole()) {
            case CITIZEN:
                return complaintRepository.findByCitizenId(user.getId());
            case DEPARTMENT_STAFF:
                if (user.getDepartment() == null) return List.of();
                return complaintRepository.findByDepartmentId(user.getDepartment().getId());
            case ADMIN:
            default:
                return complaintRepository.findAll();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return complaintRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Complaint create(@RequestBody ComplaintRequest req, Authentication auth) {
        User citizen = currentUser(auth);

        Complaint complaint = new Complaint();
        complaint.setTitle(req.getTitle());
        complaint.setDescription(req.getDescription());
        complaint.setCategory(req.getCategory());
        complaint.setLocation(req.getLocation());
        complaint.setCitizen(citizen);
        complaint.setStatus(ComplaintStatus.SUBMITTED);

        return complaintRepository.save(complaint);
    }

    // Admin assigns complaint to a department
    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assign(@PathVariable Long id, @RequestBody AssignRequest req) {
        return complaintRepository.findById(id).map(complaint -> {
            Department dept = departmentRepository.findById(req.getDepartmentId()).orElse(null);
            if (dept == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Department not found"));
            }
            complaint.setDepartment(dept);
            complaint.setStatus(ComplaintStatus.ASSIGNED);
            return ResponseEntity.ok(complaintRepository.save(complaint));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Admin or department staff posts an update/comment and optionally changes status
    @PostMapping("/{id}/updates")
    public ResponseEntity<?> addUpdate(@PathVariable Long id, @RequestBody UpdateRequest req, Authentication auth) {
        return complaintRepository.findById(id).map(complaint -> {
            User author = currentUser(auth);

            if (req.getStatus() != null) {
                complaint.setStatus(req.getStatus());
                complaintRepository.save(complaint);
            }

            ComplaintUpdate update = new ComplaintUpdate();
            update.setComplaint(complaint);
            update.setAuthor(author);
            update.setMessage(req.getMessage());
            update.setStatusAtUpdate(complaint.getStatus());

            return ResponseEntity.ok(complaintUpdateRepository.save(update));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/updates")
    public List<ComplaintUpdate> getUpdates(@PathVariable Long id) {
        return complaintUpdateRepository.findByComplaintIdOrderByCreatedAtAsc(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!complaintRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        complaintRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Complaint deleted"));
    }

    // Simple report: counts by status
    @GetMapping("/reports/status-summary")
    public Map<String, Long> statusSummary() {
        List<Complaint> all = complaintRepository.findAll();
        return all.stream().collect(java.util.stream.Collectors.groupingBy(
                c -> c.getStatus().name(), java.util.stream.Collectors.counting()
        ));
    }

    // Report: counts by department
    @GetMapping("/reports/department-summary")
    public Map<String, Long> departmentSummary() {
        List<Complaint> all = complaintRepository.findAll();
        return all.stream()
                .filter(c -> c.getDepartment() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        c -> c.getDepartment().getName(), java.util.stream.Collectors.counting()
                ));
    }
}
