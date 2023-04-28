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
            $("tbody.sortedUsers").load(`/report?sort=${$(this).attr('id')}&order=${$(this).attr('order')} .loadData`,function(){
          
            })
            if($(this).attr('order') == 'desc'){
                $(this).attr('order','asc')
            }
            else{
                $(this).attr('order','desc')
            }
                // alert(`${$(_this).attr('id')},${$(_this).attr('order')}`)
                
            
        })
    }

    // search users
    this.searchUsers = function(){
        // console.log('script ready for search users------------------->>')
        $("#searchUsersAtCronData").on('keyup',function(){
            console.log(($("#searchUsersAtCronData").val()).length)
            if(($("#searchUsersAtCronData").val()).length > 2){
                $("tbody.sortedUsers").load(`/report?user=${$("#searchUsersAtCronData").val()} .loadData`)
            }
            if(!($("#searchUsersAtCronData").val())){
                $("tbody.sortedUsers").load(`/report?user=${$("#searchUsersAtCronData").val()} .loadData`)
            }
        })
    }
// ----------------------------------------
    // declare this and call init function
    const _this=this;
    _this.init()
    
}