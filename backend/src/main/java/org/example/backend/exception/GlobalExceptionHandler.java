package org.example.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.example.backend.dto.ApiResponse;

@ControllerAdvice
public class GlobalExceptionHandler {

    @SuppressWarnings("static-access")
    @org.springframework.web.bind.annotation.ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleException(RuntimeException e) {
        ErrorCode errorCode = ErrorCode.UNCATEGORIZED;
        return ResponseEntity.badRequest().body(new ApiResponse<>().builder()
        .status(errorCode.getCode())
        .message(errorCode.getMessage())
        .timestamp(System.currentTimeMillis())
        .build());
    }

    @SuppressWarnings("static-access")
    @org.springframework.web.bind.annotation.ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse> handleAppException(AppException e) {
        ErrorCode errorCode = e.getErrorCode();
        return ResponseEntity.badRequest().body(new ApiResponse<>().builder()
        .status(errorCode.getCode())
        .message(errorCode.getMessage())
        .timestamp(System.currentTimeMillis())
        .build());
    }
}
