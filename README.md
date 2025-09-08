# Job Portal Mobile App

## Table of Contents
- [Environment Variables (.env)](#environment-variables-env)
- [Overview](#overview)
- [Technical](#technical)
- [Features](#features)
- [Diagrams](#diagrams)
- [Result](#result)
- [Comment](#comment)

## Environment Variables (.env)

Trước khi chạy dự án, bạn cần tạo file `.env` cùng cấp với thư mục `jobportalapi` và cấu hình các biến môi trường sau:

```env
GOOGLE_API_KEY=your_google_api_key
```

## Overview
- Hệ thống sử dụng kỹ thuật RAG nhằm nâng cao hiệu quả của hệ thống gợi ý việc làm. Phương pháp RAG có thể sử dụng cả hai cách truy xuất thông tin là từ khóa và tương đồng vector, sau đó phân tích và xếp hạng lại các kết quả. Điều này không chỉ giúp cải thiện độ chính xác mà còn cung cấp giải thích hợp lý cho ứng viên.
- Đến thời điểm viết `readme.md`, hệ thống có khả năng phân tích ngữ nghĩa (semantic) của CV ứng viên để truy xuất và đề xuất những tin tuyển dụng phù hợp nhất. Kết quả đánh giá offline trên tập dữ liệu mẫu cho thấy hiệu quả rất cao với chỉ số **Hit Rate @10 đạt 93.90%** và **MRR đạt 0.7452**.

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

## Diagrams

### Kiến trúc hệ thống
![System Architecture](./images/mvt.png)

### Sơ đồ usecase
![Class Diagram](./diagrams/usecase.png)

### Lược đồ cơ sở dữ liệu
![Class Diagram](./diagrams/datadiagram/dataclassdiagram.png)

## Result
### Màn hình đăng ký và đăng nhập
- Màn hình đăng ký, cho phép người dùng đăng ký tài khoản mới với các thông tin bắt buộc phải cung cấp như hình.
- Màn hình đăng nhập, cho phép người dùng đăng nhập bằng tài khoản của họ.
  ![Register & Login](./images/regisandlogin.png)  

### Màn hình chủ và chi tiết công việc
- Màn hình trang chủ hiển thị một danh sách các công việc cũng như các công ty và thanh search bar ở phía trên, cho phép người dùng lọc theo công ty và từ khóa. Khi bấm vào một công việc, nó sẽ chuyển hướng đến trang chi tiết công việc đó.
- Trong trang chi tiết công việc có chức năng lưu, apply công việc, và có thêm tính năng check công việc với resume được set default có phù hợp không bằng Gemini API.
  ![Job Detail & Home Page](./images/jobdetailandhomepage.png)  

### Màn hình hồ sơ của ứng viên và nhà tuyển dụng
- Bên trái là màn hình profile của ứng viên, có các tính năng như quản lý CV, quản lý đơn ứng tuyển của mình và gợi ý việc làm dựa trên RAG.
- Bên phải là profile của nhà tuyển dụng với các thông tin trong hồ sơ tương tự như ứng viên. Cả hai đều có thể cập nhật thông tin hồ sơ của mình.
- Nút chọn user type sẽ hiện ra khi ứng viên không còn dữ liệu CV và đơn ứng tuyển nào nữa. Còn bên nhà tuyển dụng khi họ không còn dữ liệu nào về công ty và việc làm thì họ cũng có quyền đổi vai trò.
  ![Profile](./images/profile.png)  

### Màn hình công việc đã lưu danh sách ứng tuyển với vai trò ứng viên
- Màn hình bên trái hiển thị các đơn ứng tuyển cho các công việc, nếu nhà tuyển dụng chưa accept thì ứng viên có quyền rút đơn cách bấm withdraw.
- Bên phải là màn hình các công việc đã lưu, khi bấm vào sẽ chuyển qua chi tiết công việc tương ứng.
  ![Job Saved & Job Applied](./images/jobsavedandjobapplied.png)  

### Màn hình quản lý CV với vai trò ứng viên 
- Màn hình này cho phép ứng viên thêm, xóa, sửa và xem lại CV của mình bằng cách tải tệp về máy.
<img src="./images/resumemanagement.jpg" alt="Resume Management" width="40%"/>

### Màn hình gợi ý việc làm với vai trò ứng viên
- Trong dự án, RAG được ứng dụng trong màn hình này bằng cách hiển thị các thông tin công việc phù hợp với CV của ứng viên đã đặt mặc định. Trong tương lai, dự án sẽ phát triển thêm tính năng generate ra các nhận xét về điểm liên quan giữa thông tin công việc và CV.
<img src="./images/ragrecommend.jpg" alt="RAG Recommend" width="40%"/>

### Màn hình đổi mật khẩu  
- Màn hình này cho phép người dùng có thể đổi mật khẩu của họ bằng cách nhập mật khẩu cũ và mới.
<img src="./images/changepassword.jpg" alt="Change Password" width="40%">

### Màn hình trang tạo công ty với vai trò nhà tuyển dụng
- Màn hình trái là danh sách các công ty của nhà tuyển dụng, cho phép tạo và đợi đánh xét duyệt từ admin. Ngoài ra, còn cho phép sửa và xóa công nếu không có công việc được đăng.
- Màn hình bên phải cho phép nhà tuyển dụng nhập các thông tin của công ty và tạo ra công ty mới.
  ![Company Management](./images/companymanagement.png)  

### Màn hình quản lý công việc với vai trò nhà tuyển dụng
- Màn hình bên trái hiển thị danh sách các công việc. Có thể xem được danh sách ứng viên đã ứng tuyển công việc đó, chỉnh sửa công việc và xóa công việc, cũng như lọc theo trạng thái của công việc.
- Màn hình bên phải thể hiện các thông tin của công việc, cho phép nhà tuyển dụng nhập và tạo mới công việc.
  ![Job Management](./images/jobmanagement.png)  

### Màn hình quản lý đơn ứng tuyển với vai trò nhà tuyển dụng
- Màn hình thứ nhất, hiển thị danh sách các ứng viên đã ứng tuyển cho công việc đó. Khi bấm vào đơn ứng tuyển sẽ chuyển qua trang chi tiết đơn ứng tuyển tương ứng.
- Màn hình thứ hai, hiển chi tiết đơn ứng tuyển, cho phép nhà tuyển dụng đọc Cv, từ chối hoặc đồng ý đơn ứng tuyển.
  ![Application Management](./images/applicationmanagement.png)


## Comment

Ứng dụng vẫn đang được phát triển và hoàn thiện hơn, cụ thể như sau:
### 1. Tích hợp các công cụ giao tiếp trực tuyến
- **Chat real-time**: Xây dựng chức năng chat sử dụng **Socket.IO** hoặc **Firebase Realtime Database**.  
- **Phỏng vấn trực tuyến**: Phát triển module video call bằng **WebRTC**, cho phép nhà tuyển dụng và ứng viên trao đổi trực tiếp trên nền tảng.  

### 2. Xây dựng hệ thống thông báo chủ động
- **Push Notification**: Gửi thông báo tức thì đến người dùng khi có cập nhật mới (đơn ứng tuyển, thay đổi trạng thái, gợi ý việc làm mới,...).  

### 3. Hoàn thiện hệ thống RAG với khả năng diễn giải (Explainability)
- Nâng cấp hệ thống gợi ý bằng cách tích hợp **LLM cho tầng "Generation"**.  
- Sau khi **Retrieval** các công việc phù hợp, LLM sẽ nhận **CV + mô tả công việc** → tạo tóm tắt ngắn gọn, chỉ ra những điểm tương đồng về kỹ năng, kinh nghiệm.  
- Giúp ứng viên hiểu rõ **lý do họ được gợi ý công việc**.  

### 4. Mở rộng các tính năng cộng đồng
- Ứng viên có thể **đánh giá công ty**.  
- **Khảo sát mức lương** từ nhiều nguồn.  
- Xây dựng **blog chia sẻ kinh nghiệm tìm việc**. 