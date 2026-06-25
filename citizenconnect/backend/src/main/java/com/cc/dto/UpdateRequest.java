package com.cc.dto;

import com.cc.model.ComplaintStatus;
import lombok.Data;

@Data
public class UpdateRequest {
    private String message;
    private ComplaintStatus status;
}
