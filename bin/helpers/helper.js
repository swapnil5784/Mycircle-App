const customHandlebarHelper = {
    genderCheck:function(option,value){
        if(value == 'male'){
            return true;
        }
        return false;
    }

};
module.exports=customHandlebarHelper;