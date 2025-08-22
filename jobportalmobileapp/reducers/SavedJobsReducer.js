// SaveJobsReducer.js

const SavedJobsReducer = (currentState, action) => {
    switch (action.type) {
        case "set":
            // Khởi tạo/Thay thế toàn bộ danh sách bằng dữ liệu từ API
            return action.payload;
        case "add":
            if (currentState.some(job => job.id === action.payload.id)) {
                return currentState; // Nếu đã có, không làm gì cả
            }
            return [...currentState, action.payload];
        case "remove":
            return currentState.filter(job => job.id !== action.payload.id);
        default:
            return currentState;
    }
}

export default SavedJobsReducer;