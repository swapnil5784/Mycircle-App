const customHandlebarHelper = {
    genderCheck:function(option,value){
        if(value == 'male'){
            return true;
        }
        return false;
    },
    log: function(data){
        console.log("handlebar log ==>", data);
    },
    typeof: function(data){
        console.log('typeof of data ==>',typeof data)
    } 

};
module.exports=customHandlebarHelper;