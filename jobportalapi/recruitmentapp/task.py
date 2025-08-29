import tempfile
import requests
import cloudinary.api
import cloudinary.uploader
from celery import shared_task
from langchain_openai import ChatOpenAI
from django.conf import settings
from langchain_google_genai import ChatGoogleGenerativeAI
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
            file_content_url = resume.file.url

            response = requests.get(file_content_url)
            tmp.write(response.content)
            tmp_path = tmp.name

        # 2. Dùng PyPDFLoader để trích xuất text
        loader = PyPDFLoader(tmp_path)
        pages = loader.load_and_split()
        resume_text = " ".join(page.page_content for page in pages)

        resume.extracted_text = resume_text
        resume.save(update_fields=['extracted_text'])

        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=settings.GOOGLE_API_KEY)

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
        resume.save(update_fields=['ai_analysis'])

    except Resume.DoesNotExist:
        print(f"Resume with id {resume_id} not found.")
    except Exception as e:
        print(f"An error occurred while processing resume {resume_id}: {e}")