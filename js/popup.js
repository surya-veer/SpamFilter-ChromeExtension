

function getData() {
  var script = `var node = document.getElementsByClassName("Bu");
                var message  = node[0].textContent;
                `;
  chrome.tabs.executeScript({
    code: script
  });
}

function sendData(){
    var script = `
                        $.ajax({
                            url: 'http://127.0.0.1:5000/result',
                            type: 'post',
                            dataType: 'json',
                            data: {'message':message,'status':'check'},
                            success: function(data) {
                                        var response  = data;
                                        output = data['response']+'prob_spam'+data['p_spam']+'prob_ham'+data['p_ham'];
                                        chrome.runtime.sendMessage({type: "isStatus", count: data});
                                        data = null;
                                     }
                         });
                `;
  chrome.tabs.executeScript({
    code: script
  });
}

function changeMessage(data){
    var type = data['response'];
    var p_spam = data['p_spam'];
    var p_ham =  data['p_ham'];
    status = '<h2 style="color:red;margin-top:5px;">Spam</h2>'; 
    if(type=='ham'){
      status = '<h2 style="color:green;margin-top:5px;">Not Spam</h2>'
    }
    $("#message").html( '<center>'+
                        status+ 
                        '<h5 style="color:green;"> Not spam: '+ p_ham.toFixed(2)*100 + '%</h5>' + 
                        '<h5 style="color:red;"> Spam: '+ p_spam.toFixed(2)*100 + '%</h5>' + 
                        '</center>'
                        );
}
function waitMessage(){
  $("#message").html( '<center>'+
                      '<h3>Getting...</h3>'+
                      '</center>'
                    );
}

function checkStatus(){
    chrome.runtime.onMessage.addListener(
      function(message, sender, sendResponse) {
          switch(message.type) {
              case "isStatus":
                  data = message.count;
                  changeMessage(data);
                  break;
              default:
                  console.error("Unrecognised message: ", message);
          }
      }
  );
}

function report_message(){
   var script = `
                        $.ajax({
                            url: 'http://127.0.0.1:5000/result',
                            type: 'post',
                            dataType: 'json',
                            data: {'message':message,'status':'report'},
                            success: function(data) {
                                        var response  = data;
                                        output = stString(data['response'])+"prob_spam"+stString(data['p_spam'])+"prob_ham"+stString(data['p_ham']);
                                        chrome.runtime.sendMessage({type: "isStatus", count: data});
                                     }
                         });
               `;
  chrome.tabs.executeScript({
    code: script
  });

  $("#message").html( '<center>'+
                      '<h3>Message has been reported!</h3>'+
                      '</center>'
                    );             

}




checkStatus();

$(document).ready(function(){

  //checking whether spam or not spam 
  $("#getData").click(function () {
    waitMessage();
    getData();
    sendData();
    checkStatus();
    
  });

  //reporting message(ie. updating pre existing dataset)
  $("#report").click(function () {
    report_message();
  });

});



