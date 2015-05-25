package bsu.famcs.chat.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public final class MessageStorage {
    private static final List<Message> INSTANSE = Collections.synchronizedList(new ArrayList<Message>());

    private MessageStorage() { }

    public static List<Message> getStorage() { return INSTANSE; }

    public static void addMessage(Message message) { INSTANSE.add(message); }

    public static void addAll(Message[] messages) { INSTANSE.addAll(Arrays.asList(messages)); }

    public static void removeAll() { INSTANSE.clear(); }

    public static void addAll(List<Message> messages) { INSTANSE.addAll(messages); }

    public static int getSize() { return INSTANSE.size(); }

    public static List<Message> getSubMessagesByIndex(int index) { return INSTANSE.subList(index, INSTANSE.size()); }

    public static Message getMessageById(String id) {
        for (Message message : INSTANSE) {
            if (message.getId().equals(id)) {
                return message;
            }
        }
        return null;
    }
}