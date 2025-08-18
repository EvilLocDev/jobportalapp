const SavedJobsReducer = (currentState, action) => {
    switch (action.type) {
        case "set":
            // Khởi tạo danh sách công việc đã lưu (thường sau khi login)
            return action.payload;
        case "add":
            // Thêm một công việc vào danh sách
            return [...currentState, action.payload];
        case "remove":
            // Xóa một công việc khỏi danh sách
            return currentState.filter(job => job.id !== action.payload.id);
        default:
            return currentState;
    }
}

export default SavedJobsReducer;