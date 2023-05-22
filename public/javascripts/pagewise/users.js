// 1.define event for all users 
const allUsersEvents = function(){
    // 2.declare init function
    this.init=function(){
        _this.searchUsersFromAllUsers()
        _this.allusersPagination()
    }
    // 4.write functions

    // pagination for all users
      this.allusersPagination = function(){
        $(document).on('click',".click-page",function(){
          $("#renderHere").load(`/users?page=${$(this).attr('page')} div#renderHere`)
        })
      }

    // for search users from all users
        this.searchUsersFromAllUsers = function(){
            // console.log('ready for search at all users')
            $("#searchUsers").on('keyup',function(){
              console.log($("#searchUsers").val())
              $("#renderWithPagination").load(`/users?user=${$("#searchUsers").val()} div#index-pagination`)
            //   $.ajax({
            //     method:'get',
            //     url:`/users?user=${$("#searchUsers").val()}`,
            //     success:function(res){
            //     //   console.log(res)
                 
            //     }
            //   })
            })
          }

    // 3.declare _this and call init function
    const _this = this;
    _this.init()

}