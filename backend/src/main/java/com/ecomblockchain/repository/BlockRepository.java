package com.ecomblockchain.repository;

import com.ecomblockchain.model.Block;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlockRepository extends JpaRepository<Block, Long> {
    Block findTopByOrderByIdDesc(); // Useful for getting the previous hash
}
