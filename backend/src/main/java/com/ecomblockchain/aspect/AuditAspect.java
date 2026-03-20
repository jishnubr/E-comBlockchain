package com.ecomblockchain.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    // Logs all successful method executions ending in "Sign" within ContractService
    @AfterReturning(pointcut = "execution(* com.ecomblockchain.service.ContractService.*Sign(..))", returning = "result")
    public void logSuccessfulSignature(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();
        
        // args[0] is typically the User, args[1] is the requestDTO
        log.info("🔐 AUDIT TRAIL: Smart Contract Execution Success | Method: {} | Result: {}", methodName, result);
    }

    // Logs all failed Smart Contract exceptions
    @AfterThrowing(pointcut = "execution(* com.ecomblockchain.service.ContractService.*(..))", throwing = "ex")
    public void logFailedSignature(JoinPoint joinPoint, Throwable ex) {
        String methodName = joinPoint.getSignature().getName();
        log.warn("⚠️ AUDIT ALERT: Smart Contract Execution Failed | Method: {} | Reason: {}", methodName, ex.getMessage());
    }
}
