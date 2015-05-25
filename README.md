# WebChatApplication

#Task11

We work with two histories: 1) History of messages, 2) History of id-s of requests (methods)
The second history will help us to work with AJAX-polling.
We will form response using last id-s: look for messages with such id-s in history of messages and add them to response.
Both of these histories are added to XML-files. It will help us to restart last session.

Messages are not deleted from history.xml. They stay there in format: 
{
    "id" : "id",
    "date" : "date",
    "name" : "name",
    "text" : "",
    "method" : "DELETE"
}
On user side with "trash"-icon.

Method PUT is not allowed.

Switch on the sound! ;)