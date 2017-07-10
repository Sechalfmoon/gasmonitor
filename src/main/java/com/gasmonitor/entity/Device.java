package com.gasmonitor.entity;import com.fasterxml.jackson.annotation.JsonIgnore;import com.fasterxml.jackson.annotation.JsonIgnoreProperties;import javax.persistence.Entity;import javax.persistence.GeneratedValue;import javax.persistence.Id;import javax.persistence.ManyToMany;import java.util.Date;import java.util.Set;/////**// * Created by saplmm on 2017/6/18.// */////@Entitypublic class Device {    @Id    @GeneratedValue    private Long id;  //设备Id    private String hardwareId;  //硬件Id    private String tokenId;    private String name;    //设备名称    private Integer logic;    private String watcher;    private String phone;    private Date created;    private Integer status;    private String parent;    private Long siteId;    @ManyToMany(mappedBy = "deviceSet")    @JsonIgnore    private Set<Site> siteSet;    public String getHardwareId() {        return hardwareId;    }    public void setHardwareId(String hardwareId) {        this.hardwareId = hardwareId;    }    public Long getId() {        return id;    }    public void setId(Long id) {        this.id = id;    }    public String getTokenId() {        return tokenId;    }    public void setTokenId(String tokenId) {        this.tokenId = tokenId;    }    public String getName() {        return name;    }    public void setName(String name) {        this.name = name;    }    public Integer getLogic() {        return logic;    }    public void setLogic(Integer logic) {        this.logic = logic;    }    public String getWatcher() {        return watcher;    }    public void setWatcher(String watcher) {        this.watcher = watcher;    }    public String getPhone() {        return phone;    }    public void setPhone(String phone) {        this.phone = phone;    }    public Date getCreated() {        return created;    }    public void setCreated(Date created) {        this.created = created;    }    public Integer getStatus() {        return status;    }    public void setStatus(Integer status) {        this.status = status;    }    public String getParent() {        return parent;    }    public void setParent(String parent) {        this.parent = parent;    }    public Long getSiteId() {        return siteId;    }    public void setSiteId(Long siteId) {        this.siteId = siteId;    }    public Set<Site> getSiteSet() {        return siteSet;    }    public void setSiteSet(Set<Site> siteSet) {        this.siteSet = siteSet;    }}