const timelineEvents = function () {
  this.init = function () {
    _this.filterPosts();
    _this.sortPostOnTitle();
    _this.sortPostOnDateandTime();
    _this.paginationBtnClick();
    _this.savePost();
    _this.unsavePost();
    _this.viewPost();
    _this.addComment();
    _this.removeComment();
    _this.archivePosts();
    _this.unarchivePosts();
    _this.notificationSeenEvent();
    _this.unsaveAtTimeline();
  };

  //when post is already saved

  this.unsaveAtTimeline = function () {
    console.log('script for unsave at timeline ------------------>')
    $(document).on("click",".unsavePostAtTimeline", function () {
      toastr.warning("Post Unsaved !");
      $.ajax({
        method:'delete',
        url:`/saved-posts/delete?AtTimeline=true&savedBy=${$(this).attr('data')}&_post=${$(this).attr('id')}`,
        success:function(res){
          console.log('success delete ajax in saved post removal')
        },
        error:function(error){
          console.log('error in unsave at timeline ajax !',error)
        }
      })

      $(`#${$(this).attr('id')}`).replaceWith(`
      
      <button style="margin-right: 30px;" postOwner="${$(this).attr('postOwner')}" id="${$(this).attr('id')}"
                                data="${$(this).attr('data')}" class="btn dropdown-item btn-outline-success savePost" 
                                type="submit">Save</button>

      `)

    });
  };

  // notification marked as seen
  this.notificationSeenEvent = function () {
    $(document).on("click", ".seenBtn", function () {
      toastr.success("notification seen !");
      socket.emit("seenBtnClicked", {
        notificationId: $(this).attr("data-notification-id"),
        notificationTo: $(this).attr("data-notification-owner"),
      });
    });
  };

  // remove comment
  this.removeComment = function () {
    $(document).on("click", ".deleteComment", function () {
      // console.log('---------> script to delete comment')
      // alert('delete comment',$(this).attr('id'))
      $("#commentList").load(
        `/timeline/add-comment?removeComment=true&commentId=${$(this).attr(
          "id"
        )}&postId=${$(this).attr("data")} div#commentList`
      );
      toastr.success("Comment Removed Successfully !");
    });
  };

  //add comment
  this.addComment = function () {
    // console.log('Ready to emit comment added')
    $(document).on("click", ".addComment", function () {
      if ($("#comment").val()) {
        $("#commentList").load(
          `/timeline/add-comment?_post=${$(this).attr("id")}&_commentBy=${$(
            this
          ).attr("data")}&comment=${encodeURIComponent(
            $("#comment").val()
          )} div#commentList`
        );
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
        console.log("After emit comment added");
        return toastr.success("Comment successfully added :)");
        // return socket.emit("commentAdded", {
        //   postId: $(this).attr("id"),
        //   postBy: $(this).attr("data-postBy"),
        //   comment: $("#comment").val(),
        // });
      }
      toastr.error("Write comment first !");
    });
  };

  // view post on view click at post
  this.viewPost = function () {
    $(document).on("click", ".viewPost", function () {
      // alert($(this).attr('id'))
      let url = `/timeline/view-post/${$(this).attr("id")}`;
      if (!window.location.search) {
        // alert(typeof window.location.search)
        window.history.pushState("", null, `${url}`);
      }
      $(".renderPostView").load(`${url} div.postView`);

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
    });
  };

  // unarchive posts

  this.unarchivePosts = function () {
    $(".unarchivePost").on("click", function () {
      // alert('unarchoved called');
      $.ajax({
        method: "get",
        url: `/post?_id=${$(this).attr("id")}&_user=${$(this).attr("data")}`,
        success: function (res) {
          console.log("success in ajax call for unarchive posts");
          window.location.href = "/post/archived-posts";
        },
      });
      toastr.success("Post Unarchived successfully ");
    });
  };

  // archive posts
  this.archivePosts = function () {
    $(document).on("click", ".archivePost", function () {
      // alert($(this).attr('id'))
      $.ajax({
        method: "get",
        url: `/post/archive/${$(this).attr("id")}`,
        success: function (res) {
          console.log("archive ajax successfully called !");
          window.location.href = "/timeline/";
        },
      });
      toastr.info("Post Archived successfully ");
    });
  };

  // save post event
  this.savePost = function () {
    $(document).on("click", ".savePost", function () {
      socket.emit("postSaved", { postBy: $(this).attr("postOwner") });
      toastr.success("post saved");
      $(`#${$(this).attr('id')}`).replaceWith(
        `
        <button style="margin-right: 30px;" postOwner="${$(this).attr('postOwner')}" id="${$(this).attr('id')}"
                                data="${$(this).attr('data')}" class="btn dropdown-item btn-outline-success unsavePostAtTimeline" 
                                type="submit">Unsave</button>`
      );
      $.ajax({
        method: "post",
        url: "/saved-posts/save",
        data: {
          savedBy: $(this).attr("data"),
          _post: $(this).attr("id"),
          postBy: $(this).attr("postOwner"),
        },
        success: function (res) {
          console.log(res);
          let renderPostView1 = $(res).find("#renderPostView-1");
          $("#renderPostView").html(res);
          console.log(renderPostView1);
          console.log("saved ajax called successfully");
        },
      });
    });
  };

  // unsave the post

  this.unsavePost = function () {
    $(".unsavePost").on("click", function () {
      toastr.warning("post Unsaved!");
      let postDetails = {
        savedBy: $(this).attr("data"),
        _post: $(this).attr("id"),
      };
      $.ajax({
        method: "delete",
        url: "/saved-posts/delete",
        data: postDetails,
        success: function (res) {
          if (res.type == "success") {
            console.log("delete ajax called successfully !");
            return (window.location.href = "/saved-posts/");
          }
          if (res.type == "error") {
            console.log("error in delete query for unsave post !");
          }
        },
      });
    });
  };

  // event function for pagination on button-click

  function queryToObj(queryString) {
    const pairs = queryString.substring(1).split("&");

    var array = pairs.map((el) => {
      const parts = el.split("=");
      return parts;
    });

    return Object.fromEntries(array);
  }

  // Event for click on pagination button
  this.paginationBtnClick = function () {
    $(document)
      .off("click", ".click-page")
      .on("click", ".click-page", function () {
        // alert($(this).attr("page"))
        const page = $(this).attr("page");
        let url = `/timeline?page=${page}`;
        if (window.location.search) {
          let queryObject = queryToObj(window.location.search);

          queryObject.page = page;
          console.log(window.location.search);
          url = `/timeline?${new URLSearchParams(queryObject).toString()}`;
          console.log(url);
        }

        window.history.pushState("", null, `${url}`);
        $("#index-pagination").load(`${url} div#index-pagination`);

        _this.savePost();
      });
  };

  // filter post by search on post's title and dedcription and post type of all,mine and others
  this.filterPosts = function () {
    $("#filterBtn").on("click", function () {
      console.log($("#aboutPosts").val(), $("#whichPosts").val());
      console.log(window.location.search);
      let url = `/timeline?post=${$("#whichPosts").val()}&aboutPost=${$(
        "#aboutPosts"
      ).val()}`;

      //push url variable into browsers url
      window.history.pushState("", null, `${url}`);
      $("#index-pagination").load(`${url} div#index-pagination`);

      _this.paginationBtnClick();
    });
  };

  // sort posts on postTitle
  this.sortPostOnTitle = function () {
    $(document).on("click", "#sortByTitle", function () {
      let url = `/timeline?sortByTitle=${$(this).attr("order")}`;
      if (window.location.search) {
        let queryObject = queryToObj(window.location.search);

        queryObject.sortByTitle = $(this).attr("order");
        url = `/timeline?${new URLSearchParams(queryObject).toString()}`;
        console.log(url);
      }

      window.history.pushState("", null, `${url}`);
      $("#renderHere").load(`${url} div#renderHere`);
      if ($(this).attr("order") == "desc") {
        $(this).attr("order", "asc");
      } else {
        $(this).attr("order", "desc");
      }
      _this.paginationBtnClick();
    });
  };

  // sort posts on postDescription
  this.sortPostOnDateandTime = function () {
    $("#sortByDateTime").on("click", function () {
      // alert('sort on Date and Time')
      let url = `/timeline?sortByDateTime=${$(this).attr("order")}`;
      // if(window.location.search){
      //     url = `/timeline${window.location.search}&sortByDateTime=${$(this).attr('order')}`
      // }
      window.history.pushState("", null, `${url}`);
      $("#renderHere").load(`${url} div#renderHere`);
      if ($(this).attr("order") == "desc") {
        $(this).attr("order", "asc");
      } else {
        $(this).attr("order", "desc");
      }
    });
  };

  const _this = this;
  _this.init();
};
