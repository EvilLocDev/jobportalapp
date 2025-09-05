import os
from django.core.management.base import BaseCommand
from django.conf import settings
from ...models import Job
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import GPT4AllEmbeddings
# from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.docstore.document import Document
import re

VECTOR_DB_PATH = os.path.join(settings.BASE_DIR, "vectorstores/job_db_faiss")


def clean_html(raw_html):
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext


class Command(BaseCommand):
    help = 'Builds a FAISS vector database from active job descriptions.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to build job vector database...'))

        # 1. Lấy tất cả các công việc đang hoạt động và chưa hết hạn
        active_jobs = Job.objects.filter(active=True)
        self.stdout.write(f"Found {len(active_jobs)} active jobs.")

        if not active_jobs:
            self.stdout.write(self.style.WARNING('No active jobs to index. Exiting.'))
            return

        # 2. Tạo các documents từ Job model
        documents = []
        for job in active_jobs:
            # Làm sạch nội dung HTML từ RichTextField
            clean_description = clean_html(job.description)

            # Kết hợp các trường văn bản quan trọng để tạo thành một document hoàn chỉnh
            content = f"Chức danh: {job.title}\n" \
                      f"Mô tả: {clean_description}\n" \
                      f"Địa điểm: {job.location}\n" \
                      f"Loại hình: {job.get_job_type_display()}"

            # Tạo một LangChain Document, quan trọng là phải có metadata để biết nó thuộc job nào
            doc = Document(
                page_content=content,
                metadata={'job_id': job.id, 'job_title': job.title}
            )
            documents.append(doc)

        # 3. Cắt nhỏ (Chunking) các documents
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = text_splitter.split_documents(documents)
        self.stdout.write(f"Split {len(documents)} jobs into {len(chunks)} chunks.")

        # 4. Embedding và tạo FAISS index
        model_path = os.path.join(settings.BASE_DIR, "models/all-MiniLM-L6-v2-f16.gguf")
        if not os.path.exists(model_path):
            self.stdout.write(self.style.ERROR(f'Model file not found at {model_path}. Please download it first.'))
            return

        embedding_model = GPT4AllEmbeddings(model_file=model_path)

        self.stdout.write("Creating and saving FAISS index...")
        db = FAISS.from_documents(chunks, embedding_model)

        os.makedirs(os.path.dirname(VECTOR_DB_PATH), exist_ok=True)
        db.save_local(VECTOR_DB_PATH)

        self.stdout.write(self.style.SUCCESS(f'Successfully built and saved vector DB to {VECTOR_DB_PATH}'))