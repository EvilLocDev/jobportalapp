const JobFitReducer = (state, action) => {
    switch (action.type) {
        case "check_start":
            return {
                ...state,
                loading: true,
                error: null,
                data: null,
            };
        case "check_success":
            return {
                ...state,
                loading: false,
                data: action.payload,
            };
        case "check_error":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case "clear":
            return {
                loading: false,
                error: null,
                data: null,
            };
        default:
            return state;
    }
};

export default JobFitReducer;