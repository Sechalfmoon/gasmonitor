package com.gasmonitor.controller.tenant;import com.gasmonitor.dao.TenantRepository;import com.gasmonitor.entity.Tenant;import com.gasmonitor.vo.AjaxResult;import org.slf4j.Logger;import org.slf4j.LoggerFactory;import org.springframework.beans.factory.annotation.Autowired;import org.springframework.stereotype.Controller;import org.springframework.web.bind.annotation.RequestMapping;import org.springframework.web.bind.annotation.ResponseBody;/** * Created by saplmm on 2017/6/12. */@Controller@RequestMapping(value = "/tenant")public class TenantController {    private Logger logger = LoggerFactory.getLogger(TenantController.class);    @Autowired    private TenantRepository tenantRepository;    @RequestMapping(value = "/info")    public String info() {        return "/tenant/info";    }    @RequestMapping(value = "/list")    public String list() {        return "/tenant/list";    }    @ResponseBody    @RequestMapping(value = "/ajax/list")    public AjaxResult<Tenant> ajaxList() {        AjaxResult<Tenant> result = AjaxResult.NewAjaxResult(tenantRepository.findAll(), 100, 100);        logger.info("找到的所有租户{}", result);        return result;    }}