const timelineEvents = function(){
    this.init = function(){
        _this.filterPosts();
        _this.sortPostOnTitle();
        _this.sortPostOnDateandTime();
        _this.paginationBtnClick();
    }

    // event function for pagination on button-click
    
    this.paginationBtnClick =  function(){
        $(document).off('click',".click-page").on('click',".click-page",function(){
          // alert($(this).attr("page"))
          const page =  $(this).attr("page")
          let url = `/timeline?page=${page}`
          if(window.location.search){
            url = `/timeline${window.location.search}&page=${page}`
        }
          window.history.pushState('',null,`${url}`)
          $("#index-pagination").load(`${url} div#index-pagination`,function(){
            // window.history.pushState(null,null,`/timeline?page=${page}`)
          })

        })
    }


    // filter post by search on post's title and dedcription and post type of all,mine and others
    this.filterPosts = function(){
        $("#filterBtn").on('click',function(){
            console.log($("#aboutPosts").val(),$("#whichPosts").val())
            let url = `/timeline?post=${$("#whichPosts").val()}&aboutPost=${$("#aboutPosts").val()}`
            if(window.location.search){
                url = `/timeline${window.location.search}&post=${$("#whichPosts").val()}&aboutPost=${$("#aboutPosts").val()}`
            }
            window.history.pushState('',null,`${url}`)
            $('#renderHere').load(`${url} div#renderHere`)

        _this.paginationBtnClick();
        })
    }

    // sort posts on postTitle
    this.sortPostOnTitle = function (){
        $("#sortByTitle").on('click',function(){
            // alert('sort on title',$(this).attr('order'))
            let url = `/timeline?sortByTitle=${$(this).attr('order')}`
            if(window.location.search){
                url = `/timeline${window.location.search}&sortByTitle=${$(this).attr('order')}`
            }
            window.history.pushState('',null,`${url}`)
            $("#renderHere").load(`${url} div#renderHere`)
            if($(this).attr('order') == 'desc'){
                $(this).attr('order','asc')
            }
            else
            {
                $(this).attr('order','desc')
            }

        })
    }

    // sort posts on postDescription
    this.sortPostOnDateandTime = function(){
        $("#sortByDateTime").on('click',function(){
            // alert('sort on Date and Time')
            let url = `/timeline?sortByDateTime=${$(this).attr('order')}`
            if(window.location.search){
                url = `/timeline${window.location.search}&sortByDateTime=${$(this).attr('order')}`
            }
            window.history.pushState('',null,`${url}`)
            $("#renderHere").load(`${url} div#renderHere`)
            if($(this).attr('order') == 'desc'){
                $(this).attr('order','asc')
            }
            else
            {
                $(this).attr('order','desc')
            }

        })
    }



    const _this=this;
    _this.init();
}