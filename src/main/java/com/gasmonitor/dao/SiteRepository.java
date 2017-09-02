package com.gasmonitor.dao;import com.gasmonitor.entity.Site;import org.springframework.data.domain.Page;import org.springframework.data.domain.Pageable;import org.springframework.data.jpa.repository.JpaRepository;import java.util.List;/** * Created by saplmm on 2017/6/26. */public interface SiteRepository extends JpaRepository<Site, Long> {    Site findById(Long sitId);    List<Site> findByTenantId(Long id);    Page<Site> findByNameContaining(String name, Pageable requestPage);        Page<Site> findByTenantIdAndNameContaining(Long id, String name, Pageable requestPage);    Integer countByTenantId(Long id);}