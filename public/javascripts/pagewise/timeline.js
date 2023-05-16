

const timelineEvents = function(){
  this.init = function(){
    _this.filterPosts();
    _this.sortPostOnTitle();
    _this.sortPostOnDateandTime();
    _this.paginationBtnClick();
    _this.savePost();
    _this.viewPost();
    _this.addComment();
    _this.removeComment();
    _this.archivePosts();
    _this.unarchivePosts();
  }

  
  // remove comment
  this.removeComment = function(){
    $(document).on('click',".deleteComment",function(){
        console.log('---------> script to delete comment')
        alert('delete comment',$(this).attr('id'))
        $("#commentList").load(`/timeline/add-comment?removeComment=true&commentId=${$(this).attr('id')}&postId=${$(this).attr('data')} div#commentList`)
      })
    }

    //add comment
    this.addComment = function(){
      $(document).on('click','.addComment',function(){
        if($("#comment").val() == ''){
          alert('Enter comment first !')
        }
        else{
          $("#commentList").load(`/timeline/add-comment?_post=${$(this).attr('id')}&_commentBy=${$(this).attr('data')}&comment=${encodeURIComponent($("#comment").val())} div#commentList`)
          // $.ajax({
          //   method:'post',
          //   url:`/timeline/add-comment?postId=${$(this).attr('id')}&commentBy=${$(this).attr('data')}&comment=${$("#comment").val()}`,
          //   data:{
          //     postId:$(this).attr('id'),
          //     CommentBy:$(this).attr('data'),
          //     comment:$("#comment").val()
          //   },
          //   success:function(res){
          //     console.log(res)
          //     console.log('success in ajax for add comment')
          //   },
          //   error:function(error){
          //     console.log('error in ajax for add comment',error)
          //   }
          // })
          console.log($('#comment').val())


        }
      })
    
    }

    // view post on view click at post
    this.viewPost = function(){
      $(document).on("click",".viewPost",function(){
        // alert($(this).attr('id'))
        let url = `/timeline/view-post/${$(this).attr('id')}`
        if(!window.location.search){
          // alert(typeof window.location.search)
          window.history.pushState('',null,`${url}`)
        }
        $(".renderPostView").load(`${url} div.postView`)

        // $.ajax({
        //   method:'get',
        //   url:`/timeline/view-post/${$(this).attr('id')}`,
        //   success:function(res){
        //     console.log('success')
        //   },
        //   error:function(error){
        //     console.log('error')
        //   }
        // })
      })
    }

      // unarchive posts

  this.unarchivePosts = function(){
    $(".unarchivePost").on('click',function(){
      // alert('unarchoved called');
      $.ajax({
        method:'get',
        url:`/post?_id=${$(this).attr('id')}&_user=${$(this).attr('data')}`,
        success:function(res){
          console.log('success in ajax call for unarchive posts')
          window.location.href = '/post/archived-posts'
        }
      })
    })
  }

  // archive posts
    this.archivePosts = function(){
      $(".archivePost").on('click',function(){
        // alert($(this).attr('id'))
        $.ajax({
          method:'get',
          url:`/post/archive/${$(this).attr('id')}`,
          success:function(res){
            console.log('archive ajax successfully called !')
            window.location.href = "/timeline/"
          }
        })
      })
    }

    // save post event 
    this.savePost =  function(){
        $(".savePost").on('click',function(){
          if($(this).attr("isSaved") == 'true'){
            return alert('already saved !')
            // $(this).attr('isSaved','true')
            // $(this).html('Saved')
          } 
          else{
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

    // Event for click on pagination button
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


