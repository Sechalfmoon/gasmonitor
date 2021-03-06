package com.gasmonitor.service.device;

import com.gasmonitor.dao.DeviceRepository;
import com.gasmonitor.dao.DeviceWarnEventRepository;
import com.gasmonitor.dao.SiteRepository;
import com.gasmonitor.entity.Device;
import com.gasmonitor.entity.DeviceWarnEvent;
import com.gasmonitor.entity.Site;
import com.gasmonitor.entity.Tenant;
import com.gasmonitor.exception.TipsException;
import com.gasmonitor.pros.Consts;
import com.gasmonitor.pros.HazelCastPros;
import com.gasmonitor.service.tenant.TenantService;
import com.gasmonitor.service.warn.WarnEventService;
import com.gasmonitor.vo.AjaxResult;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.IMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by saplmm on 2017/7/10.
 *
 * @author saplmm
 */

@Service
@CacheConfig(cacheNames = Consts.CACHE_DEVICE)
public class DeviceService {
    private Logger log = LoggerFactory.getLogger(DeviceService.class);

    @Autowired
    private WarnEventService warnEventService;
    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private SiteRepository siteRepository;

    @Autowired
    private TenantService tenantService;

    @Autowired
    private HazelcastInstance hazelcastInstance;

    @Autowired
    private HazelCastPros hazelCastPros;


    /**
     * 增加设备：
     * 1，判断已经有的设备的数量是否超过限制
     *
     * @param device
     * @param tenantId
     * @return
     */
    @Transactional(rollbackFor = Exception.class)
    public Device addDevice(Device device, Long tenantId, Long userId) {
        log.info("开始增加一个设备:{},tenantId:{}", device, tenantId);
        if (tenantId == null) {
            log.info("增加device 失败，因为tenantid ==null");
            return null;
        }

        //已经有用的设备数量
        Integer coun = deviceRepository.countByTenantId(tenantId);
        Tenant tenant = tenantService.findOne(tenantId);
        log.info("开始增加一个设备:count_old{},count_max:{}", coun, tenant.getDevice_upper());
        if (tenant.getDevice_upper() <= coun) {
            throw new TipsException("设备数量超过上限");
        }

        //1，把数据保存到数据库
        device.setId(null);
        device.setCreated(new Date());
        device.setTokenId("");
        device.setWatcher(userId);
        log.info("保存之前的设备:{}", device);
        device = deviceRepository.save(device);
        log.info("保存之后的设备:{}", device);
        //2,更新hazelcast的map
        IMap<String, String> map = hazelcastInstance.getMap(hazelCastPros.getMaptenant());
        map.set(device.getHardwareId(), tenantId + "");
        return device;
    }


    /**
     * 处理成可用状态的时候，需要判断是否有预警已经处理完了，如果没有处理完，那么提示先把警告处理完成才能继续操作更新状态
     */
    public Device updateDeviceStatus(Long id, Integer status) {

        //找到对应的设备
        Device d = deviceRepository.findOne(id);
        if (d == null) {
            throw new TipsException("没有找到对应的设备");
        }

        //设置成可用之前，需要查询是否有告警存在没有处理
        if (status == Consts.Device.STATUS_KEYONG) {
            List<DeviceWarnEvent> events = warnEventService.findByDeviceId(id, Consts.Event.STATUS_INIT);
            if (events != null && events.size() > 0) {
                throw new TipsException("还有警告信息没有处理完成，不能修改为可用的状态");
            }
        }

        d.setStatus(status);
        d = deviceRepository.save(d);
        return d;
    }

