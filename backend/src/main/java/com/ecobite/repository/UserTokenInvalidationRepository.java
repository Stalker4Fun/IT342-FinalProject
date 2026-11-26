package com.ecobite.repository;

import com.ecobite.entity.UserTokenInvalidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserTokenInvalidationRepository extends JpaRepository<UserTokenInvalidation, Long> {
}
