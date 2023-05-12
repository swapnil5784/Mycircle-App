const timelineEvents = function(){
    this.init = function(){
        _this.filterPosts();
        _this.sortPostOnTitle();
        _this.sortPostOnDateandTime();
        _this.paginationBtnClick();
        _this.savePost();
    }

    this.savePost =  function(){
        $(".savePost").on('click',function(){
          if($(this).attr("isSaved") == 'true'){
            return alert('already saved !')
            // $(this).attr('isSaved','true')
            // $(this).html('Saved')
          } 
          if($(this).attr("isSaved") == 'false'){
            alert('Saved')
            $(this).attr('isSaved','true')
            $(this).html('Saved')
            $.ajax({
              method:'post',
              url:'/saved-posts/save',
              data:{
                savedBy:$(this).attr('data'),
                _post:$(this).attr('id'),
                postBy:$(this).attr('postOwner')
              },
              success:function(res){
                console.log('saved ajax called successfully')
              }
            });
          }     
        })
      }
  

    // event function for pagination on button-click
    
    function queryToObj(queryString) {
        const pairs = queryString.substring(1).split('&');

        var array = pairs.map((el) => {
            const parts = el.split('=');
            return parts;
        });

        return Object.fromEntries(array);
    }

    this.paginationBtnClick =  function(){
        $(document).off('click',".click-page").on('click',".click-page",function(){
          // alert($(this).attr("page"))
          const page =  $(this).attr("page")
          let url = `/timeline?page=${page}`
            if(window.location.search){

                let queryObject = queryToObj(window.location.search);
      
                queryObject.page = page;
                console.log(window.location.search);
                url = `/timeline?${new URLSearchParams(queryObject).toString()}`
                console.log(url);
            }

          window.history.pushState('',null,`${url}`)
          $("#index-pagination").load(`${url} div#index-pagination`)

          _this.savePost();
        })
    }


    // filter post by search on post's title and dedcription and post type of all,mine and others
    this.filterPosts = function(){
        $("#filterBtn").on('click',function(){
            console.log($("#aboutPosts").val(),$("#whichPosts").val())
            console.log(window.location.search)
            let url = `/timeline?post=${$("#whichPosts").val()}&aboutPost=${$("#aboutPosts").val()}`

            //push url variable into browsers url
            window.history.pushState('',null,`${url}`)
            $('#index-pagination').load(`${url} div#index-pagination`)

        _this.paginationBtnClick();
        })
    }

    // sort posts on postTitle
    this.sortPostOnTitle = function (){
        $(document).on('click',"#sortByTitle",function(){

            alert('sort on title',$(this).attr('order'))
            let url = `/timeline?sortByTitle=${$(this).attr('order')}`
            if(window.location.search){
                let queryObject = queryToObj(window.location.search);

            queryObject.sortByTitle = $(this).attr('order');
            url = `/timeline?${new URLSearchParams(queryObject).toString()}`
            console.log(url);
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
            _this.paginationBtnClick();

        })
    }

    // sort posts on postDescription
    this.sortPostOnDateandTime = function(){
        $("#sortByDateTime").on('click',function(){
            // alert('sort on Date and Time')
            let url = `/timeline?sortByDateTime=${$(this).attr('order')}`
            // if(window.location.search){
            //     url = `/timeline${window.location.search}&sortByDateTime=${$(this).attr('order')}`
            // }
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


