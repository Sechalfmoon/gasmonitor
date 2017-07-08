package com.gasmonitor.dao;import com.gasmonitor.entity.Site;import org.springframework.data.domain.Page;import org.springframework.data.domain.Pageable;import org.springframework.data.jpa.repository.JpaRepository;/** * Created by saplmm on 2017/6/26. */public interface SiteRepository extends JpaRepository<Site, Long> {    Site findById(Long sitId);    Page<Site> findByNameContaining(String name, Pageable requestPage);}