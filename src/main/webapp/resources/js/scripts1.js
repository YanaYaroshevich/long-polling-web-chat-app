'use strict'

var id = -1;
var editFlag = false;
var newMessagesFlag = false;

var uniqueId = function() {
	var date = Date.now();
	var random = Math.random() * Math.random();
	return Math.floor(date * random).toString();
};

var appState = {
				mainUrl : 'chat',
				messages:[],
				name : '',
				cond: true,
				isFirstReq: true
};

function run() {
	document.addEventListener('click', delegateEvent);
	poll();
}

function poll() {
	$.ajax({
		url: appState.mainUrl + "?isFirstReq=" + appState.isFirstReq,
		type: 'GET',
		dataType: 'json',
		success: function (responseText) {
			console.log("success");
			getHistory(responseText);

		},
		error: function (xhr, status, errorMessage) {
			console.log(errorMessage);
			appState.cond = false;
		},
		complete: function () {
			appState.isFirstReq = false;
			setTimeout(poll(), 1000);
			console.log("complete");
		}
	});
}

function getHistory(responseText, continueWith){
	try {
		if (!(responseText == "")) {
			console.assert(responseText != null);

			var response = responseText;

			for (var i = 0; i < response.messages.length; i++) {
				var j = getIndById(response.messages[i].id);
				if (j != -1)
					appState.messages[j] = response.messages[i];
				else
					appState.messages.push(response.messages[i]);
			}

			if (typeof(Storage) == "undefined") {
				alert('localStorage is not accessible');
				return;
			}
			var item = JSON.parse(localStorage.getItem("Chatting page"));
			appState.name = item.name;

			if (response.messages.length > 0)
				newMessagesFlag = true;
		}
		createPage();
	}
	catch(e){

	}
	continueWith && continueWith();
}

function createPage(){
	serverCheck(appState.cond);
	if(appState.name.length > 0){
		updateName();		
	}

	var items = document.getElementsByClassName('history')[0];

	while(items.childNodes[0]){
		items.removeChild(items.childNodes[0]);
	}	
	for(var i = 0; i < appState.messages.length; i++){
		var msg = appState.messages[i];
		var userMessage = createMsg(msg);
		items.appendChild(userMessage);
	}

	if(newMessagesFlag) {
		items.scrollTop = 9999;
		newMessagesFlag = false;
	}
}

function delegateEvent(evtObj) {
	if(evtObj.type === 'click'){
		if (evtObj.target.classList.contains('btn-success') 
			|| evtObj.target.classList.contains('btn-info'))
			onInputNameButtonClick(evtObj);
		else if (evtObj.target.classList.contains('btn-primary')){
			onSendMsgButtonClick();
		}
		else if (evtObj.target.classList.contains('btn-default') 
			|| evtObj.target.classList.contains('glyphicon')){
			onEditMsgButtonClick(evtObj);
		}
	}
}

function onInputNameButtonClick(evtObj){
	var nameField;
	nameField = (evtObj.target.classList.contains('btn-success')) ? 
				document.getElementById('nameInputText') : document.getElementById('nameChangeText');
	setName(nameField.value);

	createPage();
	store();
}

function onSendMsgButtonClick(){
	var textField = document.getElementById('inputMsgText');
	(editFlag) ? sendEditedMsg(textField.value) : sendMsg(textField.value);
	editFlag = false;
	textField.value = '';
}

function onEditMsgButtonClick(evtObj){
	var msg = (evtObj.target.hasChildNodes()) ? evtObj.target.parentElement : evtObj.target.parentElement.parentElement;
	id = msg.getAttribute('id');
	var indicator = (evtObj.target.hasChildNodes()) ? evtObj.target.firstElementChild.className : evtObj.target.className;
	(indicator == "glyphicon glyphicon-pencil") ? editMsg(id) : removeMsg(id);
}

function editMsg(id){
	var textToChange = "";
	for (var i = 0; i < appState.messages.length; i++){
		var msg = appState.messages[i];
		if(msg.id == id && msg.name == appState.name && msg.method != "DELETE"){
			textToChange = msg.text;
			editFlag = true;
			break;
		}
		else if (msg.id == id){
			alert("you can't change this!");
			break;
		}
	}

	var field = document.getElementById("inputMsgText");
	field.value = textToChange;	
}

function sendEditedMsg(value){
	var obj = {
		id: id,
		text: value
	};

	put(appState.mainUrl, JSON.stringify(obj), function(responseText){
		console.log("PUT successful");
    });
}

function sendMsg(value){
	if(!value){
		return;
	}
	var objMsg = {
		text: value,
		name: appState.name,
		date: getDate(),
		id: uniqueId()
	};
	post(appState.mainUrl, JSON.stringify(objMsg), function(){
		console.log("POST successful");
	});
}

function removeMsg(id){
	del(appState.mainUrl, JSON.stringify({id: id}), function(){
		console.log("DELETE successful");
    });
}

function getDate(){
	return (new Date()).toLocaleDateString() + " " + (new Date()).toLocaleTimeString();
}

function defaultErrorHandler(message) {
	appState.cond = false;
	console.error(message);
}

