const MyApplicationsReducer = (currentState, action) => {
    switch (action.type) {
        case "set":
            return action.payload;
        case "update":
            return currentState.map(app => 
                app.id === action.payload.id ? action.payload : app
            );
        case "add":
            return [action.payload, ...currentState];
        default:
            return currentState;
    }
}

export default MyApplicationsReducer;