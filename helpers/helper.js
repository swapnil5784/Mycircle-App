const moment = require('moment')

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
    } ,
    // moment helper for time format
    moment: function(data){
        return moment(data).fromNow()
    },
    // to reverse arrar
    revArray : function(data){
        return data.reverse(); 
    } ,
    // ObjectId to string
    ObjectIdToString : function(data){
        return data.toString()
    }


};
module.exports=customHandlebarHelper;