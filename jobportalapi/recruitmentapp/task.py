import tempfile
import cloudinary.uploader
from celery import shared_task
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_community.document_loaders import PyPDFLoader

from .models import Resume


@shared_task
def process_resume(resume_id):
    try:
        resume = Resume.objects.get(id=resume_id)
        if not resume.file:
            return

        # 1. Tải file PDF từ Cloudinary về một file tạm
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            file_content = cloudinary.api.resource(resume.file.public_id, resource_type='raw')['url']
            import requests
            response = requests.get(file_content)
            tmp.write(response.content)
            tmp_path = tmp.name

        # 2. Dùng PyPDFLoader để trích xuất text
        loader = PyPDFLoader(tmp_path)
        pages = loader.load_and_split()
        resume_text = " ".join(page.page_content for page in pages)

        # Lưu lại text đã trích xuất
        resume.extracted_text = resume_text
        resume.save()

        # 3. Phân tích text bằng LangChain và OpenAI
        llm = ChatOpenAI(model="gpt-4-turbo", temperature=0)  # Hoặc gpt-3.5-turbo để tiết kiệm chi phí

        prompt_template = """
        Bạn là một chuyên gia tuyển dụng nhân sự. Dựa vào nội dung của CV sau đây, hãy trích xuất thông tin và trả về dưới dạng một đối tượng JSON.

        Nội dung CV:
        {resume_text}

        Đối tượng JSON cần có các key sau:
        - "skills": một danh sách các kỹ năng chính (ví dụ: ["Python", "Django", "React", "Project Management"]).
        - "experience_years": tổng số năm kinh nghiệm làm việc (ước tính).
        - "summary": một đoạn văn bản ngắn (3-4 câu) tóm tắt kinh nghiệm và điểm mạnh của ứng viên.

        Chỉ trả về đối tượng JSON, không thêm bất kỳ giải thích nào khác.
        """

        prompt = ChatPromptTemplate.from_template(prompt_template)
        parser = JsonOutputParser()

        chain = prompt | llm | parser

        analysis_result = chain.invoke({"resume_text": resume_text})

        resume.ai_analysis = analysis_result
        resume.save()

    except Resume.DoesNotExist:
        print(f"Resume with id {resume_id} not found.")
    except Exception as e:
        print(f"An error occurred while processing resume {resume_id}: {e}")