package com.ereblink.backend.security

import com.ereblink.backend.users.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class DbUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {

    override fun loadUserByUsername(username: String): UserDetails {
        val u = userRepository.findByUsername(username)
            ?: throw UsernameNotFoundException("User not found")

        val authorities = listOf(SimpleGrantedAuthority("ROLE_${u.role.name}"))

        return org.springframework.security.core.userdetails.User
            .withUsername(u.username)
            .password(u.passwordHash)
            .authorities(authorities)
            .disabled(!u.enabled)
            .build()
    }
}