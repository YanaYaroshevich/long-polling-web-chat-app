package bsu.famcs.chat.util;
import bsu.famcs.chat.model.Message;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.lang.Object;
import java.text.DateFormat;
import java.util.Date;
import java.util.TimeZone;

public final class MessageUtil {
    public static final String MESSAGES = "messages";
    private static final String TN = "TN";
    private static final String EN = "EN";
    public static final String TEXT = "text";
    private static final String NAME = "name";
    public static final String METHOD = "method";
    public static final String ID = "id";
    private static final String DATE = "date";

    private MessageUtil() {}

    private static String getDate() {
        DateFormat formatter;
        formatter = DateFormat.getDateTimeInstance();
        formatter.setTimeZone(TimeZone.getTimeZone("Europe/Minsk"));
        return formatter.format(new Date());
    }

    public static JSONObject stringToJson(String data) throws ParseException {
        JSONParser parser = new JSONParser();
        return (JSONObject) parser.parse(data.trim());
    }

    public static Message jsonToMessage(JSONObject json) {
        Object id = json.get(ID);
        Object text = json.get(TEXT);
        Object name = json.get(NAME);
        Object method = json.get(METHOD);
        Object date = (method.toString().compareTo("DELETE") == 0 || method.toString().compareTo("PUT") == 0) ? getDate() : json.get(DATE);


        if (text != null && name != null) {
            return new Message((String) name, (String) text, (String) date, (String) id, (String) method);
        }
        return null;
    }
}
