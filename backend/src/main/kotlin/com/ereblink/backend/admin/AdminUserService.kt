package com.ereblink.backend.admin

import com.ereblink.backend.admin.dto.AdminUserDto
import com.ereblink.backend.users.Role
import com.ereblink.backend.users.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AdminUserService(
    private val userRepository: UserRepository
) {

    @Transactional(readOnly = true)
    fun listUsers(): List<AdminUserDto> =
        userRepository.findAll()
            .sortedBy { it.username.lowercase() }
            .map {
                AdminUserDto(
                    id = it.id!!,
                    username = it.username,
                    role = it.role,
                    enabled = it.enabled
                )
            }

    @Transactional
    fun setRole(userId: Long, role: Role, currentUsername: String) {
        val u = userRepository.findById(userId).orElseThrow { IllegalArgumentException("Uživatel nenalezen") }
        if (u.username == currentUsername && role != Role.ADMIN) {
            throw IllegalArgumentException("Nemůžeš si odebrat ADMIN roli sám sobě")
        }
        u.role = role
        userRepository.save(u)
    }

    @Transactional
    fun setEnabled(userId: Long, enabled: Boolean, currentUsername: String) {
        val u = userRepository.findById(userId).orElseThrow { IllegalArgumentException("Uživatel nenalezen") }
        if (u.username == currentUsername && !enabled) {
            throw IllegalArgumentException("Nemůžeš si sám sebe zakázat")
        }
        u.enabled = enabled
        userRepository.save(u)
    }

    @Transactional
    fun deleteUser(userId: Long, currentUsername: String) {
        val u = userRepository.findById(userId).orElseThrow { IllegalArgumentException("Uživatel nenalezen") }
        if (u.username == currentUsername) {
            throw IllegalArgumentException("Nemůžeš smazat sám sebe")
        }
        userRepository.delete(u)
    }
}