package bsu.famcs.chat.model;

public class Message{
    private String name;
    private String text;
    private String date;
    private String id;
    private String method;

    public Message(String name, String text, String date, String id, String method){
        this.name = name;
        this.text = text;
        this.date = date;
        this.id = id;
        this.method = method;
    }

    public String getMethod(){ return this.method; }

    public String getId(){
        return this.id;
    }

    public String getName(){
        return this.name;
    }

    public String getText(){ return this.text; }

    public String getDate() { return this.date; }

    public void setId(String id){
        this.id = id;
    }

    public void setName(String name){
        this.name = name;
    }

    public void setText(String text){ this.text = text; }

    public void setDate(String date){
        this.date = date;
    }

    public void setMethod(String method){
        this.method = method;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"id\":\"").append(id).append("\", \"name\":\"").append(name)
                .append("\", \"text\":\"").append(text).append("\", \"date\":\"").append(date)
                .append("\", \"method\":\"").append(method).append("\"}");
        return sb.toString();
    }
}