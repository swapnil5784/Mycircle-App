const chatEvents = function () {
  console.log('-----------------------> chatEvents loaded ')
  this.init = function () {
    _this.sendChatContainer();
    _this.sendMessage();
    _this.moreMessages();
    _this.createGroup();
  };

  // CREATE GROUP IN CHAT

  this.createGroup = function(){

    $("#createGroupBtn").on('click',function(){
      
      if(!$("input[name='members']:checked").length | !$("#groupNameInput").val()){
        return alert('enter group details properly !')
      }


      let groupMembers = []

      $.each($("input[name='members']:checked"),function(){
        // console.log($(this).val())
        groupMembers.push($(this).val())
      })
      console.log(`create group btn clicked GroupCreatedBy:${$(this).attr('data-groupCreatedBy')} GroupName : ${$("#groupNameInput").val()} members:${groupMembers}`)


      $.ajax({
        method:'post',
        url:'/chat/create-group',
        data:{
          _groupAdmin : $(this).attr('data-groupCreatedBy'),
          groupTitle  : $("#groupNameInput").val(),
          members     : JSON.stringify(groupMembers)
        }, 
        success:function(res){
          console.log('create form ajax submitted successfully')
        },
        error:function(error){
          console.log('error in create form submission ajax ',error)
        }
      })
      $('input').val('')
      $('input:checkbox').removeAttr('checked');
      window.location.href = '/chat'


    })


  }



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