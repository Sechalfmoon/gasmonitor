package com.gasmonitor.config;

import com.gasmonitor.interceptor.ControllerInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

/**
 * Created by saplmm on 2017/6/10.
 */

@Configuration
public class WebMvcConfig extends WebMvcConfigurerAdapter {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        //这里可以配置简单的映射
        super.addViewControllers(registry);
        registry.addViewController("/login").setViewName("login");
        // registry.addViewController("/mlogin").setViewName("mlogin");
        registry.addViewController("/login2").setViewName("login2");
        registry.addViewController("/chat").setViewName("chat");
    }

    /**
     * @param registry
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new ControllerInterceptor()).addPathPatterns("/**");
        super.addInterceptors(registry);
    }
}
