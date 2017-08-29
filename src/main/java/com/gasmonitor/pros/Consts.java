package com.gasmonitor.pros;

/**
 * Created by saplmm on 2017/8/13.
 */
public class Consts {
    public static final String CACHE_TENANT = "c_tenant";  //租户的缓存
    public static final String CACHE_USER = "c_user";  //user缓存
    public static final String CACHE_USER_S = "c_user_single";  //user缓存单个
    public static final String CACHE_USER_ALL = "c_user_all";  //user缓存list

    public static final String CACHE_DEVICE = "c_device";  //设备缓存
    public static final String CACHE_DEVICE_ID = "c_device_id";  //设备缓存
    public static final String CACHE_DEVICE_HARDWAREID = "c_device_hardwareId";  //设备缓存，通过硬件id
    public static final String CACHE_DEVICE_LIST_SITE = "c_device_list_site";  //设备列表通过站点

    public static final String CACHE_BASDEVICEUNIT = "c_basdeviceunit";  //设备缓存
    
    //警告状态
    public static class WARNDEVICE_STATUS {
        public static final int INIT = 1;
        public static final int DOEN = 2;
        public static final int IGNORE = 3;

    }
}