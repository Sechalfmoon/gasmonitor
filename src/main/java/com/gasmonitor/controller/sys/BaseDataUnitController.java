package com.gasmonitor.controller.sys;import com.gasmonitor.dao.BasDeviceUnitRespository;import com.gasmonitor.entity.BasDeviceUnit;import com.gasmonitor.service.bas.BasDataUnitService;import com.gasmonitor.vo.AjaxResult;import org.springframework.beans.factory.annotation.Autowired;import org.springframework.stereotype.Controller;import org.springframework.web.bind.annotation.PathVariable;import org.springframework.web.bind.annotation.RequestMapping;import org.springframework.web.bind.annotation.ResponseBody;import java.util.Date;import java.util.List;/** * Created by saplmm on 2017/7/25. * 基础数据 */@Controller@RequestMapping(value = "bas")public class BaseDataUnitController {    @Autowired    private BasDeviceUnitRespository basDeviceUnitRespository;    @Autowired    private BasDataUnitService basDataUnitService;    @RequestMapping(value = "/unit/list")    public String unitList() {        return "bas/unit/list";    }    @ResponseBody    @RequestMapping(value = "/unit/ajax/list")    public AjaxResult<BasDeviceUnit> unitAjaxList() {        List<BasDeviceUnit> basDeviceUnits = basDeviceUnitRespository.findAll();        return AjaxResult.AjaxResultWithList(basDeviceUnits);    }    @ResponseBody    @RequestMapping(value = "/unit/ajax/get")    public AjaxResult<BasDeviceUnit> unitAjaxGet(Long id) {        BasDeviceUnit basDeviceUnits = basDataUnitService.findOne(id);        return AjaxResult.AjaxResultWithOne(basDeviceUnits);    }    @ResponseBody    @RequestMapping(value = "/unit/ajax/new")    public AjaxResult<BasDeviceUnit> unitNew(BasDeviceUnit basDeviceUnit) {        basDeviceUnitRespository.save(basDeviceUnit);        return AjaxResult.SuccAjaxResult();    }    @ResponseBody    @RequestMapping(value = "/unit/ajax/update")    public AjaxResult<BasDeviceUnit> unitUpdate(BasDeviceUnit basDeviceUnit) {        basDeviceUnit.setUpdatedate(new Date());        basDeviceUnitRespository.save(basDeviceUnit);        return AjaxResult.SuccAjaxResult();    }    @ResponseBody    @RequestMapping(value = "/unit/ajax/delete/{id}")    public AjaxResult<BasDeviceUnit> unitDelete(@PathVariable("id") Long id) {        basDeviceUnitRespository.delete(id);        return AjaxResult.SuccAjaxResult();    }    @ResponseBody    @RequestMapping(value = "/unit/ajax/selectoption")    public AjaxResult<BasDeviceUnit> unitSelectOption() {        List<BasDeviceUnit> list = basDataUnitService.selectOptions();        return AjaxResult.AjaxResultWithList(list);    }}