package com.ereblink.backend.common

import org.springframework.http.HttpStatus
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

data class ApiError(val message: String)

@RestControllerAdvice
class ApiExceptionHandler {

    @ExceptionHandler(BadCredentialsException::class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    fun badCredentials(e: BadCredentialsException) =
        ApiError(e.message ?: "Unauthorized")

    @ExceptionHandler(IllegalArgumentException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun badRequest(e: IllegalArgumentException) =
        ApiError(e.message ?: "Bad request")

    @ExceptionHandler(MethodArgumentNotValidException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun validation(e: MethodArgumentNotValidException): ApiError {
        val msg = e.bindingResult.fieldErrors.firstOrNull()?.defaultMessage ?: "Validation failed"
        return ApiError(msg)
    }
}