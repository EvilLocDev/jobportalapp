import pypdf
import requests
from io import BytesIO
from langchain_google_genai import ChatGoogleGenerativeAI
from django.conf import settings


def extract_text_from_pdf_url(pdf_url):
    try:
        response = requests.get(pdf_url)
        response.raise_for_status()

        pdf_file = BytesIO(response.content)
        pdf_reader = pypdf.PdfReader(pdf_file)

        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""

        return text
    except requests.exceptions.RequestException as e:
        print(f"Error downloading file: {e}")
        return None
    except Exception as e:
        print(f"Error processing PDF file: {e}")
        return None

def generate_job_explanation(cv_summary, job_description):
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        google_api_key=settings.GOOGLE_API_KEY
    )
    prompt = f"""
    Bạn là một AI tư vấn nghề nghiệp. Hãy đánh giá mức độ phù hợp của một ứng viên cho một vị trí công việc dựa trên tóm tắt CV và mô tả công việc (JD).
    Tóm tắt CV của ứng viên:
    {cv_summary}
    Mô tả công việc (JD):
    {job_description}
    Hãy trả về một đối tượng JSON với các key sau:
    - "fit_score": một con số từ 0 đến 100 thể hiện mức độ phù hợp.
    - "matching_skills": một danh sách các kỹ năng của ứng viên khớp với JD.
    - "missing_skills": một danh sách các kỹ năng quan trọng trong JD mà ứng viên có vẻ chưa có.
    - "summary": một đoạn văn (3-5 câu) giải thích tại sao ứng viên phù hợp hoặc chưa phù hợp, và đưa ra lời khuyên.
    Chỉ trả về đối tượng JSON.
    """
    output = llm.invoke(prompt)
    return output