function isError(text) {
	if(text == "")
		return false;
	try {
		var obj = JSON.parse(text);
	} catch(ex) {
		appState.cond = false;
		return true;
	}
	return !!obj.error;
}

function setName(value){
	if(!value){
		return;
	}
	appState.name = value;
}

function getIndById(id){
	for (var i = 0; i < appState.messages.length; i++){
		if(appState.messages[i].id == id)
			return i;
	}
	return -1;
}

function store() {
	if(typeof(Storage) == "undefined") {
		alert('localStorage is not accessible');
		return;
	}
	localStorage.clear();
	localStorage.setItem("Chatting page", JSON.stringify(appState));
}

function updateName(){
	var items = document.getElementsByClassName('inputName')[0];
	var greeting = greetingCreation(appState.name);
	items.appendChild(greeting);
	document.getElementById("sendBtn").style.visibility = "visible";
	document.getElementById("coolMan").style.visibility = "visible";
	document.getElementById("inputMsgText").style.visibility = "visible";
	document.getElementById("form1").style.visibility = "hidden";
	document.getElementById("form2").style.visibility = "visible";
}

function greetingCreation(value){
	var greeting = (document.getElementsByTagName('h3')[0]) || document.createElement('h3');
	greeting.innerHTML = 'Hello, ' + appState.name + '!';
	return greeting; 
}

function setAttr(obj, attrType, attrValue){
	var attr = document.createAttribute(attrType);
	attr.value = attrValue;
	obj.setAttributeNode(attr);
}

function childCreation(value, elType){
	var child = document.createElement(elType);
	setAttr(child, 'class', value);
	return child;
}

function iconCreation(btnClass, color){
	var sp = document.createElement('span');
	setAttr(sp, 'class', btnClass);
	setAttr(sp, 'style', 'color:' + color + ';');
	return sp;
}

function btnCreation(btnClass){
	var btn = document.createElement('button');
	setAttr(btn, 'type', 'button');
	setAttr(btn, 'class', 'btn btn-default btn-sm');
	var sp = iconCreation(btnClass, '#003264');
	btn.appendChild(sp);
	return btn;
}

function createMsg(msg){
	var userMessage = childCreation("userMessage", 'div');
	setAttr(userMessage, 'id', msg.id);
	
	var userName = childCreation("userName", 'div');
	userName.innerHTML = msg.name;
	userMessage.appendChild(userName);

	var date = childCreation("date", "h5");
	date.innerHTML = msg.date;
	userMessage.appendChild(date);

	if (msg.method == "DELETE"){
		var sp = iconCreation("glyphicon glyphicon-trash", '#ff0000');
		userMessage.appendChild(sp);
	}

	else{
		
		if (msg.method == "PUT"){
			var sp = iconCreation("glyphicon glyphicon-pencil", '#ff0000');
			userMessage.appendChild(sp);
		}
		
		var text = childCreation("text", 'pre');
		text.innerHTML = msg.text;
		userMessage.appendChild(text);
		
		if(msg.name == appState.name){
			var delBtn = btnCreation("glyphicon glyphicon-pencil", '#003264');
			var editBtn = btnCreation("glyphicon glyphicon-trash", '#003264');
			userMessage.appendChild(delBtn);
			userMessage.appendChild(editBtn);
		}
	}
	return userMessage;
}

function post(url, data, continueWith, continueWithError) {
	ajax('POST', url, data, continueWith, continueWithError);	
}

function put(url, data, continueWith, continueWithError) {
	ajax('PUT', url, data, continueWith, continueWithError);	
}

function del(url, data, continueWith, continueWithError){
	ajax('DELETE', url, data, continueWith, continueWithError);
}

function ajax(method, url, data, continueWith, continueWithError) {
	var xhr = new XMLHttpRequest();

	continueWithError = continueWithError || defaultErrorHandler;
	xhr.open(method || 'GET', url, true);

	xhr.onload = function () {
		if (xhr.readyState !== 4)
			return;

		else if(xhr.status != 200 && xhr.status != 304) {
			continueWithError('Error on the server side, response ' + xhr.status);
			return;
		}

		else if(isError(xhr.responseText) && xhr.status != 304) {
			appState.cond = false;
			continueWithError('Error on the server side, response ' + xhr.responseText);
			return;
		}

		continueWith(xhr.responseText);
	};    

    xhr.ontimeout = function () {
    	continueWithError('Server timed out !');
    }

    xhr.onerror = function (e) {
    	appState.cond = false;
    	var errMsg = 'Server connection error !\n'+
    	'\n' +
    	'Check if \n'+
    	'- server is active\n'+
    	'- server sends header "Access-Control-Allow-Origin:*"';

        continueWithError(errMsg);
    };

    xhr.send(data);
}

function serverCheck(flag){
	if (flag){
		document.getElementById("greenLamp").style.visibility = "visible";
		document.getElementById("redLamp").style.visibility = "hidden";
	}
	else{
		document.getElementById("greenLamp").style.visibility = "hidden";
		document.getElementById("redLamp").style.visibility = "visible";
	}
}