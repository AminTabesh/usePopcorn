import { useEffect } from "react";

export function useKey(keyCode, action){
    useEffect(
        function () {
          const callback = (e) => {
            if (e.keyCode === keyCode) {
              action()
            }
          };
    
          document.addEventListener("keyup", callback);
          return function (e) {
            document.removeEventListener("keyup", callback);
          };
        },
        [action, keyCode]
      );
    
}