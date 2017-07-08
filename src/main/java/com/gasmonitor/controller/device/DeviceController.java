package com.gasmonitor.controller.device;

import com.gasmonitor.dao.DeviceRepository;
import com.gasmonitor.entity.Device;
import com.gasmonitor.vo.AjaxResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

/**
 * Created by saplmm on 2017/6/26.
 * 设备相关的控制器
 */

@Controller
@RequestMapping(value = "/device")
public class DeviceController {

    private final Logger logger = LoggerFactory.getLogger(DeviceController.class);

    @Autowired
    private DeviceRepository deviceRepository;

    //设备管理列表 界面
    @RequestMapping(value = "/list")
    public String deviceList() {
        return "/device/list";
    }

    //ajax 获取设备信息的列表
    @RequestMapping(value = "/ajax/list")
    @ResponseBody
    public AjaxResult<Device> ajaxList(@RequestParam(value = "siteId", defaultValue = "0") Long siteId,
                                       @RequestParam(value = "searchKey", defaultValue = "") String searchKey,
                                       Integer currPage) {
        List<Device> devices = deviceRepository.findBySiteId(siteId);
        logger.debug("通过站点{}查询到的所有设备的信息{}", siteId, devices);
        return new AjaxResult<Device>(devices);
    }

    //ajax 增加一个设备
    @RequestMapping(value = "/ajax/add", method = RequestMethod.POST)
    @ResponseBody
    public AjaxResult<Device> ajaxAddDevice(String name, Integer logic, Long siteId, String phone, Integer status, Long parent) {
        //新生成的设备
        Device device = new Device();
        device.setCreated(new Date());
        device.setTokenId("");
        device.setName(name);
        device.setLogic(logic);
        device.setSiteId(siteId);
        device.setPhone(phone);
        device.setStatus(status);
        device.setParent(phone);
        logger.info("创建新的设备:{}", device);
        Device ret = deviceRepository.save(device);
        return new AjaxResult<>(ret);
    }


    //ajax 删除一个设备
    @RequestMapping(value = "/ajax/rm")
    @ResponseBody
    public AjaxResult<Device> ajaxRmDevice(Long id) {
        deviceRepository.delete(id);
        return AjaxResult.SuccAjaxResult();
    }

    //ajax 修改一个设备
    @RequestMapping(value = "/ajax/update")
    @ResponseBody
    public AjaxResult<Device> ajaxUpdateDevice(Long id, String name, Integer logic, Long siteId, String phone, Integer status, Long parent) {
        //新生成的设备
        AjaxResult ret;
        Device device = deviceRepository.findOne(id);

        //如果在数据库中没有找到对应的设备，表示修改失败
        if (device == null) {
            ret = AjaxResult.ErrorAjaxResult();
            ret.setMsg("没有找到对应的设备，修改失败");
            return ret;
        }

        //找到对应的设备之后，修改并保存
        device.setCreated(new Date());
        device.setTokenId("");
        device.setName(name);
        device.setLogic(logic);
        device.setSiteId(siteId);
        device.setPhone(phone);
        device.setStatus(status);
        device.setParent(phone);
        logger.info("创建新的设备:{}", device);

        Device retDevie = deviceRepository.save(device);
        return new AjaxResult<>(retDevie);
    }

    @RequestMapping(value = "/devices-manage")
    public String devicesManage() {
        return "device/devices-manage";
    }


}
