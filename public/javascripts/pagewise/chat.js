const chatEvents = function () {
  this.init = function () {
    _this.sendChatContainer();
    _this.sendMessage();
  };

  this.sendChatContainer = function () {
    console.log("people chat load");
    try {
      $(".people").on("click", function () {
        // toastr.success("click on people " + $(this).attr("data-userId"));
        let url = `/chat?userId=${$(this).attr("data-userId")}`
        $('.chatbox-change').load(`${url} .chatbox-change-1`)
        $('.input-message').load(`${url} .input-message-1`)
        $('.buttonTochange').load(`${url} .buttonTochange-1`)
        // window.history.pushState('',null,url)
      });
    } catch (error) {
      console.log("error at chat event script in people card rendering", error);
    }
  };

  this.sendMessage = function(){
      $("#sendMessageBtn").on("click", function(){
        if(!$("#chatboxMessage").val()){
         return toastr.error("Write message first !")
        }
        toastr.success(`message: ${$("#chatboxMessage").val()}  \nrom: ${$(this).attr("data-sender")} \nTo: ${$(this).attr("data-reciever")}\n`)
      })
  }  

  const _this = this;
  _this.init();
};