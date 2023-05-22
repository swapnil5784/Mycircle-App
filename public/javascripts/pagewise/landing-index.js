//1. create indexEvents
const landingPageEvents = function(){
    // console.log("------------------------------new javascript--------------------")
    //2.create init
    this.init = function(){
        _this.paginationOnLanding();
        _this.searchPostsAtIndexpage();
        _this.viewPostwihoutLogin();

    }
 
    //4. define functions

        // landing app view post
        this.viewPostwihoutLogin = function(){
          // console.log('------------> test: for view post without login at timeline js')
          $(document).on('click',".viewPostwihoutLogin",function(){
            let postId= $(this).attr('id')
            $("#renderSearch").load(`/view-post/${postId} div.postView`)
          })
        }


    this.paginationOnLanding = function(){
        // console.log('script of pagination ready')
        $(document).off().on('click',".click-page",function(){
            // alert($(this).attr('page'))
            $("#renderHere").load(`?page=${$(this).attr('page')} div#renderHere`)
        })
    }

      // index page searching
  this.searchPostsAtIndexpage = function(){
    // console.log('script of searching ready')
    $("#searchAtIndex").on('keyup',function(){
      console.log($("#searchAtIndex").val())

      $("#renderSearch").load(`/search?aboutPost=${$("#searchAtIndex").val()} div#renderSearch`)

    //   $.ajax({
    //     method:'get',
    //     url:`/search?aboutPost=${$("#searchAtIndex").val()}`,
    //     success:function(res){
    //       console.log(res)
          
    //     },
    //     error:function(err){
    //       console.log(err)
    //     }
    //   })
    })
  }
     //3. declaration
     const _this = this
     _this.init()
}
