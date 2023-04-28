// create event function
const reportEvents = function(){
    // initalize all function
    this.init = function(){
        _this.sortOnTitles();
        _this.searchUsers();
    }
// ----------------------------------------

    // create events
    this.sortOnTitles = function(){
        const _this = this
        $(document).off().on('click','.cron-titles',function(){
            // alert(`${$(this).attr('id')},${$(this).attr('order')}`)
            $("tbody.fire").load(`/report?sort=${$(this).attr('id')}&order=${$(this).attr('order')} tbody.fire`)
                // alert(`${$(_this).attr('id')},${$(_this).attr('order')}`)
                if($(this).attr('order') == 'desc'){
                    $(this).attr('order','asc')
                }
                else{
                    $(this).attr('order','desc')
                }
            
        })
    }

    // search users
    this.searchUsers = function(){
        console.log('script ready for search users------------------->>')
        $("#searchUsersAtCronData").on('keyup',function(){
            console.log($("#searchUsersAtCronData").val())
            $("table.filteredUsers").load(`/report?user=${$("#searchUsersAtCronData").val()} table.filteredUsers`)
        })
    }
// ----------------------------------------
    // declare this and call init function
    const _this=this;
    _this.init()
    
}