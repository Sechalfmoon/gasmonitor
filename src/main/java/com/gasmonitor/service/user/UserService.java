package com.gasmonitor.service.user;

import com.gasmonitor.dao.UserRepository;
import com.gasmonitor.entity.User;
import com.gasmonitor.pros.Consts;
import com.gasmonitor.pros.HazelCastPros;
import com.gasmonitor.pros.Status;
import com.gasmonitor.vo.AjaxResult;
import com.hazelcast.core.HazelcastInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Date;

/**
 * Created by saplmm on 2017/7/24.
 */

@Service
@CacheConfig(cacheNames = Consts.CACHE_USER)
public class UserService {

    private Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private HazelcastInstance hazelcastInstance;
    @Autowired
    private HazelCastPros hazelCastPros;

    @Transactional
    @CacheEvict(allEntries = true)  //清空所有的缓存
    public AjaxResult<User> updateUser(User newUser) {
        log.info("更新user的信息:{}", newUser);
        if (newUser.getId() == null) {
            return AjaxResult.ErrorAjaxResult("没有找到记录");
        }

        User old = userRepository.findOne(newUser.getId());
        if (old == null) {
            return AjaxResult.ErrorAjaxResult();
        } else {
            old.setRole(newUser.getRole());
            old.setMobile(newUser.getMobile());
            old.setAddress(newUser.getAddress());
            old.setUsername(newUser.getUsername());
            old.setPassword(newUser.getPassword());
            old = userRepository.save(old);
        }
        //更新缓存
//        loadUserMap(old);
        return new AjaxResult(old);
    }


    //新增一个操作员
    @CacheEvict(allEntries = true)  //清空所有的缓存
    public AjaxResult<User> newUser(User user) {
        //新增加一个操作员
        user.setCreatedate(new Date());
        if (StringUtils.isEmpty(user.getPassword())) {
            user.setPassword("123");
        }
        user.setStatus(Status.User.STATUS_DEFAULT);
        user = userRepository.save(user);
        return AjaxResult.NewAjaxResult(user);
    }

    //删除一个操作员
    @CacheEvict(allEntries = true)  //清空所有的缓存
    public AjaxResult<User> remove(Long id) {
        //todo 目前暂时直接从数据库删除，删除之前 需要删除其他的级联?
        userRepository.delete(id);
        return AjaxResult.SuccAjaxResult();
    }

//    public void loadUserMap(User u) {
//        IMap<Long, User> userIMap = hazelcastInstance.getMap(hazelCastPros.getMapuserall());
//        userIMap.set(u.getId(), u);
//    }
//
//
//    public void loadAllUserMap() {
//        IMap<Long, User> userIMap = hazelcastInstance.getMap(hazelCastPros.getMapuserall());
//        List<User> users = userRepository.findAll();
//        for (User u : users) {
//            userIMap.set(u.getId(), u);
//        }
//    }

    @Cacheable(key = "#p0", condition = "#p0!=null")
    public User findOne(Long id) {
        return userRepository.findOne(id);
    }
}
