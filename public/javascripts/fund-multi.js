$(document).ready(function() {
      /* Multi select - allow multiple selections */
      /* Allow click without closing menu */
      /* Toggle checked state and icon */
      $('.multicheck').click(function(e) {     
         $(this).toggleClass("checked"); 
         $(this).find("span").toggleClass("icon-ok"); 
         return false;
      });
      /* Single Select - allow only one selection */  
      /* Toggle checked state and icon and also remove any other selections */  
       $('.singlecheck').click(function (e) {
            $(this).parent().siblings().children().removeClass("checked");
            $(this).parent().siblings().children().find("span").removeClass("icon-ok");
            $(this).toggleClass("checked");
            $(this).find("span").toggleClass("icon-ok");
            return false;
        });
 
      /* To check whether an item is checked use the hasClass method */
      //alert($("#chkB").hasClass("checked"));
        
  });
