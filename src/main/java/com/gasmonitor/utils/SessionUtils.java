package com.gasmonitor.utils;import com.gasmonitor.entity.Tenant;import com.gasmonitor.entity.User;import javax.servlet.http.HttpSession;import static com.gasmonitor.pros.SessionCons.SESS_USER_KEY;/** * Created by saplmm on 2017/7/15. */public class SessionUtils {    public static Tenant getTanat(HttpSession session) {        Object ret = session.getAttribute("tenant");        if (ret != null) {            return (Tenant) ret;        }        return null;    }    public static User getUser(HttpSession session) {        Object ret = session.getAttribute(SESS_USER_KEY);        if (ret != null) {            return (User) ret;        }        return null;    }}