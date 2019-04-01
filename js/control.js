var current = {
	'storage': getLocalStorage(),
	'__preview': "",
	'__classindex': 0,	// クラス番号
	'__order': 0,		// 滑走順
	'__auto_timer_id': undefined,	// 自動画面切り替えのタイマーID
	'__auto_timer_status': 'stop',	// stop / standby / run
	get players() {
		return this.class[this.__classindex].players;
	},
	get class() {
		return this.storage.class;
	},
	get ranking_table() {	// ランキングテーブルを返す
		var ranking = [];
		var rank = [];
		for(let [i,player] of this.players.entries()) {
			ranking[i] = [i, get_total_segment_score(player)];
		}
		ranking.sort(function(a,b){return b[1]-a[1]});
		var tmp = [];
		for(let [i,r] of ranking.entries()) {
			// rank[i] = r[1] === "" ? "" : r[1] === tmp ? rank[i-1] : r[0];
			rank[r[0]] = r[1] === "" ? "" : r[1] === tmp[1] ? tmp[0] : "" + (i + 1);
			tmp = [rank[r[0]], r[1]];
		}
		return rank;
	},
	get order() { return this.__order; },
	set class_name(class_name) {
		var s = this;
		var index = +Object.keys(this.class).filter( (key) => { // valueからkeyを得る
			return this.class[key].class_name === class_name;
		})[0];
		this.__classindex = index;
	},
	set order(order) {
		$trs = $('#playerlist .tbody tr')
		$trs.eq(this.__order).removeClass("selected");
		$trs.eq(order).addClass("selected");
		this.__order = order;
	},
	set score(order_es_pcs_deduction_list) {
		var [order,es,pcs,deduction] = order_es_pcs_deduction_list;
		this.players[order][2] = es;
		this.players[order][3] = pcs;
		this.players[order][4] = deduction;
	},
	set preview(obj) { this.__preview = obj; },
	get preview() { return this.__preview },
	set autotimerid(autotimerid) {
		clearTimeout(this.__auto_timer_id);
		this.__auto_timer_id = autotimerid;
	},
	get autotimerstatus() { return this.__auto_timer_status; },
	set autotimerstatus(status) {
		if(this.__auto_timer_status === 'stop' && status === 'run') {
			console.log('banned stop to run');
			return;
		}
		if(status === 'stop')
			this.autotimerid = undefined;
		this.__auto_timer_status = status;
	}
	// get isauto() {
	// 	return this.__auto_timer_id !== undefined;
	// }
}

