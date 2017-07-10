/**
 * Copyright 2013 Marin Solutions
 */
package com.gasmonitor.service.middleware;

import com.gasmonitor.entity.GasHazelcast;
import com.gasmonitor.pros.HazelCastPros;
import com.gasmonitor.service.middleware.api.WsClientPoolApi;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.ITopic;
import com.hazelcast.core.Message;
import com.hazelcast.core.MessageListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * @author Roger
 */
@Component
public class HazelCastClient implements CommandLineRunner {
    private final static Logger logger = LoggerFactory.getLogger(HazelCastClient.class);

    @Autowired
    private HazelCastPros hazelCastPros;

    @Autowired
    private WsClientPoolApi wsClientPool;

    @Autowired
    private HazelcastInstance hazelcastInstance;

    @Override
    public void run(String... strings) throws Exception {
        logger.info("启动hazelcast的客户端...并且开始接受消息...，hazelcast.name:{},topic.name:{}",
                hazelCastPros.getName(), hazelCastPros.getNametopic());
        ITopic<GasHazelcast> topic = hazelcastInstance.getTopic(hazelCastPros.getNametopic());
        topic.addMessageListener(new MessageListener<GasHazelcast>() {
            @Override
            public void onMessage(Message<GasHazelcast> message) {
                GasHazelcast hazelcastEvent = (GasHazelcast) message.getMessageObject();
                logger.info("接收到的数据信息:{}", hazelcastEvent);
                wsClientPool.sendMonitorData(hazelcastEvent);
            }
        });
    }
}