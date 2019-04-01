$(function() {
	$("#load_json").on("click", function() {
		var s = JSON.parse($("#json").val());
		setLocalStorage(s);
	});

	$("#load_excel").on("click", function() {
		var lst = excel2classlist($("#excel").val());
		var obj = getLocalStorage();
		obj["class"] = lst;
		setLocalStorage(obj);
		// var s = JSON.parse($("#json").val());
		// setLocalStorage(s);
	});

	$("#delete").on("click", function() {
		localStorage.clear();
	});
});

function excel2classlist(str) {
	var classname = {};
	var classlist = [];
	for(let player of str.split("\n")) {
		p = player.split("\t");
		if(p[0] in classname) {
			classlist[classname[p[0]]]["players"].push([p[1], p[2], "", "", "", false]);
		}
		else {
			classname[p[0]] = classlist.length;
			classlist.push({"class_name": p[0], "players": [[p[1], p[2], "", "", "", false]]});
		}
	}
	return classlist;
}