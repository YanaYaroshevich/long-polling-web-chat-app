'use strict'

var editFlag = false;
var id = -1;

var uniqueId = function() {
	var date = Date.now();
	var random = Math.random() * Math.random();
	return Math.floor(date * random).toString();
};

var theMessage = function(msgText, userName) {
	return {
		text: msgText,
		name: userName,
		date: getDate(),
		id: uniqueId(),
		isDeleted: false,
		isEdited: false
	};
};

var appState = {
	mainUrl : 'chat',
	messages:[],
	name : '',
	token : 'TN11EN',
	cond: true
};

function getDate(){
	return (new Date()).toLocaleDateString() + " " + (new Date()).toLocaleTimeString();
}

function defaultErrorHandler(message) {
	appState.cond = false;
	console.error(message);
	restore();
}

function isError(text) {
	if(text == "")
		return false;
	try {
		var obj = JSON.parse(text);
	} catch(ex) {
		appState.cond = false;
		restore();
		return true;
	}
	return !!obj.error;
}

function run() {
	document.addEventListener('click', delegateEvent);
	restore();
}

function setName(value){
	if(!value){
		return;
	}
	appState.name = value;
}

function onInputNameButtonClick(evtObj){
	var nameField;
	nameField = (evtObj.target.classList.contains('btn-success')) ?
		document.getElementById('nameInputText') : document.getElementById('nameChangeText');
	setName(nameField.value);
	createPage();
	store();
}

function onSendMsgButtonClick(evtObj){
	var textField = document.getElementById('inputMsgText');
	(editFlag) ? sendEditedMsg(textField.value, evtObj) : sendMsg(textField.value, evtObj);
	textField.value = '';
}

/*function onEditMsgButtonClick(evtObj){
	var msg = (evtObj.target.hasChildNodes()) ? evtObj.target.parentElement : evtObj.target.parentElement.parentElement;
	id = msg.getAttribute('id');
	var indicator = (evtObj.target.hasChildNodes()) ? evtObj.target.firstElementChild.className : evtObj.target.className;
	(indicator == "glyphicon glyphicon-pencil") ? editMsg(id) : removeMsg(id);
}*/

/*function removeMsg(id){
	for (var i = 0; i < appState.messages.length; i++){
		var msg = appState.messages[i];
		if(msg.id == id && msg.name == appState.name){
			msg.isDeleted = true;
			break;
		}
		else if (msg.id == id){
			alert("you can't delete this!");
		}
	}

	del(appState.mainUrl, JSON.stringify({id: id}), function(){
		editFlag = true;
		restore();
		createPage();
	});
}*/

/*function editMsg(id){
	var textToChange = "";
	for (var i = 0; i < appState.messages.length; i++){
		var msg = appState.messages[i];
		if(msg.id == id && msg.name == appState.name && !msg.isDeleted){
			appState.messages[i].isEdited = true;
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
}*/

function sendMsg(value){
	if(!value){
		return;
	}
	var objMsg = theMessage(value, appState.name);
	post(appState.mainUrl, JSON.stringify(objMsg), function(){
		restore();
	});
}

function getHistory(responseText, continueWith){
	console.assert(responseText != null);

	var response = JSON.parse(responseText);

	appState.token = response.token;

	if (editFlag){
		appState.messages = response.messages;
		editFlag = false;
	}
	else
		appState.messages = appState.messages.concat(response.messages);

	if(typeof(Storage) == "undefined") {
		alert('localStorage is not accessible');
		return;
	}
	var item = JSON.parse(localStorage.getItem("Chatting page"));
	appState.name = item.name;

	createPage();

	continueWith && continueWith();
}

/*function sendEditedMsg(value){
	var obj = {
		id: id,
		text: value
	};

	put(appState.mainUrl + '?token=' + 'TE11EN', JSON.stringify(obj), function(responseText){
		getHistory(responseText);
	});
}*/

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

function delegateEvent(evtObj) {
	if(evtObj.type === 'click'){
		if (evtObj.target.classList.contains('btn-success')
			|| evtObj.target.classList.contains('btn-info'))
			onInputNameButtonClick(evtObj);
		else if (evtObj.target.classList.contains('btn-primary')){
			onSendMsgButtonClick(evtObj);
		}
		else if (evtObj.target.classList.contains('btn-default')
			|| evtObj.target.classList.contains('glyphicon')){
			onEditMsgButtonClick(evtObj);
		}
	}
}

function greetingCreation(){
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

	if(msg.isDeleted == "false" || !msg.isDeleted){
		/*if(msg.isEdited == "true" || msg.isEdited){
			var sp = iconCreation("glyphicon glyphicon-pencil", '#ff0000');
			userMessage.appendChild(sp);
		}*/

		var text = childCreation("text", 'pre');
		text.innerHTML = msg.text;
		userMessage.appendChild(text);


		/*if(msg.name == appState.name){
			var delBtn = btnCreation("glyphicon glyphicon-pencil", '#003264');
			var editBtn = btnCreation("glyphicon glyphicon-trash", '#003264');
			userMessage.appendChild(delBtn);
			userMessage.appendChild(editBtn);
		}*/
	}

	else{
		var sp = iconCreation("glyphicon glyphicon-trash", '#ff0000');
		userMessage.appendChild(sp);
	}
	return userMessage;
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
	items.scrollTop = 9999;
}

function store() {
	if(typeof(Storage) == "undefined") {
		alert('localStorage is not accessible');
		return;
	}
	localStorage.clear();
	localStorage.setItem("Chatting page", JSON.stringify(appState));
}

function restore(continueWith) {
	var url =  appState.mainUrl + '?token=';
	url += (editFlag) ? "TN11EN" : appState.token;

	get(url, function(responseText) {
		getHistory(responseText, continueWith);
	});
}

function get(url, continueWith, continueWithError) {
	ajax('GET', url, null, continueWith, continueWithError);
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

		if(xhr.status != 200) {
			continueWithError('Error on the server side, response ' + xhr.status);
			return;
		}

		if(isError(xhr.responseText)) {
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