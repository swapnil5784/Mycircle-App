// query for saved post



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


                        