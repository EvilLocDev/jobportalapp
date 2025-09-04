import pypdf
import requests
from io import BytesIO


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