$(function() {

	window.addEventListener('storage', function(e) {
		update();
	}, false);

	// クラス変更したら
	$('#class_name').change(function() {
		var classname = $('#class_name option:selected').text();
		current.class_name = classname;
		create_player_list();
	});

	$('#switch-buttons button, #special-switch-buttons button:first-child').click(function() {
		var content = get_display_obj($(this).val());
		current.preview = content;
		url = "display.html?scorebord_data=" + encodeURI(JSON.stringify(current.preview));
		$('#preview-iframe').attr("src", url);
		$('#switch-buttons button').removeClass('on');
		$(this).addClass('on');
		$('#special-switch-buttons button:first-child').removeClass('on');
	});

	$('#special-switch-buttons button:first-child').click(function() {
		current.autotimerstatus = 'stop';
		$('#auto-button').removeClass('on');
		$('#switch-buttons').removeClass('auto');
	});

	$('#submit-button button').click(function() {
		var storage = current.storage;
		storage.display = current.preview;
		setLocalStorage(storage);
	});

	$('#auto-button').click(function() {
		switch(current.autotimerstatus) {
		case 'run':
		case 'standby':
			current.autotimerstatus = 'stop';
			$('#auto-button').removeClass('on');
			$('#switch-buttons').removeClass('auto');
			break;
		case 'stop':
			$('#auto-popup').css({"display": "block"});
		}
	});

	$('#auto-popup-cancel').click(function() {
		$('#auto-popup').css({"display": "none"});
	});

	$('#auto-popup-ok').click(function() {
		$('#auto-button').addClass('on');
		$('#switch-buttons').addClass('auto');
		var now = 0;
		// var isautosubumit = false;
		var autoplaylist = [];
		current.autotimerstatus = 'standby';

		var interval = $('#auto-popup-interval').val() * 1000;
		var start = +$('#auto-popup-start').val() - 1;
		var end = +$('#auto-popup-end').val() - 1;
		$('#auto-popup-options input:checked').each(function() {
			val = $(this).val();
			switch(val) {
				case "order":
				for(let i = start; i <= end; i++)
					autoplaylist.push([val, i]);
				break;
				case "score":
				for(let i = start; i <= end; i++)
					if(current.players[i][5] === false)
						autoplaylist.push([val, i]);
				break;
				default:
				autoplaylist.push([val]);
			}
		});

		$('#submit-button button').click(function(){ 
			if(current.autotimerstatus === 'standby') {
				now = 0;
				current.autotimerstatus = 'run';
				next();
			}
		});

		$('#auto-popup').css({"display": "none"});

		// current.autotimerid = undefined;	// 現在動いてるタイマーストップ

		function next() {
			current.autotimerid = undefined;
			if(autoplaylist.length == 0) {
				$('#auto-button').removeClass('on');
				$('#switch-buttons').removeClass('auto');
				return;
			}
			let playernum = autoplaylist[now][1];
			if(playernum !== undefined)
				$('#playerlist .tbody tr').eq(playernum).children('td:nth-child(2)').click();	// 選手選択
			$('#switch-buttons button[value="' + autoplaylist[now][0] + '"').click();
			if(current.autotimerstatus === 'run')
				$('#submit-button button').click();
			now++;
			now %= autoplaylist.length;
			if(interval < 1000) interval = 1000;
			current.autotimerid = setTimeout(next, interval);
		}
		next();

	});

	update();
	create_player_list();
});


// ストレージ内容に合わせて表示内容更新
function update() {

	// select -> option
	var cls = current.class;
	$("#class_name").html("");
	for(i = 0; i < cls.length; i++)
		$("#class_name").append("<option>" + cls[i].class_name + "</option>");
}

// 選手一覧作成
function create_player_list() {
	var $table = $("#playerlist table.tbody");
	$table.html("");

	for(let [i, player] of current.players.entries()) {
		let es = "", pcs = "", deduction = "", tss = "", rank = "";
		if(player.length >= 3 && player[2] != "") {
			es = +player[2];
			pcs = +player[3];
			deduction = +player[4];
			tss = calc_total_segment_score(es, pcs, deduction);
			rank = 0;
		}
		let cls = '';
		if(player[5] == true)
			cls = ' class="retired"';
		let s = '<tr' + cls + '>';
		s += '<td>' + (i+1) + '</td>';
		s += '<td>' + player[0] + '</td>';
		s += '<td>' + player[1] + '</td>';
		s += '<td><input value="' + es + '"></td>';
		s += '<td><input value="' + pcs + '"></td>';
		s += '<td><input value="' + deduction + '"></td>';
		s += '<td>' + tss + '</td>';
		s += '<td>' + rank + '</td>';
		s += '</tr>';
		$table.append(s);
	}

	$('#playerlist .tbody input').change(function() {
		var $trs = $('#playerlist .tbody tr')
		var order = $trs.index($(this).closest("tr"));
		var $tr = $trs.eq(order);
		var $inputs = $tr.find("input");
		var es = $inputs.eq(0).val();
		var pcs = $inputs.eq(1).val();
		var deduction = $inputs.eq(2).val();
		current.score = [order,es,pcs,deduction];
		var tss = calc_total_segment_score(es, pcs, deduction);
		// if(current.players[order][5])
		// 	tss = "";
		update_score(order, tss);
	});

	$('#playerlist .tbody tr td:not(:nth-child(n+4):nth-child(-n+6))').click(function() {
		var $trs = $('#playerlist .tbody tr');
		var $thisparent = $(this).parent();
		var index = $trs.index($thisparent);
		// $trs.removeClass("selected");
		// $thisparent.addClass("selected");
		current.order = index;
	});


	$('#playerlist .tbody tr td:first-child').click(function() {
		var $trs = $('#playerlist .tbody tr');
		var $thisparent = $(this).parent();
		var index = $trs.index($thisparent);
		var tf = current.players[index][5] = !current.players[index][5];
		$trs.eq(index).toggleClass("retired");
		reranking();
	});

	// $('#playerlist .tbody tr').eq(0).addClass("selected");
	reranking();
	current.order = 0;
}


