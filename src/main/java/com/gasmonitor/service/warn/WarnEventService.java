package com.gasmonitor.service.warn;

import com.gasmonitor.dao.DeviceWarnEventRepository;
import com.gasmonitor.entity.DeviceWarnEvent;
import com.gasmonitor.entity.Site;
import com.gasmonitor.entity.User;
import com.gasmonitor.pros.Consts;
import com.gasmonitor.service.device.DeviceService;
import com.gasmonitor.service.site.SiteService;
import com.gasmonitor.utils.PageUtils;
import com.gasmonitor.utils.SessionUtils;
import com.gasmonitor.vo.MonitorData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpSession;
import java.util.Date;
import java.util.List;

/**
 * @author saplmm
 * @date 2017/8/28
 */

@Service
public class WarnEventService {
    Logger log = LoggerFactory.getLogger(WarnEventService.class);

    @Autowired
    private DeviceWarnEventRepository deviceWarnEventRepository;

    @Autowired
    private DeviceService deviceService;

    @Autowired
    private SiteService siteService;

    @Autowired
    private HttpSession session;

    public Page<DeviceWarnEvent> findByTenantId(Integer status, Integer currPage) {
        User user = SessionUtils.getUser(session);
        return deviceWarnEventRepository.findByTenantIdAndStatus(user.getTenantId(), status, PageUtils.p(currPage));
    }

    public DeviceWarnEvent findOne(Long id) {
        return deviceWarnEventRepository.findOne(id);
    }

    /**
     * 通过设备Id查询告警时间
     *
     * @return
     */
    public List<DeviceWarnEvent> findByDeviceId(Long deviceId, Integer status) {
        return deviceWarnEventRepository.findByDeviceIdAndStatus(deviceId, status);
    }


    /**
     * 更新告警时间的状态
     *
     * @param id
     * @param type
     * @param msg
     * @param all
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateWarn(Long id, Integer type, String msg, boolean all) {
        try {
            if (all) {
                //更新此设备所有的告警事件
                DeviceWarnEvent w = deviceWarnEventRepository.findOne(id);
                deviceWarnEventRepository.updateStatusAll(type, w.getDeviceId(), msg);
            } else {
                //更新耽搁告警事件
                deviceWarnEventRepository.updateStatus(type, id, msg);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    /**
     * 增加一个告警信息
     *
     * @param data
     * @param device
     */
    @Async
    public void addWarn(MonitorData data, com.gasmonitor.entity.Device device) {
        log.info("有报警信息:monitorData:{},设备的状态:{}", data.getMsg(), device.getStatus());
        //如果设备的状态已经处于非正常状态，那么就不需要存储报警的数据了
        if (device.getStatus() == Consts.Device.STATUS_GUZHANG) {
//            return;   //根据赖总的说法，都需要存储金数据库
        }

        //初始化设备的状态
        deviceService.updateDeviceStatus(device.getId(), Consts.Device.STATUS_GUZHANG); //处于告警的状态

        DeviceWarnEvent event = new DeviceWarnEvent();
        event.setCreateTime(new Date());
        event.setStatus(Consts.Event.STATUS_INIT);
        event.setDes(data.getMsg());
        event.setDeviceId(device.getId());
        Site site = siteService.findOne(device.getSiteId());
        if (site != null) {
            //如果站点不为空，那么通过站点找到tenantId
            event.setTenantId(site.getTenantId());
        }
        deviceWarnEventRepository.save(event);
    }

}
