package bsu.famcs.chat.controller;

import java.io.IOException;
import java.io.PrintWriter;

import bsu.famcs.chat.model.Message;
import bsu.famcs.chat.model.IdStorage;

import java.util.Collections;
import java.util.List;
import java.util.ArrayList;

import javax.servlet.AsyncContext;
import javax.servlet.AsyncEvent;
import javax.servlet.AsyncListener;

import bsu.famcs.chat.model.MessageStorage;
import bsu.famcs.chat.storage.XMLHistoryUtil;
import bsu.famcs.chat.util.ServletUtil;

import static bsu.famcs.chat.util.MessageUtil.*;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;

import org.apache.log4j.Logger;
import org.json.simple.JSONObject;
import org.xml.sax.SAXException;

import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import java.text.DateFormat;
import java.util.Date;
import java.util.TimeZone;

@WebServlet(urlPatterns = "/chat", asyncSupported = true)
public class MessageServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private static Logger logger = Logger.getLogger(MessageServlet.class.getName());
    private final Lock _mutex = new ReentrantLock(true);
    private static List<AsyncContext> contexts = Collections.synchronizedList(new ArrayList<AsyncContext>());
    private int lastInd = 0;

    @Override
    public void init() throws ServletException {
        try {
            loadHistory();
            lastInd = IdStorage.getSize();
        } catch (Exception e) {
            logger.error(e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        logger.info("doGet");
        try {
            Boolean isFirstReq = Boolean.parseBoolean(request.getParameter("isFirstReq"));
            if (isFirstReq) {
                String messages = formResponse(0);
                logger.info("response messages: " + messages);
                response.setContentType(ServletUtil.APPLICATION_JSON);
                logger.info("response status: " + 200);
                response.setCharacterEncoding("UTF-8");
                response.setStatus(HttpServletResponse.SC_OK);
                PrintWriter out = response.getWriter();
                out.print(messages);
                out.flush();
            } else {
                AsyncContext actx = request.startAsync(request, response);
                actx.setTimeout(30000);
                contexts.add(actx);
                actx.addListener(new AsyncListener() {
                    @Override
                    public void onTimeout(AsyncEvent arg0) throws IOException {
                        String messages = formResponse(lastInd);
                        logger.info("Listener onTimeout");
                        HttpServletResponse response = (HttpServletResponse) arg0.getAsyncContext().getResponse();
                        response.setContentType("application/json");
                        response.setCharacterEncoding("UTF-8");
                        response.setStatus(HttpServletResponse.SC_OK);
                        PrintWriter out = response.getWriter();
                        out.print(messages);
                        out.flush();
                        arg0.getAsyncContext().complete();
                        contexts.remove(arg0.getAsyncContext());
                    }
                    @Override
                    public void onStartAsync(AsyncEvent arg0) throws IOException {
                    }
                    @Override
                    public void onError(AsyncEvent arg0) throws IOException {
                    }
                    @Override
                    public void onComplete(AsyncEvent arg0) throws IOException {
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void doResponse(List<AsyncContext> contexts) {
        for (AsyncContext ctx : contexts) {
            HttpServletResponse response = (HttpServletResponse) ctx.getResponse();
            try {
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                String messages = formResponse(lastInd);
                logger.info("response messages: " + messages);
                response.setStatus(HttpServletResponse.SC_OK);
                PrintWriter out = response.getWriter();
                out.print(messages);
                out.flush();
                ctx.complete();
            } catch (Exception e) {
                logger.error(e);
            }
        }
        lastInd = IdStorage.getSize();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        logger.info("doPost");
        String data = ServletUtil.getMessageBody(request);
        logger.info("data: " + data);
        try {
            JSONObject json = stringToJson(data);
            json.put(METHOD, "POST");
            Message message = jsonToMessage(json);

            IdStorage.addId(message.getId());
            MessageStorage.addMessage(message);

            _mutex.lock();
            XMLHistoryUtil.addId(message.getId());
            XMLHistoryUtil.addMessage(message);
            _mutex.unlock();

            logger.info("response status: " + 200);
            response.setStatus(HttpServletResponse.SC_OK);

            List<AsyncContext> contexts = new ArrayList<>(this.contexts);
            this.contexts.clear();
            doResponse(contexts);

        } catch (org.json.simple.parser.ParseException | ParserConfigurationException | SAXException | TransformerException e) {
            logger.error("bad request");
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        logger.info("doDelete");
        String data = ServletUtil.getMessageBody(request);
        logger.info("data: " + data);
        try {
            JSONObject json = stringToJson(data);
            String id = json.get(ID).toString();
            Message messageToUpdate = MessageStorage.getMessageById(id);
            if (messageToUpdate != null) {
                messageToUpdate.setDate(getDate());
                messageToUpdate.setMethod("DELETE");
                messageToUpdate.setText("");

                _mutex.lock();
                XMLHistoryUtil.updateData(messageToUpdate);
                XMLHistoryUtil.addId(id);
                _mutex.unlock();
                IdStorage.addId(id);
                logger.info("response status: " + 200);
                response.setStatus(HttpServletResponse.SC_OK);

                List<AsyncContext> contexts = new ArrayList<>(this.contexts);
                this.contexts.clear();
                doResponse(contexts);
            } else {
                logger.error("bad request");
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Task does not exist");
            }
        } catch (Exception e) {
            logger.error("bad request");
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        logger.info("doPut");
        String data = ServletUtil.getMessageBody(request);
        logger.info("data: " + data);
        try {
            JSONObject json = stringToJson(data);
            String id = json.get(ID).toString();
            Message messageToUpdate = MessageStorage.getMessageById(id);
            if (messageToUpdate != null) {
                messageToUpdate.setDate(getDate());
                messageToUpdate.setMethod("PUT");
                messageToUpdate.setText(json.get(TEXT).toString());

                _mutex.lock();
                XMLHistoryUtil.updateData(messageToUpdate);
                XMLHistoryUtil.addId(id);
                _mutex.unlock();
                IdStorage.addId(id);
                logger.info("response status: " + 200);

                response.setStatus(HttpServletResponse.SC_OK);

                List<AsyncContext> contexts = new ArrayList<>(this.contexts);
                this.contexts.clear();
                doResponse(contexts);
            } else {
                logger.error("bad request");
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Task does not exist");
            }
        } catch (Exception e) {
            logger.error("bad request");
            response.sendError(HttpServletResponse.SC_BAD_REQUEST);
        }
    }


    private static String getDate() {
        DateFormat formatter;
        formatter = DateFormat.getDateTimeInstance();
        formatter.setTimeZone(TimeZone.getTimeZone("Europe/Minsk"));
        return formatter.format(new Date());
    }

    private List<Message> difference(List<String> ids){
        List<Message> difference = Collections.synchronizedList(new ArrayList<Message>());
        for (int i = 0; i < ids.size(); i++){
            Message curMsg = MessageStorage.getMessageById(ids.get(i));
            if(!difference.contains(curMsg))
                difference.add(curMsg);
        }
        return difference;
    }

    @SuppressWarnings("unchecked")
    private String formResponse(int index) {
        JSONObject jsonObject = new JSONObject();
        List<String> ids = IdStorage.getSubIdsByIndex(index);
        jsonObject.put(MESSAGES, difference(ids));
        return jsonObject.toJSONString();
    }

    private void loadHistory() throws SAXException, IOException, ParserConfigurationException, TransformerException  {
        if (XMLHistoryUtil.doesStorageExist()) {
            List<Message> messageList = XMLHistoryUtil.getMessages();
            MessageStorage.addAll(messageList);
            for (Message msg : messageList){
                System.out.println(msg.getDate() + " " + msg.getName() + ": " + msg.getText());
            }
        } else {
            XMLHistoryUtil.createStorage();
        }
        if (XMLHistoryUtil.doesIdStorageExist()){
            List<String> idList = XMLHistoryUtil.getIds();
            IdStorage.addAll(idList);
        } else {
            XMLHistoryUtil.createIdStorage();
        }
    }
}