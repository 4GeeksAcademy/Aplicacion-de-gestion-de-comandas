import StateManagedSelect from "react-select";

export const initialStore=()=>{
  return{
    user: null,
    token: null,
    tables: [],   
    message: null,
    todos: [],    
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case "set_tables":
      return {...store, tables: action.payload};
      
    case "set_orders":
      return {...store, tables: action.payload};

    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };
      
    case 'add_task':

      const { id,  color } = action.payload

      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };
    default:
      return store; 
  }  
}
