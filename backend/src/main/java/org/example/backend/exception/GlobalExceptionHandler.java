package org.example.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.example.backend.dto.ApiResponse;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleException(Exception e) {
        ErrorCode errorCode = ErrorCode.UNCATEGORIZED;
        return ResponseEntity.badRequest().body(ApiResponse.builder()
                .status(errorCode.getCode())
                .message(errorCode.getMessage())
                .timestamp(System.currentTimeMillis())
                .build());
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse> handleAppException(AppException e) {
        ErrorCode errorCode = e.getErrorCode();
        return ResponseEntity.badRequest().body(ApiResponse.builder()
                .status(errorCode.getCode())
                .message(errorCode.getMessage())
                .timestamp(System.currentTimeMillis())
                .build());
    }
}
