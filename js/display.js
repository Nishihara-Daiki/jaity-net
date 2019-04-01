// URLパースしてくれるやつ
// http://phiary.me/javascript-url-parameter-query-string-parse-stringify/
var QueryString = {  
	parse: function(text, sep, eq, isDecode) {
		text = text || location.search.substr(1);
		sep = sep || '&';
		eq = eq || '=';
		var decode = (isDecode) ? decodeURIComponent : function(a) { return a; };
		return text.split(sep).reduce(function(obj, v) {
			var pair = v.split(eq);
			obj[pair[0]] = decode(pair[1]);
			return obj;
		}, {});
	},
	stringify: function(value, sep, eq, isEncode) {
		sep = sep || '&';
		eq = eq || '=';
		var encode = (isEncode) ? encodeURIComponent : function(a) { return a; };
			return Object.keys(value).map(function(key) {
			return key + eq + encode(value[key]);
		}).join(sep);
	},
};


$(function() {
	window.addEventListener('storage', function(e) {
		show();
	}, false);

	fitscale();
	show();
});

$(window).on('resize', function() {
	fitscale();
});

// windowサイズに合わせて拡大縮小
function fitscale() {
	// var stdheight = 768;	// 基準の高さ
	var stdwidth = 1366;
	// var scale = $(window).height() / stdheight;
	var scale = $(window).width() / stdwidth;
	$("body").css({"transform": "scale(" + scale + ")"});
}


// ストレージ内容に合わせて表示内容更新
function show() {
	// var storage = getLocalStorage();
	// if(storage == null)
	// 	return;

	// var display = storage.display;

	var display = getShowDisplay();
	if(display == null)
		return;

	$("section").css({"display": "none"});		// 表示オフ
	$("[id^=" + display.scene + "_]").html("");	// 全消去
	fill(display);								// 全埋め
	$("#" + display.scene).css({"display": "block"});	// 今のsceneだけ表示オン
}

// 要素に値を埋めていく
function fill(display) {
	for(var attr in display.content) {
		var id = "#" + display.scene + "_" + attr; 
		$(id).html(display.content[attr]);
	}
}

// url→storageの優先順位でデータをとってくる
function getShowDisplay() {
	var str = QueryString.parse(null, null, null, true).scorebord_data;
	// console.log(str);
	if(str === undefined) {
		display = getLocalStorage().display;
		if(display == undefined)
			display = null;
	}
	else {
		display = JSON.parse(str);
		if(display == "")
			display = null
	}
	return display;
}

