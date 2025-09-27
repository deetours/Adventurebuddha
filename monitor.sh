#!/bin/bash

# Monitoring script for Adventure Buddha
# Run this periodically to check system health

LOG_FILE="/home/ubuntu/monitoring_$(date +%Y%m%d).log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$TIMESTAMP]${NC} $*" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$TIMESTAMP] ERROR:${NC} $*" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$TIMESTAMP] WARNING:${NC} $*" | tee -a "$LOG_FILE"
}

# Check disk usage
check_disk() {
    local usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$usage" -gt 90 ]; then
        error "Disk usage is ${usage}% - CRITICAL"
        return 1
    elif [ "$usage" -gt 80 ]; then
        warning "Disk usage is ${usage}% - HIGH"
        return 1
    else
        log "Disk usage: ${usage}% - OK"
        return 0
    fi
}

# Check memory usage
check_memory() {
    local usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$usage" -gt 90 ]; then
        error "Memory usage is ${usage}% - CRITICAL"
        return 1
    elif [ "$usage" -gt 80 ]; then
        warning "Memory usage is ${usage}% - HIGH"
        return 1
    else
        log "Memory usage: ${usage}% - OK"
        return 0
    fi
}

# Check Docker services
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        error "Docker is not running"
        return 1
    fi

    local services=$(docker-compose ps --services --filter "status=running" | wc -l)
    local total_services=$(docker-compose ps --services | wc -l)

    if [ "$services" -eq "$total_services" ]; then
        log "All Docker services running (${services}/${total_services})"
        return 0
    else
        error "Some Docker services not running (${services}/${total_services})"
        return 1
    fi
}

# Check application health
check_app_health() {
    # Backend health check
    if curl -f --max-time 10 http://localhost:8000/api/health/ >/dev/null 2>&1; then
        log "Backend health check - PASSED"
    else
        error "Backend health check - FAILED"
        return 1
    fi

    # Frontend health check
    if curl -f --max-time 10 http://localhost:3000 >/dev/null 2>&1; then
        log "Frontend health check - PASSED"
    else
        error "Frontend health check - FAILED"
        return 1
    fi

    return 0
}

# Check SSL certificate (if applicable)
check_ssl() {
    if command -v certbot &> /dev/null; then
        local expiry=$(certbot certificates 2>/dev/null | grep -A 2 "Certificate Name" | grep "Expiry Date" | head -1 | cut -d: -f2- | xargs)
        if [ -n "$expiry" ]; then
            local days_until_expiry=$(( ($(date -d "$expiry" +%s) - $(date +%s)) / 86400 ))
            if [ "$days_until_expiry" -lt 30 ]; then
                warning "SSL certificate expires in $days_until_expiry days"
                return 1
            else
                log "SSL certificate expires in $days_until_expiry days - OK"
                return 0
            fi
        fi
    fi
    return 0
}

# Main monitoring function
main() {
    log "Starting system monitoring..."

    local issues=0

    check_disk || ((issues++))
    check_memory || ((issues++))
    check_docker || ((issues++))
    check_app_health || ((issues++))
    check_ssl || ((issues++))

    if [ "$issues" -eq 0 ]; then
        log "All checks passed ✅"
        exit 0
    else
        error "$issues issue(s) found"
        exit 1
    fi
}

# Run main function
main