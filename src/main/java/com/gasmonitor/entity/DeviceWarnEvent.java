package com.gasmonitor.entity;import org.hibernate.annotations.Formula;import javax.persistence.Entity;import javax.persistence.GeneratedValue;import javax.persistence.Id;import java.util.Date;/** * Created by saplmm on 2017/8/28. * 设备报警事件 */@Entitypublic class DeviceWarnEvent {    @Id    @GeneratedValue    private Long id;    private Integer status; //状态    private Long deviceId;   //报警的设备id    private Long tenantId;//租户的id    private Long doUser;//处理的userId;    private Date createTime;//创建的时间    private Date doTime;//处理的时间    private Double warnValue;//警告值    private String des;//警告的描述  需要更具对应的值生成描述    private String msg;    @Formula("(select a.hardware_id from device as a where a.id = device_id)")    private String hid;    public String getHid() {        return hid;    }    public void setHid(String hid) {        this.hid = hid;    }    public Long getId() {        return id;    }    public void setId(Long id) {        this.id = id;    }    public Integer getStatus() {        return status;    }    public void setStatus(Integer status) {        this.status = status;    }    public Long getDeviceId() {        return deviceId;    }    public void setDeviceId(Long deviceId) {        this.deviceId = deviceId;    }    public Long getDoUser() {        return doUser;    }    public void setDoUser(Long doUser) {        this.doUser = doUser;    }    public Date getCreateTime() {        return createTime;    }    public void setCreateTime(Date createTime) {        this.createTime = createTime;    }    public Date getDoTime() {        return doTime;    }    public void setDoTime(Date doTime) {        this.doTime = doTime;    }    public Double getWarnValue() {        return warnValue;    }    public void setWarnValue(Double warnValue) {        this.warnValue = warnValue;    }    public String getDes() {        return des;    }    public void setDes(String des) {        this.des = des;    }    public Long getTenantId() {        return tenantId;    }    public void setTenantId(Long tenantId) {        this.tenantId = tenantId;    }    public String getMsg() {        return msg;    }    public void setMsg(String msg) {        this.msg = msg;    }}