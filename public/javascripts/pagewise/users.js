// 1.define event for all users 
const allUsersEvents = function(){
    // 2.declare init function
    this.init=function(){
        _this.searchUsersFromAllUsers()
        _this.allusersPagination()
        _this.sortUsers();
    }
    // 4.write functions


    // sort users at all user page
    this.sortUsers = function(){
      $("#sortUsers").on('click',function(){
        $("#renderHere").load(`/users?sortUsers=${$(this).attr('order')} div#renderHere`)
        if($(this).attr('order') == 'asc'){
          $(this).attr('order','desc')
        }
        else{
          $(this).attr('order','asc')
        }
      })
    }

    // pagination for all users
      this.allusersPagination = function(){
        $(".click-page").on('click',function(){
          $("#renderHere").load(`/users?page=${$(this).attr('page')} div#renderHere`)
        })
      }

    // for search users from all users
        this.searchUsersFromAllUsers = function(){
            // console.log('ready for search at all users')
            $("#searchUsers").on('keyup',function(){
              console.log($("#searchUsers").val())
              $("#renderWithPagination").load(`/users?user=${$("#searchUsers").val()} div#renderWithPagination`)
            })
          }

    // 3.declare _this and call init function
    const _this = this;
    _this.init()

}