// create event function
const reportEvents = function(){
    // initalize all function
    this.init = function(){
        _this.sortOnTitles();
    }
// ----------------------------------------

    // create events
    this.sortOnTitles = function(){
        const _this = this
        $('.cron-titles').on('click',function(){
            alert(`${$(this).attr('id')},${$(this).attr('order')}`)
            $(".cronsort").load(`/report?sort=${$(this).attr('id')}&order=${$(this).attr('order')} tbody.cronsort`)
                // alert(`${$(_this).attr('id')},${$(_this).attr('order')}`)
                if($(this).attr('order') == 'desc'){
                    $(this).attr('order','asc')
                }
                else{
                    $(this).attr('order','desc')
                }
            
        })
    }
// ----------------------------------------
    // declare this and call init function
    const _this=this;
    _this.init()
    
}