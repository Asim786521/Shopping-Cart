 

  function addtoCart(proId){
        $.ajax({
            url:'/add-to-Cart/'+proId,
            method:'get',
            success:(response)=>{
                if(response.status){
                    let count=$('#cart-count').html()
                        count=parseInt(count)+1 
                        $('#cart-count').html(count)
                    
                }
              
            }
        })
    }



 