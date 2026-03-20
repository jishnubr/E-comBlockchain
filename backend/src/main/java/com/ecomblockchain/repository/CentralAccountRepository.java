package com.ecomblockchain.repository;

import com.ecomblockchain.model.CentralAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CentralAccountRepository extends JpaRepository<CentralAccount, Long> {
}
