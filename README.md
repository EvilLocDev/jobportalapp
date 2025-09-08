# Job Portal Mobile App

## Table of Contents
- [Environment Variables (.env)](#environment-variables-env)
- [Overview](#overview)
- [Technical](#technical)
- [Features](#features)
- [Diagrams](#diagrams)
- [Result](#result)
- [Project Documentation](#project-documentation)
- [Contributions](#contributions)

## Environment Variables (.env)

Trước khi chạy dự án, bạn cần tạo file `.env` cùng cấp với thư mục `jobportalapi` và cấu hình các biến môi trường sau:

```env
GOOGLE_API_KEY=your_google_api_key
```

## Overview
Hệ thống sử dụng kỹ thuật RAG nhằm nâng cao hiệu quả của hệ thống gợi ý việc làm. Phương pháp RAG có thể sử dụng cả hai cách truy xuất thông tin là từ khóa và tương đồng vector, sau đó phân tích và xếp hạng lại các kết quả. Điều này không chỉ giúp cải thiện độ chính xác mà còn cung cấp giải thích hợp lý cho ứng viên.


## Technical
- **Frontend**: React / React Native
- **Backend**: Django 
- **Gợi ý việc làm**: RAG (Langchain)
- **Cơ sở dữ liệu**: MySQL  
- **Lưu trữ hình ảnh**: Cloudinary  
- **Video call**: Jitsi (WebRTC)  
- **Xác thực**: Ouath2

## Features

### Xác thực và phân quyền
- Đăng nhập, đăng ký và cho phép cấu hình vai trò **người tìm việc**, **nhà tuyển dụng**, **quản trị viên**.  
- Nhà tuyển dụng sau khi tạo công ty thành công cần được quản trị viên xác thực trước khi đăng tin tuyển dụng.  

### Hồ sơ và CV
- Người tìm việc tạo hồ sơ cá nhân, tải lên CV (định dạng **.pdf**).  
- Người dùng có thể lưu nhiều CV khác nhau để nộp cho các vị trí khác nhau.  

### Gợi ý công việc
- Ứng viên sau khi tạo và đặt ít nhất một CV làm mặt định, họ có thể xem danh sách gợi ý công việc.

### Tìm kiếm và lọc tin tuyển dụng
- Tìm kiếm việc làm theo **từ khóa**.  
- Các tin tuyển dụng được hiển thị bởi những công ty đã được xét duyệt.

### Quản lý quy trình ứng tuyển
- Theo dõi trạng thái đơn ứng tuyển:  
  *Đã nộp → Nhà tuyển dụng đã xem → Từ chối → phỏng vấn → Trúng tuyển*  
- Người tìm việc có thể rút hồ sơ trước khi nhà tuyển dụng chấp nhận tuyển dụng.  

### Quản lý tin tuyển dụng
- Tin tuyển dụng có trạng thái giúp nhà tuyển dụng theo dõi quá trình tuyển dụng.  

### Quản lý hồ sơ ứng tuyển
- Nhà tuyển dụng xem được hồ sơ ứng tuyển của tin tuyển dụng.