const editEventHandler = function(){
    this.init = function(){
        console.log("updatePostValidation")
        _this.updatePostValidation();
    }

    this.updatePostValidation = function(){
        console.log("hello")
        $("#editPostForm").validate({
          rules:{
            postTitle:{
              required:true,
              maxlength:30,
            },
            postDescription:{
              required:true,
              maxlength:300,
            },
            // postImage:{
            //   required:true,
            // }
          },
          messages:{
            // postTitle:{
            //   required:'Enter title',
            //   maxlength:'Title should be less than 30 chracters',
            // },
            postDescription:{
              required:'Enter Decription',
              maxlength:'Title should be less than 300 chracters'
            },
            // postImage:{
            //   required:'select image'
            // }          
          }
        })
    }
    const _this = this;
    _this.init();
}