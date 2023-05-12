


--------------------------------------------------------------------------
db.getCollection('posts').aggregate([
    {
        $match:{
            isArchived:false
        }
    },
    {
        $lookup: {
          from: "users",
          let: { posts: "$_user" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$posts"],
                },
              },
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
                profileImagePath:1
              },
            },
          ],
          as: "user",
        }
    },
    {
        $project: {
          postTitle: 1,
          postDescription: 1,
          _user:1,
          imageName:1,
          imagePath:1,
          createdOn:1,
          user: { $arrayElemAt: ["$user", 0] },
        },
      }
])


----------------------------------------------
// query for saved post

// query for cron


db.getCollection('users').aggregate([
{
    $match:{
            _id:ObjectId("644616f18d4bc12602582d07"),

        }
    },
    {
    $lookup:{
        from:'posts',
        let:{'userId':'$_id'},
        pipeline:[
            {
                $match:{
                    $expr:[ '$_user','$$userId' ],
                    '_user':ObjectId("644616f18d4bc12602582d07"),
                    
                    }
                }
        ],
        as:'createdPosts'        
        }
 },
 {
     $lookup:{
        from:'savedposts',
        let:{'savedPostId':'$_id'},
        pipeline:[
            {
                $match:{
                    $expr:[ '$savedBy','$$savedPostId' ],
                    'savedBy':ObjectId("644616f18d4bc12602582d07"),

                    }
                }
        ],
        as:'savedPosts'        
        }
  },
  {
    $lookup:{
        from:'savedposts',
        let:{'id':'$_id'},
        pipeline:[
        {
            $match:{
                $expr:{
                    $eq:['$postBy','$$id']
                    }
                
                }
            }
        ],
        as:'savedByothers'
        }
    },

  
  {
      $project:{
          _id:1,
          createdPosts:{ $size : '$createdPosts' },
          savedPosts:{ $size : '$savedPosts' },
          savedByothers:{ $size : '$savedByothers' }
          }
      }



])



//----------------------------------------------------------------------------




db.getCollection("savedposts").aggregate([
{
    $lookup:{
        from:'users',
        let:{'userid':'$_user'},
        pipeline:[
        {
            $match:{
                $expr:{
                    $eq:['$_id','$$userid']
                }
            }
        }
        ],
        as:'user'
    }
},
{
    $lookup:{
        from:'posts',
        let:{'postid':'$_post'},
        pipeline:[
        {
            $match:{
                $expr:{
                    $eq:['$_id','$$postid']
                }
            }
        }
        ],
        as:'post'
    }
},
{
    $project:{
           user: { $arrayElemAt: ["$user", 0] },
           post: { $arrayElemAt: ["$post", 0] },
           
                
    }
}
])

// for users

db.getCollection('users').aggregate([
    {
        $lookup:{
            from:'posts',
            let:{'userPost':'$_id'},
            pipeline:[
                {
                    $match:{
                        $expr:{
                            $eq:['$_user','$$userPost']
                        }
                    }
                }
            ],
            as:'posts'
        }
    },
    {
        $lookup:{
            from:'savedposts',
            let:{'userPostSaved':'$_id'},
            pipeline:[
                {
                    $match:{
                        $expr:{
                            $eq:['$savedBy','$$userPostSaved']
                        }
                    }
                }
            ],
            as:'savedPosts'
        }
    },
    {
        $project:{
            posts:{$size:$posts}
            savedPosts:{$size:$savedPosts}
        }
    }
])


// for archived posts

db.getCollection('posts').aggregate([
    {
        $match:{
            _id:userId
        }
    },
     {
        $lookup:{
            from:'users',
            let:{'archived':'$_user'},
            pipeline:[
                {
                    $match:{
                        $expr:{
                            $eq:['$_id','$$archived']
                        }
                    }
                }
            ],
            as:'user'
        }
    },
]);
 <a  href="./photogrid.html">
                         
                        </a>


                        