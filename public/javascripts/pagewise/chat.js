const chatEvents = function () {
  console.log('-----------------------> chatEvents loaded ')
  this.init = function () {
    _this.sendChatContainer();
    _this.sendMessage();
    _this.moreMessages();
  };

  let messagePagination = 1;

  this.moreMessages = function(){
    console.log('-----------------> send more messages sript loaded !')
    $("#chatPage").on('click',"#moreBtn",function(){
      messagePagination++;
      console.log('more btn clicked !')
      let url = `/chat?pagination=${messagePagination}&moreReceiver=${$(this).attr('data-receiver')}`
      $('.chatbox-change').load(`${url} #chatBox`)
    })
  }

  this.sendChatContainer = async function () {
    try {
      console.log('----> people change script loaded')
      $(".people").on("click",function () {
        messagePagination = 1
        $("#messageNotificationNumber").attr('style','display:none;')
        console.log("-----------> people clicked");
        let url = `/chat?userId=${$(this).attr("data-userId")}`
        $('.chatbox-change').load(`${url} #chatBox`)
        $('#chatBox').attr('chatBoxOf',$(this).attr("data-userId"))
        $("#sendMessageBtn").attr('data-receiver',$(this).attr("data-userId"))
        $("#moreBtn").attr('data-receiver',$(this).attr("data-userId"))
      });
    } catch (error) {
      console.log("error at chat event script in people card rendering", error);
    }
  };

  this.sendMessage = function(){
    console.log('----> send message script loaded')
      $("#sendMessageBtn").on("click",async function(){
        // toastr.success("send message clicked !")
        if(!$("#chatboxMessage").val()){
         return toastr.error("Write message first !")
        }
        // socket.emit('sendMessage',{message:$("#chatboxMessage").val(),sender:$(this).attr("data-sender"),receiver:$(this).attr("data-receiver")})
        
        $('.chatbox-change').load(`/chat/message?sender=${$(this).attr("data-sender")}&receiver=${$(this).attr("data-receiver")}&message=${encodeURIComponent($("#chatboxMessage").val())} div#chatBox`)

        $("#chatboxMessage").val('')
      })
  }  

  const _this = this;
  _this.init();
};