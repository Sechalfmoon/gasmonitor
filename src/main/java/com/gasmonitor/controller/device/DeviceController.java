package com.gasmonitor.controller.device;

import com.gasmonitor.dao.DeviceRepository;
import com.gasmonitor.dao.SiteRepository;
import com.gasmonitor.entity.BasDeviceUnit;
import com.gasmonitor.entity.Device;
import com.gasmonitor.entity.Site;
import com.gasmonitor.entity.User;
import com.gasmonitor.exception.TipsException;
import com.gasmonitor.service.bas.BasDataUnitService;
import com.gasmonitor.service.device.DeviceService;
import com.gasmonitor.utils.PageUtils;
import com.gasmonitor.utils.SessionUtils;
import com.gasmonitor.vo.AjaxResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by saplmm on 2017/6/26.
 * 设备相关的控制器
 */

@Controller
@RequestMapping(value = "/device")
public class DeviceController {

    private final Logger log = LoggerFactory.getLogger(DeviceController.class);

    @Autowired
    private DeviceRepository deviceRepository;
    @Autowired
    private DeviceService deviceService;

    @Autowired
    private BasDataUnitService basDataUnitService;
    @Autowired
    private SiteRepository siteRepository;

    //设备管理列表 界面
    @RequestMapping(value = "/list")
    public String deviceList(ModelMap modelMap, HttpSession session) {
        User user = SessionUtils.getUser(session);
        List<Site> sites = siteRepository.findByTenantId(user.getTenantId());
        if (sites.size() == 0) {
            throw new TipsException("请先添加站点信息");
        }

        List<BasDeviceUnit> units = basDataUnitService.selectOptions();
        log.info("寻找到所有的站点信息:{}", sites);
        modelMap.addAttribute("sites", sites);
        modelMap.addAttribute("units", units);

        return "device/list";
    }

    //ajax 获取设备信息的列表
    @RequestMapping(value = "/ajax/list")
    @ResponseBody
    public AjaxResult<Device> ajaxList(@RequestParam(value = "siteId", defaultValue = "0") Long siteId,
                                       @RequestParam(value = "searchKey", defaultValue = "", required = false) String searchKey,
                                       @RequestParam(value = "currPage", defaultValue = "1", required = false) Integer currPage) {
        Page<Device> devices = deviceRepository.findBySiteId(siteId, "%" + searchKey + "%", "%" + searchKey + "%", PageUtils.p(currPage));
        log.info("通过站点{},currpage:{}查询到的所有设备的信息{}", siteId, currPage, devices);
        return AjaxResult.NewAjaxResult(devices);
    }

    @RequestMapping(value = "/ajax/listtree")
    @ResponseBody
    public AjaxResult<Device> ajaxList(@RequestParam(value = "siteId", defaultValue = "0") Long siteId) {
        List<Device> devices = deviceService.findDeviceBySiteId(siteId);
        log.info("通过站点{}查询到的所有设备的信息{}", siteId, devices);
        return AjaxResult.NewAjaxResult(devices);
    }


    //ajax 获取设备信息的列表
    @RequestMapping(value = "/ajax/listp")
    @ResponseBody
    public AjaxResult<Device> ajaxListp(Long siteId) {
        List<Device> devices = deviceRepository.findBySiteIdAndParent(siteId, new Long(0));
        return AjaxResult.NewAjaxResult(devices);
    }


    //ajax 增加一个设备
    @RequestMapping(value = "/ajax/new", method = RequestMethod.POST)
    @ResponseBody
    public AjaxResult<Device> ajaxAddDevice(Device device, HttpSession session) {
        //新生成的设备
        User user = SessionUtils.getUser(session);
        log.info("usr:{},tenantid:{}开始增加一个设备:{}", user, user.getTenantId(), device);
        try {
            device = deviceService.addDevice(device, user.getTenantId(), user.getId());
        } catch (TipsException e) {
            return AjaxResult.ErrorAjaxResult(e.getMessage());
        }
        return new AjaxResult<>(device);
    }


    //ajax 删除一个设备
    @RequestMapping(value = "/ajax/remove")
    @ResponseBody
    public AjaxResult<Device> ajaxRmDevice(Long id) {

        deviceService.delete(id);
        return AjaxResult.SuccAjaxResult();
    }

    //ajax 修改一个设备
    @RequestMapping(value = "/ajax/update")
    @ResponseBody
    public AjaxResult<Device> ajaxUpdateDevice(Device newDevice) {
        //新生成的设备
        return AjaxResult.NewAjaxResult(deviceService.updateDevice(newDevice));
    }

    @RequestMapping(value = "/ajax/updateStatus")
    @ResponseBody
    public AjaxResult<Device> ajaxUpdateDevice(Long id, Integer status) {
        //新生成的设备
        try {
            Device ret = deviceService.updateDeviceStatus(id, status);
            return AjaxResult.NewAjaxResult(ret);
        } catch (TipsException e) {
            return AjaxResult.ErrorAjaxResult(e.getMessage());
        }
    }


    @RequestMapping(value = "ajax/setstatus")
    public AjaxResult<Device> setstatus(Long deviceId, Integer status) {
        boolean ret = deviceService.setDeviceStatus(deviceId, status);
        if (ret) {
            return AjaxResult.SuccAjaxResult();
        }
        return AjaxResult.ErrorAjaxResult();
    }

    @RequestMapping(value = "/ajax/gaojing/update")
    @ResponseBody
    public AjaxResult<Device> ajaxGaoJIngUpdateDevice(Device newDevice) {
        //新生成的设备
        return deviceService.updateDeviceGaoJing(newDevice);
    }

    @RequestMapping(value = "/devices-manage")
    public String devicesManage() {
        return "device/devices-manage";
    }


}
