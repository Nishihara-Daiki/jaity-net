function setLocalStorage(data) {
	var str = "";
	if(typeof data === "object")
		str = JSON.stringify(data);
	else if(typeof data === "string")
		str = data;
	localStorage.setItem("scorebord_data", str);
}

function getLocalStorage() {
	var str = localStorage.getItem("scorebord_data");
	if(str === null)
		return {"class": [], "display": {}, "writer": ""};
	else
		return JSON.parse(str)
}

function createURLparam() {}