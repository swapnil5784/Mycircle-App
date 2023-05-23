const userEvents =function(){

    //3. initialize event function
    this.init = function(){
        // _this.updatePostValidation();
        _this.signupValidate();
        _this.viewPostWithoutLogin();
        _this.postUserDetails();
        _this.loginValidate();
        _this.userUpdateFormValidation();
        _this.createPostValidation();
        _this.ajaxCallforModal();
        _this.editPostValidation();
        _this.sortUsers();
        _this.closeErrorModal();

    }
    //4. declare event function

    // close error modal at login

    this.closeErrorModal = function(){
      $('.closeBtn').on('click',function(){
        $("#modal-warning").removeClass('show')
        $.ajax({
          method:'get',
          url:'/login',
          success:function(res){
            window.location.href='/login'
          },
          error:function(error){
            console.log('error at script for close error modal !',error)
          }
        })
      })
    }
  


    // click event on view post without login
    this.viewPostWithoutLogin =  function(){
      $(".viewPostWithoutLogin").on('click',function(){
        $("#renderSearch").load(`/view-post/${$(this).attr("id")} div#commentList`)
      })
    }

    // validation for edit post
    this.editPostValidation = function(){
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
        },
        messages:{
          postTitle:{
            required:'Enter title',
            maxlength:'Title length must be less than 30',
          },
          postDescription:{
            required:'Enter Description',
            maxlength:'Description length must be less than 300',
          },
        },
        submitHandler:function(form){
          form.submit()
        }
      })
  }




   // sort users
   this.sortUsers = function(){
    $("#sortUsers").on('click',function(){
      //alert($(this).attr('data'))
      $.ajax({
        method:'get',
        url:`/users/sort/${$(this).attr('data')}`,
        success:function(res){
          console.log(res)
          $("#torender").html(res)
        },
        error:function(error){
          console.log(error);
        }
      })
      if($(this).attr('data') == 'ascending'){
        return $(this).attr('data','descending');
      }
      return $(this).attr('data','ascending'); 
 
    })
   }

    //ajax Call for edit-post modal
    this.ajaxCallforModal =  function(){
      $(".callAjaxforModal").on('click',function(e){
        e.preventDefault();
        // alert($(this).attr('id'))
        $.ajax({
          method:'get',
          url:`/edit/${$(this).attr('id')}`,
          success:function(res){
              $(".modal-body").html(res)
          }
        })
      })
    }
    


    // create-post validation
    this.createPostValidation = function(){
        $("#createPostForm").validate({
          rules:{
            postTitle:{
              required:true,
              maxlength:30,
            },
            postDescription:{
              required:true,
              maxlength:300,
            },
            postImage:{
              required:true,
            }
          },
          messages:{
            postTitle:{
              required:'Enter title',
              maxlength:'Title should be less than 30 chracters',
            },
            postDescription:{
              required:'Enter Decription',
              maxlength:'Title should be less than 300 chracters'
            },
            postImage:{
              required:'select image'
            }          
          },
          submitHandler:function(form){
            // console.log('$("form#createPostForm,#editpost").validate()' , $("form#createPostForm,#editpost").valid())
            form.submit();
          }
        })
    }
    







    // update user details  by update query

    this.userUpdateFormValidation = function(){
      $("#updateForm").validate({
        rules:{
          firstName:{
            required:true,
          },
          lastName:{
            required:true,
          },
          userEmail:{
            required:true,
            email:true,
            remote:`/users/validate/email`

          },
        },
        messages:{
          firstName:{
            required:'Enter First Name',
          },
          lastName:{
            required:'Enter Last Name',
          },
          userEmail:{
            required:'Enter Email',
            email:'Enter Email Valid manner',
            remote:'email already exist enter new email !'
          },
        }
      })
    }


    // jquery validation for login
    this.loginValidate = function(){
      $("#loginForm").validate({
        rules:{
          userEmail:{
            required:true,
            email:true
          },
          password:{
            required:true,
          }
        },
        messages:{
          userEmail:{
            required:'Enter Email',
            email:'Enter valid Email'
          },
          password:{
            required:'Enter Password'
          }
        },
        submitHandler:function(form){
          form.submit()
        }
      });

    }

    this.signupValidate = function(){
      // custom validator for password

      $.validator.addMethod("checkPwd", function(value, element) {
        let  pattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$");
        return pattern.test(value);
       }, "Enter Proper Password");


        $("#signupForm").validate({
            rules:{
              firstName:{
                required:true,
              },
              lastName:{
                required:true,
              },
              userEmail:{
                required:true,
                email:true,
                remote:`/users/validate/email`
              },

              password:{
                required:true,
                checkPwd:true,
              },
              confirmPassword:{
                required:true,
                equalTo:'#password'
              },
              
            },
            messages:{
               firstName:{
                required:'Enter First Name',
              },
              lastName:{
                required:'Enter Last Name',
              },
              userEmail:{
                required:'Enter Email',
                email:'Enter Email Valid manner',
                remote:'email already exist enter new email !'
              },
              password:{
                required:'Enter Password',
                checkPwd:'Use hard password'
              },
              confirmPassword:{
                required:'Enter Re-password',
                equalTo:'Enter same password'
              },
            }
          })
    }

    this.postUserDetails = function(){
        $("#submitSingin").on('click',function(){
          if(!$("#firstName").val() | !$("#lastName").val() | !$("#password").val() | !$("#confirmPassword").val() ){
            console.log($("#password").val() , $("#confirmPassword").val())
            return toastr.error('fill Signup form properly !')
          }
            $.ajax({
                url:'/signup',
                method:'post',
                data:{
                    firstName:$("#firstName").val(),
                    lastName:$("#lastName").val(),
                    userEmail:$("#userEmail").val(),
                    gender:$("input[type='radio']:checked").val(),
                    password:$("#password").val()
                },
                success:function(res){
                    if(res.type == 'success'){
                        return window.location.href = '/login'
                    }
                    if(res.type == 'error'){
                        return window.location.href = '/signup'
                    }
                }
            })
        })
    }

    // 1. assign this as _this
    const _this = this;

    // 2. call init function to initialize all events written in it
    _this.init()
}