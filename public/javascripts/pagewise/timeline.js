// declare event main function
const timelineEvents = function(){
    
    // declare init  function
    this.init = function(){
        _this.filterPosts();
    }
    // declare functions for events
    this.filterPosts = function(){
        console.log('------------->d ready to filter post by dropdown')
        $("#filterBtn").on('click',function(){
            alert(`${$("#whichPosts").val()} and ${$("#aboutPosts").val()}`)
            $("#renderHere").load(`/timeline?post=${$("#whichPosts").val()}&aboutpost=${$("#aboutPosts").val()} #render`)
        })
    }

    // declare this as _this
    const _this = this;
    // call init function to load events
    _this.init()
}