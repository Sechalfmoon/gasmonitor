package com.gasmonitor.dao;import com.gasmonitor.entity.Device;import org.springframework.data.jpa.repository.JpaRepository;import org.springframework.data.jpa.repository.Query;import java.util.List;/** * Created by saplmm on 2017/6/26. */public interface DeviceRepository extends JpaRepository<Device, Long> {    List<Device> findBySiteId(Long siteId);    //    通过租户ID找到他所有的设备    @Query("select a from Device as a where a.siteId in (select id from Site where tenantId = ?1)")    List<Device> findByTenantId(Long tenantId);}