function calc_total_segment_score(es, pcs, deduction) {
	if(es !== "" && pcs !== "" && deduction !== "")
		return (Math.abs((+es)*100)+Math.abs((+pcs)*100)-Math.abs((+deduction)*100))/100;
	else 
		return "";
}


function get_total_segment_score(player) {
	if(player.length >= 5 && player[5] == false)
		return calc_total_segment_score(player[2], player[3], player[4]);
	else
		return "";
}


// スコア更新
function update_score(order, tss) {
	var $trs = $('#playerlist .tbody tr');
	var $tr = $trs.eq(order);
	$tr.find("td").eq(6).text(tss);
	reranking();
}


// ランキングして更新
function reranking() {
	// for(let [i,r] of current.ranking_table.entries()) {
	// 	if(r !== "") {
	// 		$('#playerlist .tbody tr').eq(r).find('td').eq(7).text(i+1);
	// 	}
	// }
	$trs = $('#playerlist .tbody tr');
	for(let i = 0; i < $trs.length; i++) {
		$trs.eq(i).find('td').eq(7).text(current.ranking_table[i])
	}
}


function get_display_obj(displaystr) {
	var obj = {};
	var order = current.order;
	var player = current.players[order];
	// var ranking_table = +current.ranking_table-1;

	switch(displaystr) {
	case "order":
		obj = {
			"number": player[5] ? "Retired." : "order: " + (order + 1),
			"name": player[0],
			"assign": player[1]
		};
		console.log(player[5])
		break;
	case "score":
		obj = {
			"number": "" + (order + 1),
			"name": player[0],
			"assign": player[1],
			"es": player[2],
			"pcs": player[3],
			"deductions": player[4],
			"tss": "" + get_total_segment_score(player),
			"rank": current.ranking_table[order]
		};
		break;
	case "rank":
		// for(let i = 0; i < 8 && i < current.players.length; i++) {
		// 	if(current.ranking_table[i] == "")
		// 		break;
		// 	let rn = "r" + i, namen = "name" + i, scoren = "score" + i;
		// 	let p = current.players[+current.ranking_table[i]-1];
		// 	console.log(p.length);
		// 	obj[rn] = "" + i;
		// 	obj[namen] = current.players[current.ranking_table[i]-1][0]; //p[0];
		// 	obj[scoren] = get_total_segment_score(p);
		// }
		// break;


		for(let i = 0; i < current.ranking_table.length; i++) {
			let rank = +current.ranking_table[i];
			if(rank == 0)
				continue;
			if(rank > 8)
				continue;
			let rn = "r" + rank, namen = "name" + rank, scoren = "score" + rank;
			obj[rn] = "" + rank;
			obj[namen] = current.players[i][0];
			obj[scoren] = get_total_segment_score(current.players[i]);
		}
		break;
	case "message":
		obj = {"text": $("#message-text").val().replace(/\n/g, "<br>")};
		break;
	}
	var content = {
		"scene": displaystr,
		"content": obj
	}
	console.log(obj);
	return content;
}
