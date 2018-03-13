
// for sending current ststus to popup.js
function sendStatus(data){
	chrome.runtime.sendMessage({type: "isStatus", count: data});
}

function check(){
 			var node = document.getElementsByClassName("Bu");
            var message  = node[0].textContent;
 			$.ajax({
                            url: 'http://127.0.0.1:5000/result',
                            type: 'post',
                            dataType: 'json',
                            data: {'message':message,'status':'check'},
                            success: function(data) {
                                           var type = data['response'];
    									   var p_spam = data['p_spam'].toFixed(2)*100;
    									   var p_ham =  data['p_ham'].toFixed(2)*100;
                                        output =  "Type: "+type+"\nNot spam: "+p_ham+"%\nSpam: "+p_spam + "%";
                                        alert(output);
                                        sendStatus(data);
                                        data = null;
                                     }
                         });

}

//URL matching
function hashCheck() {
    if (/^#inbox\/.*/.test(location.hash)) {
     	check();
    } 
}
window.addEventListener('hashchange', hashCheck);
hashCheck();