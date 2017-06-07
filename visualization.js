'use strict';  //treat silly mistakes as run-time errors

/* Your script goes here */
function strtowords(text){
    var words=text.split(/\W+/);
    var filteredwords=[];
    for(var i=0; i<words.length; i++){
        if(words[i].length>1){
            filteredwords.push(words[i].toLowerCase());
        }
    }
    return filteredwords;
}

function emotional(words,emotion_spe){
    var emo_words=[];
    for(var i=0; i<words.length; i++){
        var word = words[i];
        if (SENTIMENTS[word] != undefined && SENTIMENTS[word][emotion_spe] == 1){
            emo_words.push(word);
        }
    }
    return emo_words;
}

function commonlist(words){
    var common_list={};
    var oncewords=[];
    for(var i=0; i<words.length; i++){
        if (oncewords.indexOf(words[i])<0){
            oncewords.push(words[i]);
            var count = 0;
            for(var j=0; j<words.length;j++){
                if(words[j]==words[i]){
                    count = count+1;
                }
            }
            common_list[words[i]]=count;
        } 
    }
	var sortable=[];
    for(var word in common_list){
        sortable.push([word, common_list[word]]);
    }
    sortable.sort(function(a,b){return a[1]-b[1];});
    var commonlist=[];
    for(var i=sortable.length-1; i>=0; i--){
        commonlist.push(sortable[i][0]);
    }
    return commonlist;
}

function analyzeTweets(tweets){
//get a list of hashtags for each emotion in lower case.
    var tweet_texts=[];
    var tweet_hashtags = [];
    for(var m=0; m<EMOTIONS.length; m++){
        tweet_hashtags.push([]);
    }
     //get a list of hashtags for each emotion in lower case.
    for(var i=0; i<tweets.length;i++){
        tweet_texts.push(tweets[i]['text']);
        for(var j=0; j<EMOTIONS.length; j++){
            for(var k=0; k<tweets[i]['entities']['hashtags'].length;k++){
                if(emotional(strtowords(tweets[i]['text']), EMOTIONS[j]).length>0){
                    tweet_hashtags[j].push("#"+tweets[i]['entities']['hashtags'][k]['text'].toLowerCase());
                }
            }
        }
    }
    //calculate and round the percentage of each emotion.
    var count=[];
    for(var n=0; n<EMOTIONS.length; n++){
        count.push(0);
    }
    var large_str='';
    for(var p=0; p<tweet_texts.length; p++){
        var count_each=[];
        large_str = large_str+" "+tweet_texts[p];
        for(var q=0; q<EMOTIONS.length; q++){
            count_each[q]=(emotional(strtowords(tweet_texts[p]),EMOTIONS[q]).length);
            count[q] = count[q] + count_each[q];
        }
        var a = [];
        for(var r = 0; r<tweet_texts.length; r++){
            a.push(strtowords(tweet_texts[r]).length);
        }
        var countsum = a.reduce(
            function(total, num){return total+num},0);
        var count_per = [];
        for(var s=0; s<count.length; s++){
            count_per.push(Math.round(count[s]/countsum*100*100)/100);
        }
    }
    //get three the most common words for each emotion, and get three most common hashtags for each emotion.
    var emotional_wordlist=[];
    var emotional_hashtags = [];
    for(var t=0; t<EMOTIONS.length; t++){
        var emotional_word = emotional(strtowords(large_str), EMOTIONS[t]);
        var emotional_words = commonlist(emotional_word).slice(0, 3);
        emotional_wordlist[t]=emotional_words;
        if(tweet_hashtags[t].length>3){
            var tweet_hash = commonlist(tweet_hashtags[t]).slice(0, 3);
        }
        else{
            tweet_hash = tweet_hashtags[t];
        }
        emotional_hashtags[t]=tweet_hash;
    }
    //get an object of 10 objects consist of data of the table. 
    var chart_data=[];
    for(var u=0; u<EMOTIONS.length; u++){
        var chart_data_line={};
        chart_data_line['EMOTION']=EMOTIONS[u];
        chart_data.push(chart_data_line);
        chart_data[u]['% of WORDS'] = count_per[u];
        // .join() is used to include commas and spaces between the words/hashtags in the list. 
        chart_data[u]['EXAMPLE WORDS'] = emotional_wordlist[u].join(', '); 
        chart_data[u]['HASHTAGS'] = emotional_hashtags[u].join(', ');
    }
    return chart_data;
}
//test code:
//console.log(analyzeTweets(SAMPLE_TWEETS));

function drawPieChart(chart_data){
	var dataset = [];
	for(var i=0; i<chart_data.length; i++){
		dataset.push(chart_data[i]["% of WORDS"]);
	}
	var labelset = [];
	for(var j=0; j<chart_data.length; j++){
		labelset.push(chart_data[j]["EMOTION"]+":"+chart_data[j]["% of WORDS"]+"%");
	}
	
	var radius = 220;
	var margin = {top: 20, right: 10, bottom: 20, left: 10};
    var height = 480;
	var width = 600;
    var color = d3.scaleOrdinal()
	    .range(["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]);
	var arc = d3.arc()
	    .outerRadius(radius - 10)
		.innerRadius(0);
	var labelArc = d3.arc()
	    .outerRadius(radius - 40)
		.innerRadius(radius - 40);
	var pie = d3.pie()
	    .sort(null)
		.value(function(d){return d;});
	d3.selectAll("svg>*").remove();
	var svg = d3.select('#visContainer')
		    .append("svg")
			.style('position','absolute')
	    	.attr('height', height+margin.top+margin.bottom) //can adjust size as desired
	    	.attr('width', width+margin.left+margin.right)
		  .append("g")
			.attr("transform", "translate("+width/2+","+height/2+")")
          .style('border','1px solid gray'); //comment out to remove border
	var g = svg.selectAll(".arc")
	    .data(pie(dataset))
	  .enter().append("g")
	    .attr("class","arc")
	g.append("path")
	 .attr("d",arc)
	 .style("fill", function(d,i){return color(i);})
	 .style("opacity", "0.85");
	g.on("mouseover", function(d){
		d3.select(this).style("opacity", "0.6");
	}).on("mouseout", function(d){
		d3.select(this).style("opacity","1.0");
	});
	g.append("text")
	 .attr("transform", function(d){return "translate(" + labelArc.centroid(d)+")";})
	 //.attr("dy", ".100em")
	 .data(labelset)
	 .text(function(d){return d;})
	 .style("fill","black")
	 .style("font-size", "13px")
	 .style("font-weight","bold")
	 .on("mouseover", function(d){
		 d3.select(this).style("fill", "red").style("font-size", "20px");
	 })
	 .on("mouseout", function(d){
		 d3.select(this).style("fill", "black").style("font-size", "13px");
	 });
}

function loadTweets(username){
	d3.json('https://faculty.washington.edu/joelross/proxy/twitter/timeline/?screen_name='+username+'&count=100', function(data){
		var userdata = analyzeTweets(data);
		drawPieChart(userdata);
    })
}


var chart_data = analyzeTweets(SAMPLE_TWEETS);
drawPieChart(chart_data);
var searchbutton = d3.select('#searchButton');
searchbutton.on('click', function(){
	d3.selectAll("svg>*").remove();
	var input = d3.select('#searchBox');
	var username = input.property('value');
	loadTweets(username);
})
