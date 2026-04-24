package com.backend.backend;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(
            ResponseStatusException ex,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = ex.getReason() != null ? ex.getReason() : status.getReasonPhrase();
        return ResponseEntity.status(status)
                .body(new ApiErrorResponse(status.value(), status.getReasonPhrase(), message, request.getRequestURI()));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingRequestParameter(
            MissingServletRequestParameterException ex,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        String message = "Missing required parameter: " + ex.getParameterName();
        return ResponseEntity.status(status)
                .body(new ApiErrorResponse(status.value(), status.getReasonPhrase(), message, request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        String message = "Invalid value for parameter: " + ex.getName();
        return ResponseEntity.status(status)
                .body(new ApiErrorResponse(status.value(), status.getReasonPhrase(), message, request.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(
            Exception ex,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        return ResponseEntity.status(status)
                .body(new ApiErrorResponse(status.value(), status.getReasonPhrase(), "Unexpected server error", request.getRequestURI()));
    }

    private record ApiErrorResponse(int status, String error, String message, String path) {}
}