    public Device updateDevice(Device newDevice) {
        Device device = deviceRepository.findOne(newDevice.getId());
        //如果在数据库中没有找到对应的设备，表示修改失败
        if (device == null) {
            return null;
        }
        //找到对应的设备之后，修改并保存
        device.setTokenId(newDevice.getTokenId());
        device.setName(newDevice.getName());
        device.setLogic(newDevice.getLogic());
        device.setSiteId(newDevice.getSiteId());
        device.setStatus(newDevice.getStatus());
        device.setParent(newDevice.getParent());
        device.setHardwareId(newDevice.getHardwareId());
        device.setUtemperature(newDevice.getUtemperature());
        device.setUpressure(newDevice.getUpressure());
        device.setUstandard(newDevice.getUstandard());
        device.setUrunning(newDevice.getUrunning());
        device.setUsummary(newDevice.getUsummary());
        device.setUsurplus(newDevice.getUsurplus());
        device.setUanalog1(newDevice.getUanalog1());
        device.setUanalog2(newDevice.getUanalog2());
        device.setUanalog3(newDevice.getUanalog3());
        device.setUanalog4(newDevice.getUanalog4());
        device.setUswitch1(newDevice.getUswitch1());
        device.setUswitch2(newDevice.getUswitch2());
        device.setUswitch3(newDevice.getUswitch3());
        device.setUswitch4(newDevice.getUswitch4());
        device.setUac220(newDevice.getUac220());
        device.setUbattery(newDevice.getUbattery());
        device.setUsolar(newDevice.getUsolar());
        device.setDtype(newDevice.getDtype());

        log.info("更新设备:{}", device);
        deviceRepository.save(device);
        return device;
    }

    public AjaxResult<Device> updateDeviceGaoJing(Device newDevice) {
        Device old = deviceRepository.findOne(newDevice.getId());
        old.setTemperatureUpper(newDevice.getTemperatureUpper());
        old.setTemperatureLow(newDevice.getTemperatureLow());
        old.setPressureUpper(newDevice.getPressureUpper());
        old.setPressureLow(newDevice.getPressureLow());
        old = deviceRepository.save(old);
        loadDeviceMap(old);
        return new AjaxResult<>(old);
    }

    public List<Device> findDeviceBySiteId(long siteId) {
        //1,找到根节点
        List<Device> parent = deviceRepository.findBySiteIdAndParent(siteId, (long) 0);
        //找子节点
        for (Device d : parent) {
            d.setChildren(deviceRepository.findBySiteIdAndParent(siteId, d.getId()));
        }
        return parent;
    }

    /**
     * 找到所有的设备
     *
     * @param tenantId
     * @return
     */
    public List<Device> findDeviceByTenantId(long tenantId) {
        //1,找到所有的站点
        List<Device> deviceList = new ArrayList<>();
        List<Site> sites = siteRepository.findByTenantId(tenantId);
        for (Site s : sites) {
            s.setDevices(deviceRepository.findBySiteIdAndParent(s.getId(), (long) 0));
            for (Device d : s.getDevices()) {
                deviceList.addAll(deviceRepository.findBySiteIdAndParent(s.getId(), d.getId()));
            }
        }

        //返回所有的设备
        return deviceList;
    }

    //更新一个设备
    public void loadDeviceMap(Device d) {
        IMap<String, Device> mapDevice = hazelcastInstance.getMap(hazelCastPros.getMapdeviceall());        //得到map
        mapDevice.set(d.getHardwareId(), d);        //开始初始化
    }


    public void loadDeviceMap() {
        //得到map
        IMap<String, Device> mapDevice = hazelcastInstance.getMap(hazelCastPros.getMapdeviceall());
        //开始初始化
        List<Device> devices = deviceRepository.findAll();
        for (Device d : devices) {
            mapDevice.set(d.getHardwareId(), d);
        }
    }

    //设置设备的状态
    @Transactional(rollbackFor = Exception.class)
    public boolean setDeviceStatus(Long deviceId, Integer status) {
        int ret = deviceRepository.setStatus(deviceId, status);
        if (ret == 1) {
            //表示更新成功
            return true;
        } else {
            //表示更新失败
            return false;
        }
    }

    @Caching(evict = {
            @CacheEvict(key = "'" + Consts.CACHE_DEVICE_ID + "'+#device.id"),
    })
    public void delete(Long id) {
        deviceRepository.delete(id);
    }

    @Cacheable
    public Integer countByTenantId(Long id) {
        return deviceRepository.countByTenantId(id);
    }


}
