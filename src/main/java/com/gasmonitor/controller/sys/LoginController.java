package com.gasmonitor.controller.sys;import org.springframework.stereotype.Controller;import org.springframework.web.bind.annotation.RequestMapping;@Controllerpublic class LoginController {    @RequestMapping(value = {"/", "/index"})    public String index() {        //如果是登录状态，返回到index,如果不是登录状态返回到login        return "index";    }}